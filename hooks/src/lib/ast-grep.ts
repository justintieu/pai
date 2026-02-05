/**
 * ast-grep.ts - Semantic Code Analysis via ast-grep CLI
 *
 * Provides semantic extraction of code structures (functions, classes, imports, exports, types)
 * with ~75-80% token reduction compared to raw source code.
 *
 * Features:
 * - Subprocess interface for running ast-grep patterns
 * - Content-based caching using SHA-256 hash
 * - Regex fallback when ast-grep CLI is not installed
 * - TypeScript types for all extracted structures
 *
 * Usage:
 *   import { analyzeFile, getFileSemantics } from './lib/ast-grep';
 *   const semantics = await getFileSemantics('/path/to/file.ts');
 */

import { createHash } from 'crypto';
import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { spawn } from 'child_process';

// ============================================================================
// Types
// ============================================================================

export interface FunctionSignature {
  name: string;
  params: string[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  docstring?: string;
  startLine: number;
  endLine?: number;
}

export interface ClassDefinition {
  name: string;
  extends?: string;
  implements?: string[];
  isExported: boolean;
  methods: FunctionSignature[];
  properties: PropertyDefinition[];
  docstring?: string;
  startLine: number;
}

export interface PropertyDefinition {
  name: string;
  type?: string;
  isPrivate: boolean;
  isReadonly: boolean;
  isStatic: boolean;
}

export interface ImportStatement {
  source: string;
  specifiers: ImportSpecifier[];
  isTypeOnly: boolean;
  startLine: number;
}

export interface ImportSpecifier {
  name: string;
  alias?: string;
  isDefault: boolean;
  isNamespace: boolean;
}

export interface ExportStatement {
  name: string;
  isDefault: boolean;
  isTypeOnly: boolean;
  kind: 'function' | 'class' | 'variable' | 'type' | 'interface' | 'enum' | 're-export' | 'unknown';
  startLine: number;
}

export interface TypeDefinition {
  name: string;
  kind: 'type' | 'interface' | 'enum';
  isExported: boolean;
  docstring?: string;
  startLine: number;
}

export interface FileSemantics {
  filePath: string;
  language: SupportedLanguage | null;
  contentHash: string;
  analyzedAt: string;
  functions: FunctionSignature[];
  classes: ClassDefinition[];
  imports: ImportStatement[];
  exports: ExportStatement[];
  types: TypeDefinition[];
  lineCount: number;
  tokenEstimate: number;
}

export interface DirectorySemantics {
  directoryPath: string;
  analyzedAt: string;
  files: FileSemantics[];
  summary: DirectorySummary;
}

export interface DirectorySummary {
  totalFiles: number;
  totalFunctions: number;
  totalClasses: number;
  totalTypes: number;
  totalImports: number;
  totalExports: number;
  totalLines: number;
  estimatedTokens: number;
  languageBreakdown: Record<string, number>;
}

export type SupportedLanguage = 'typescript' | 'javascript' | 'python' | 'go' | 'rust';

export interface AstGrepMatch {
  text: string;
  range: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  metaVariables?: Record<string, string>;
}

export interface AnalysisOptions {
  includeDocstrings?: boolean;
  maxDepth?: number;
  excludePatterns?: string[];
  forceRegex?: boolean;
}

// ============================================================================
// Cache
// ============================================================================

interface CacheEntry {
  hash: string;
  semantics: FileSemantics;
  timestamp: number;
}

// In-memory cache with LRU eviction
const cache = new Map<string, CacheEntry>();
const CACHE_MAX_SIZE = 500;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(filePath: string): string {
  return filePath;
}

function getFromCache(filePath: string, contentHash: string): FileSemantics | null {
  const entry = cache.get(getCacheKey(filePath));
  if (!entry) return null;

  // Check hash match and TTL
  if (entry.hash !== contentHash) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(getCacheKey(filePath));
    return null;
  }

  return entry.semantics;
}

function setCache(filePath: string, contentHash: string, semantics: FileSemantics): void {
  // LRU eviction
  if (cache.size >= CACHE_MAX_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(getCacheKey(filePath), {
    hash: contentHash,
    semantics,
    timestamp: Date.now(),
  });
}

export function clearCache(): void {
  cache.clear();
}

// ============================================================================
// Hash Utilities
// ============================================================================

/**
 * Generate SHA-256 hash of content for cache invalidation
 */
export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

// ============================================================================
// ast-grep CLI Detection
// ============================================================================

let astGrepAvailable: boolean | null = null;

/**
 * Check if ast-grep CLI (sg) is available
 */
export async function isAstGrepAvailable(): Promise<boolean> {
  if (astGrepAvailable !== null) return astGrepAvailable;

  return new Promise((resolve) => {
    const proc = spawn('sg', ['--version'], { stdio: 'pipe' });

    proc.on('error', () => {
      astGrepAvailable = false;
      resolve(false);
    });

    proc.on('close', (code) => {
      astGrepAvailable = code === 0;
      resolve(astGrepAvailable);
    });

    // Timeout after 2 seconds
    setTimeout(() => {
      proc.kill();
      astGrepAvailable = false;
      resolve(false);
    }, 2000);
  });
}

// ============================================================================
// ast-grep Pattern Execution
// ============================================================================

/**
 * Run an ast-grep pattern and return matches
 */
async function runAstGrepPattern(
  filePath: string,
  pattern: string,
  language: string
): Promise<AstGrepMatch[]> {
  return new Promise((resolve) => {
    const args = [
      'scan',
      '--pattern', pattern,
      '--lang', language,
      '--json',
      filePath,
    ];

    const proc = spawn('sg', args, { stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('error', () => {
      resolve([]);
    });

    proc.on('close', () => {
      if (!stdout.trim()) {
        resolve([]);
        return;
      }

      try {
        const results = JSON.parse(stdout);
        const matches: AstGrepMatch[] = (results || []).map((r: any) => ({
          text: r.text || '',
          range: {
            start: { line: r.range?.start?.line || 0, column: r.range?.start?.column || 0 },
            end: { line: r.range?.end?.line || 0, column: r.range?.end?.column || 0 },
          },
          metaVariables: r.metaVariables,
        }));
        resolve(matches);
      } catch {
        resolve([]);
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      proc.kill();
      resolve([]);
    }, 10000);
  });
}

// ============================================================================
// Language Detection
// ============================================================================

const LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
};

function detectLanguage(filePath: string): SupportedLanguage | null {
  const ext = extname(filePath).toLowerCase();
  return LANGUAGE_MAP[ext] || null;
}

function getAstGrepLang(language: SupportedLanguage): string {
  switch (language) {
    case 'typescript': return 'typescript';
    case 'javascript': return 'javascript';
    case 'python': return 'python';
    case 'go': return 'go';
    case 'rust': return 'rust';
  }
}

// ============================================================================
// ast-grep Extraction (Primary Method)
// ============================================================================

async function extractWithAstGrep(
  content: string,
  filePath: string,
  language: SupportedLanguage
): Promise<Partial<FileSemantics>> {
  const lang = getAstGrepLang(language);
  const functions: FunctionSignature[] = [];
  const classes: ClassDefinition[] = [];
  const imports: ImportStatement[] = [];
  const exports: ExportStatement[] = [];
  const types: TypeDefinition[] = [];

  // TypeScript/JavaScript patterns
  if (language === 'typescript' || language === 'javascript') {
    // Functions
    const funcPatterns = [
      'function $NAME($$$PARAMS) { $$$BODY }',
      'const $NAME = ($$$PARAMS) => $$$BODY',
      'const $NAME = async ($$$PARAMS) => $$$BODY',
      'async function $NAME($$$PARAMS) { $$$BODY }',
      'export function $NAME($$$PARAMS) { $$$BODY }',
      'export async function $NAME($$$PARAMS) { $$$BODY }',
    ];

    for (const pattern of funcPatterns) {
      const matches = await runAstGrepPattern(filePath, pattern, lang);
      for (const match of matches) {
        const sig = parseTypeScriptFunction(match.text, match.range.start.line);
        if (sig && !functions.some(f => f.name === sig.name && f.startLine === sig.startLine)) {
          functions.push(sig);
        }
      }
    }

    // Classes
    const classMatches = await runAstGrepPattern(filePath, 'class $NAME { $$$BODY }', lang);
    for (const match of classMatches) {
      const cls = parseTypeScriptClass(match.text, match.range.start.line);
      if (cls) classes.push(cls);
    }

    // Imports
    const importMatches = await runAstGrepPattern(filePath, 'import $$$SPEC from "$SOURCE"', lang);
    for (const match of importMatches) {
      const imp = parseTypeScriptImport(match.text, match.range.start.line);
      if (imp) imports.push(imp);
    }

    // Types and Interfaces
    const typePatterns = [
      'type $NAME = $$$DEF',
      'interface $NAME { $$$BODY }',
      'enum $NAME { $$$BODY }',
    ];
    for (const pattern of typePatterns) {
      const matches = await runAstGrepPattern(filePath, pattern, lang);
      for (const match of matches) {
        const typeDef = parseTypeScriptType(match.text, match.range.start.line);
        if (typeDef) types.push(typeDef);
      }
    }

    // Exports
    const exportMatches = await runAstGrepPattern(filePath, 'export $$$SPEC', lang);
    for (const match of exportMatches) {
      const exp = parseTypeScriptExport(match.text, match.range.start.line);
      if (exp) exports.push(exp);
    }
  }

  // Python patterns
  else if (language === 'python') {
    const defMatches = await runAstGrepPattern(filePath, 'def $NAME($$$PARAMS): $$$BODY', lang);
    for (const match of defMatches) {
      const sig = parsePythonFunction(match.text, match.range.start.line);
      if (sig) functions.push(sig);
    }

    const classMatches = await runAstGrepPattern(filePath, 'class $NAME: $$$BODY', lang);
    for (const match of classMatches) {
      const cls = parsePythonClass(match.text, match.range.start.line);
      if (cls) classes.push(cls);
    }

    const importMatches = await runAstGrepPattern(filePath, 'from $MODULE import $$$NAMES', lang);
    for (const match of importMatches) {
      const imp = parsePythonImport(match.text, match.range.start.line);
      if (imp) imports.push(imp);
    }
  }

  return { functions, classes, imports, exports, types };
}

// ============================================================================
// Regex Fallback Extraction
// ============================================================================

function extractWithRegex(content: string, language: SupportedLanguage): Partial<FileSemantics> {
  const functions: FunctionSignature[] = [];
  const classes: ClassDefinition[] = [];
  const imports: ImportStatement[] = [];
  const exports: ExportStatement[] = [];
  const types: TypeDefinition[] = [];

  const lines = content.split('\n');

  if (language === 'typescript' || language === 'javascript') {
    // Function patterns
    const funcPatterns = [
      /^(\s*)(export\s+)?(async\s+)?function\s+(\w+)\s*(<[^>]+>)?\s*\(([^)]*)\)(?:\s*:\s*([^\{]+))?\s*\{/,
      /^(\s*)(export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*(async\s+)?\(([^)]*)\)(?:\s*:\s*([^\=]+))?\s*=>/,
      /^(\s*)(export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*(async\s+)?function\s*\(([^)]*)\)/,
    ];

    // Class pattern
    const classPattern = /^(\s*)(export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?\s*\{/;

    // Import patterns
    const importPatterns = [
      /^import\s+(?:type\s+)?(\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/,
      /^import\s+(\w+)\s*,\s*(\{[^}]+\})\s+from\s+['"]([^'"]+)['"]/,
    ];

    // Type/Interface patterns
    const typePatterns = [
      /^(\s*)(export\s+)?type\s+(\w+)(?:<[^>]+>)?\s*=/,
      /^(\s*)(export\s+)?interface\s+(\w+)(?:<[^>]+>)?\s*(?:extends\s+[^{]+)?\{/,
      /^(\s*)(export\s+)?enum\s+(\w+)\s*\{/,
    ];

    // Export patterns
    const exportPatterns = [
      /^export\s+default\s+(\w+)/,
      /^export\s+\{\s*([^}]+)\s*\}/,
      /^export\s+\*\s+from\s+['"]([^'"]+)['"]/,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Check function patterns
      // Pattern 0: /^(\s*)(export\s+)?(async\s+)?function\s+(\w+)...
      // Pattern 1: /^(\s*)(export\s+)?const\s+(\w+)...(async\s+)?\(...
      // Pattern 2: /^(\s*)(export\s+)?const\s+(\w+)...(async\s+)?function...
      for (let pIdx = 0; pIdx < funcPatterns.length; pIdx++) {
        const pattern = funcPatterns[pIdx];
        const match = line.match(pattern);
        if (match) {
          let isExported: boolean;
          let isAsync: boolean;
          let name: string;
          let paramsStr: string;
          let returnType: string | undefined;

          if (pIdx === 0) {
            // function declaration: groups are (indent)(export)(async)name(generics)(params)(return)
            isExported = !!match[2];
            isAsync = !!match[3];
            name = match[4];
            paramsStr = match[6] || '';
            returnType = match[7]?.trim();
          } else {
            // const arrow/function: groups are (indent)(export)name(async)(params)(return)
            isExported = !!match[2];
            name = match[3];
            isAsync = !!match[4];
            paramsStr = match[5] || '';
            returnType = match[6]?.trim();
          }

          if (name && !name.startsWith('_')) {
            functions.push({
              name,
              params: parseParams(paramsStr),
              returnType,
              isAsync,
              isExported,
              startLine: lineNum,
            });
          }
          break;
        }
      }

      // Check class pattern
      const classMatch = line.match(classPattern);
      if (classMatch) {
        const isExported = !!classMatch[2];
        const name = classMatch[3];
        const extendsClass = classMatch[4];
        const implementsStr = classMatch[5];

        classes.push({
          name,
          extends: extendsClass,
          implements: implementsStr?.split(',').map(s => s.trim()),
          isExported,
          methods: [],
          properties: [],
          startLine: lineNum,
        });
      }

      // Check import patterns
      for (const pattern of importPatterns) {
        const match = line.match(pattern);
        if (match) {
          const isTypeOnly = line.includes('import type');
          let source: string;
          let specifiersStr: string;

          if (match[3]) {
            // Pattern with default + named imports
            source = match[3];
            specifiersStr = match[1] + ',' + match[2];
          } else {
            source = match[2];
            specifiersStr = match[1];
          }

          imports.push({
            source,
            specifiers: parseImportSpecifiers(specifiersStr),
            isTypeOnly,
            startLine: lineNum,
          });
          break;
        }
      }

      // Check type patterns
      for (const pattern of typePatterns) {
        const match = line.match(pattern);
        if (match) {
          const isExported = !!match[2];
          const name = match[3];
          let kind: 'type' | 'interface' | 'enum' = 'type';
          if (line.includes('interface')) kind = 'interface';
          else if (line.includes('enum')) kind = 'enum';

          types.push({
            name,
            kind,
            isExported,
            startLine: lineNum,
          });
          break;
        }
      }

      // Check export patterns
      for (const pattern of exportPatterns) {
        const match = line.match(pattern);
        if (match) {
          if (pattern.source.includes('default')) {
            exports.push({
              name: match[1],
              isDefault: true,
              isTypeOnly: false,
              kind: 'unknown',
              startLine: lineNum,
            });
          } else if (pattern.source.includes('\\*')) {
            exports.push({
              name: `* from ${match[1]}`,
              isDefault: false,
              isTypeOnly: false,
              kind: 're-export',
              startLine: lineNum,
            });
          } else {
            const names = match[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]);
            for (const name of names) {
              exports.push({
                name,
                isDefault: false,
                isTypeOnly: line.includes('export type'),
                kind: 'unknown',
                startLine: lineNum,
              });
            }
          }
          break;
        }
      }
    }
  } else if (language === 'python') {
    const funcPattern = /^(\s*)(async\s+)?def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?\s*:/;
    const classPattern = /^(\s*)class\s+(\w+)(?:\(([^)]*)\))?\s*:/;
    const importPatterns = [
      /^from\s+([\w.]+)\s+import\s+(.+)$/,
      /^import\s+([\w.,\s]+)$/,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      const funcMatch = line.match(funcPattern);
      if (funcMatch) {
        const indent = funcMatch[1].length;
        const isAsync = !!funcMatch[2];
        const name = funcMatch[3];
        const paramsStr = funcMatch[4];
        const returnType = funcMatch[5]?.trim();

        if (!name.startsWith('_') || name === '__init__') {
          functions.push({
            name,
            params: parsePythonParams(paramsStr),
            returnType,
            isAsync,
            isExported: indent === 0,
            startLine: lineNum,
          });
        }
      }

      const classMatch = line.match(classPattern);
      if (classMatch) {
        const indent = classMatch[1].length;
        const name = classMatch[2];
        const bases = classMatch[3];

        classes.push({
          name,
          extends: bases?.split(',')[0]?.trim(),
          isExported: indent === 0,
          methods: [],
          properties: [],
          startLine: lineNum,
        });
      }

      for (const pattern of importPatterns) {
        const match = line.match(pattern);
        if (match) {
          if (pattern.source.includes('from')) {
            imports.push({
              source: match[1],
              specifiers: match[2].split(',').map(s => ({
                name: s.trim().split(/\s+as\s+/)[0],
                alias: s.includes(' as ') ? s.split(/\s+as\s+/)[1]?.trim() : undefined,
                isDefault: false,
                isNamespace: false,
              })),
              isTypeOnly: false,
              startLine: lineNum,
            });
          } else {
            const modules = match[1].split(',').map(s => s.trim());
            for (const mod of modules) {
              imports.push({
                source: mod.split(/\s+as\s+/)[0],
                specifiers: [{
                  name: mod.split(/\s+as\s+/)[0],
                  alias: mod.includes(' as ') ? mod.split(/\s+as\s+/)[1] : undefined,
                  isDefault: true,
                  isNamespace: false,
                }],
                isTypeOnly: false,
                startLine: lineNum,
              });
            }
          }
          break;
        }
      }
    }
  }

  return { functions, classes, imports, exports, types };
}

// ============================================================================
// Parsing Helpers
// ============================================================================

function parseParams(paramsStr: string): string[] {
  if (!paramsStr.trim()) return [];
  return paramsStr
    .split(',')
    .map(p => p.trim().split(':')[0].split('=')[0].trim())
    .filter(p => p && !p.startsWith('...'));
}

function parsePythonParams(paramsStr: string): string[] {
  if (!paramsStr.trim()) return [];
  return paramsStr
    .split(',')
    .map(p => p.trim().split(':')[0].split('=')[0].trim())
    .filter(p => p && p !== 'self' && p !== 'cls' && !p.startsWith('*'));
}

function parseImportSpecifiers(specifiersStr: string): ImportSpecifier[] {
  const specifiers: ImportSpecifier[] = [];

  // Handle namespace import
  if (specifiersStr.includes('* as')) {
    const match = specifiersStr.match(/\*\s+as\s+(\w+)/);
    if (match) {
      specifiers.push({
        name: '*',
        alias: match[1],
        isDefault: false,
        isNamespace: true,
      });
    }
    return specifiers;
  }

  // Handle default import
  const defaultMatch = specifiersStr.match(/^(\w+)(?:,|$)/);
  if (defaultMatch && !specifiersStr.startsWith('{')) {
    specifiers.push({
      name: defaultMatch[1],
      isDefault: true,
      isNamespace: false,
    });
  }

  // Handle named imports
  const namedMatch = specifiersStr.match(/\{([^}]+)\}/);
  if (namedMatch) {
    const names = namedMatch[1].split(',');
    for (const name of names) {
      const parts = name.trim().split(/\s+as\s+/);
      specifiers.push({
        name: parts[0].trim(),
        alias: parts[1]?.trim(),
        isDefault: false,
        isNamespace: false,
      });
    }
  }

  return specifiers;
}

function parseTypeScriptFunction(text: string, startLine: number): FunctionSignature | null {
  const match = text.match(/(export\s+)?(async\s+)?function\s+(\w+)\s*(<[^>]+>)?\s*\(([^)]*)\)(?:\s*:\s*([^\{]+))?/);
  if (match) {
    return {
      name: match[3],
      params: parseParams(match[5]),
      returnType: match[6]?.trim(),
      isAsync: !!match[2],
      isExported: !!match[1],
      startLine,
    };
  }

  const arrowMatch = text.match(/(export\s+)?const\s+(\w+)\s*(?::\s*[^=]+)?\s*=\s*(async\s+)?\(([^)]*)\)(?:\s*:\s*([^\=]+))?\s*=>/);
  if (arrowMatch) {
    return {
      name: arrowMatch[2],
      params: parseParams(arrowMatch[4]),
      returnType: arrowMatch[5]?.trim(),
      isAsync: !!arrowMatch[3],
      isExported: !!arrowMatch[1],
      startLine,
    };
  }

  return null;
}

function parseTypeScriptClass(text: string, startLine: number): ClassDefinition | null {
  const match = text.match(/(export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?\s*\{/);
  if (match) {
    return {
      name: match[2],
      extends: match[3],
      implements: match[4]?.split(',').map(s => s.trim()),
      isExported: !!match[1],
      methods: [],
      properties: [],
      startLine,
    };
  }
  return null;
}

function parseTypeScriptImport(text: string, startLine: number): ImportStatement | null {
  const match = text.match(/import\s+(?:type\s+)?(.+?)\s+from\s+['"]([^'"]+)['"]/);
  if (match) {
    return {
      source: match[2],
      specifiers: parseImportSpecifiers(match[1]),
      isTypeOnly: text.includes('import type'),
      startLine,
    };
  }
  return null;
}

function parseTypeScriptType(text: string, startLine: number): TypeDefinition | null {
  let kind: 'type' | 'interface' | 'enum' = 'type';
  let name = '';
  let isExported = text.includes('export');

  if (text.includes('interface')) {
    kind = 'interface';
    const match = text.match(/interface\s+(\w+)/);
    if (match) name = match[1];
  } else if (text.includes('enum')) {
    kind = 'enum';
    const match = text.match(/enum\s+(\w+)/);
    if (match) name = match[1];
  } else {
    const match = text.match(/type\s+(\w+)/);
    if (match) name = match[1];
  }

  if (name) {
    return { name, kind, isExported, startLine };
  }
  return null;
}

function parseTypeScriptExport(text: string, startLine: number): ExportStatement | null {
  if (text.match(/export\s+default/)) {
    const match = text.match(/export\s+default\s+(\w+)/);
    return {
      name: match?.[1] || 'default',
      isDefault: true,
      isTypeOnly: false,
      kind: 'unknown',
      startLine,
    };
  }

  const namedMatch = text.match(/export\s+\{\s*([^}]+)\s*\}/);
  if (namedMatch) {
    const name = namedMatch[1].split(',')[0].trim().split(/\s+as\s+/)[0];
    return {
      name,
      isDefault: false,
      isTypeOnly: text.includes('export type'),
      kind: 'unknown',
      startLine,
    };
  }

  return null;
}

function parsePythonFunction(text: string, startLine: number): FunctionSignature | null {
  const match = text.match(/(async\s+)?def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?/);
  if (match) {
    return {
      name: match[2],
      params: parsePythonParams(match[3]),
      returnType: match[4]?.trim(),
      isAsync: !!match[1],
      isExported: true,
      startLine,
    };
  }
  return null;
}

function parsePythonClass(text: string, startLine: number): ClassDefinition | null {
  const match = text.match(/class\s+(\w+)(?:\(([^)]*)\))?/);
  if (match) {
    return {
      name: match[1],
      extends: match[2]?.split(',')[0]?.trim(),
      isExported: true,
      methods: [],
      properties: [],
      startLine,
    };
  }
  return null;
}

function parsePythonImport(text: string, startLine: number): ImportStatement | null {
  const match = text.match(/from\s+([\w.]+)\s+import\s+(.+)/);
  if (match) {
    return {
      source: match[1],
      specifiers: match[2].split(',').map(s => ({
        name: s.trim().split(/\s+as\s+/)[0],
        alias: s.includes(' as ') ? s.split(/\s+as\s+/)[1]?.trim() : undefined,
        isDefault: false,
        isNamespace: false,
      })),
      isTypeOnly: false,
      startLine,
    };
  }
  return null;
}

// ============================================================================
// Token Estimation
// ============================================================================

/**
 * Estimate token count for semantic data (very approximate)
 * Semantic representation is ~75-80% smaller than raw source
 */
function estimateTokens(semantics: Partial<FileSemantics>): number {
  let tokens = 0;

  // ~10 tokens per function signature
  tokens += (semantics.functions?.length || 0) * 10;

  // ~15 tokens per class
  tokens += (semantics.classes?.length || 0) * 15;

  // ~5 tokens per import
  tokens += (semantics.imports?.length || 0) * 5;

  // ~3 tokens per export
  tokens += (semantics.exports?.length || 0) * 3;

  // ~8 tokens per type definition
  tokens += (semantics.types?.length || 0) * 8;

  return tokens;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Analyze a single file and extract semantic information
 */
export async function analyzeFile(
  filePath: string,
  options: AnalysisOptions = {}
): Promise<FileSemantics | null> {
  if (!existsSync(filePath)) {
    return null;
  }

  const stat = statSync(filePath);
  if (!stat.isFile()) {
    return null;
  }

  const language = detectLanguage(filePath);
  if (!language) {
    return null;
  }

  const content = readFileSync(filePath, 'utf-8');
  const contentHash = hashContent(content);

  // Check cache
  const cached = getFromCache(filePath, contentHash);
  if (cached) {
    return cached;
  }

  // Extract semantics
  let extracted: Partial<FileSemantics>;

  const useAstGrep = !options.forceRegex && await isAstGrepAvailable();

  if (useAstGrep) {
    extracted = await extractWithAstGrep(content, filePath, language);
  } else {
    extracted = extractWithRegex(content, language);
  }

  const lineCount = content.split('\n').length;
  const tokenEstimate = estimateTokens(extracted);

  const semantics: FileSemantics = {
    filePath,
    language,
    contentHash,
    analyzedAt: new Date().toISOString(),
    functions: extracted.functions || [],
    classes: extracted.classes || [],
    imports: extracted.imports || [],
    exports: extracted.exports || [],
    types: extracted.types || [],
    lineCount,
    tokenEstimate,
  };

  // Cache result
  setCache(filePath, contentHash, semantics);

  return semantics;
}

/**
 * Analyze all supported files in a directory
 */
export async function analyzeDirectory(
  directoryPath: string,
  options: AnalysisOptions = {}
): Promise<DirectorySemantics | null> {
  if (!existsSync(directoryPath)) {
    return null;
  }

  const stat = statSync(directoryPath);
  if (!stat.isDirectory()) {
    return null;
  }

  const excludePatterns = options.excludePatterns || [
    'node_modules',
    '.git',
    'dist',
    'build',
    '__pycache__',
    '.venv',
    'venv',
  ];

  const files: FileSemantics[] = [];
  const maxDepth = options.maxDepth ?? 10;

  async function walkDirectory(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Check exclusions
      if (excludePatterns.some(p => entry.name === p || fullPath.includes(`/${p}/`))) {
        continue;
      }

      if (entry.isDirectory()) {
        await walkDirectory(fullPath, depth + 1);
      } else if (entry.isFile()) {
        const semantics = await analyzeFile(fullPath, options);
        if (semantics) {
          files.push(semantics);
        }
      }
    }
  }

  await walkDirectory(directoryPath, 0);

  // Calculate summary
  const summary: DirectorySummary = {
    totalFiles: files.length,
    totalFunctions: files.reduce((sum, f) => sum + f.functions.length, 0),
    totalClasses: files.reduce((sum, f) => sum + f.classes.length, 0),
    totalTypes: files.reduce((sum, f) => sum + f.types.length, 0),
    totalImports: files.reduce((sum, f) => sum + f.imports.length, 0),
    totalExports: files.reduce((sum, f) => sum + f.exports.length, 0),
    totalLines: files.reduce((sum, f) => sum + f.lineCount, 0),
    estimatedTokens: files.reduce((sum, f) => sum + f.tokenEstimate, 0),
    languageBreakdown: {},
  };

  for (const file of files) {
    if (file.language) {
      summary.languageBreakdown[file.language] = (summary.languageBreakdown[file.language] || 0) + 1;
    }
  }

  return {
    directoryPath,
    analyzedAt: new Date().toISOString(),
    files,
    summary,
  };
}

/**
 * Get formatted semantic summary for a file (for LLM consumption)
 */
export async function getFileSemantics(
  filePath: string,
  options: AnalysisOptions = {}
): Promise<string> {
  const semantics = await analyzeFile(filePath, options);

  if (!semantics) {
    return `Unable to analyze: ${filePath}`;
  }

  const lines: string[] = [];

  lines.push(`## ${basename(filePath)} (${semantics.language})`);
  lines.push(`Lines: ${semantics.lineCount} | Tokens: ~${semantics.tokenEstimate}`);
  lines.push('');

  // Imports
  if (semantics.imports.length > 0) {
    lines.push('### Imports');
    for (const imp of semantics.imports) {
      const specs = imp.specifiers.map(s => s.alias ? `${s.name} as ${s.alias}` : s.name).join(', ');
      lines.push(`- ${imp.source}: ${specs}`);
    }
    lines.push('');
  }

  // Types
  if (semantics.types.length > 0) {
    lines.push('### Types');
    for (const t of semantics.types) {
      const exported = t.isExported ? 'export ' : '';
      lines.push(`- ${exported}${t.kind} ${t.name}`);
    }
    lines.push('');
  }

  // Classes
  if (semantics.classes.length > 0) {
    lines.push('### Classes');
    for (const cls of semantics.classes) {
      const exported = cls.isExported ? 'export ' : '';
      const ext = cls.extends ? ` extends ${cls.extends}` : '';
      const impl = cls.implements?.length ? ` implements ${cls.implements.join(', ')}` : '';
      lines.push(`- ${exported}class ${cls.name}${ext}${impl}`);
    }
    lines.push('');
  }

  // Functions
  if (semantics.functions.length > 0) {
    lines.push('### Functions');
    for (const fn of semantics.functions) {
      const exported = fn.isExported ? 'export ' : '';
      const async = fn.isAsync ? 'async ' : '';
      const params = fn.params.join(', ');
      const ret = fn.returnType ? `: ${fn.returnType}` : '';
      lines.push(`- ${exported}${async}${fn.name}(${params})${ret}`);
    }
    lines.push('');
  }

  // Exports
  if (semantics.exports.length > 0) {
    const nonFunctionExports = semantics.exports.filter(
      e => !semantics.functions.some(f => f.name === e.name)
    );
    if (nonFunctionExports.length > 0) {
      lines.push('### Exports');
      for (const exp of nonFunctionExports) {
        const def = exp.isDefault ? 'default ' : '';
        lines.push(`- ${def}${exp.name}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Get formatted semantic summary for a directory (for LLM consumption)
 */
export async function getDirectorySemantics(
  directoryPath: string,
  options: AnalysisOptions = {}
): Promise<string> {
  const semantics = await analyzeDirectory(directoryPath, options);

  if (!semantics) {
    return `Unable to analyze: ${directoryPath}`;
  }

  const lines: string[] = [];

  lines.push(`# Directory: ${basename(directoryPath)}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Files: ${semantics.summary.totalFiles}`);
  lines.push(`- Lines: ${semantics.summary.totalLines}`);
  lines.push(`- Estimated Tokens: ~${semantics.summary.estimatedTokens}`);
  lines.push(`- Functions: ${semantics.summary.totalFunctions}`);
  lines.push(`- Classes: ${semantics.summary.totalClasses}`);
  lines.push(`- Types: ${semantics.summary.totalTypes}`);
  lines.push('');

  lines.push('## Languages');
  for (const [lang, count] of Object.entries(semantics.summary.languageBreakdown)) {
    lines.push(`- ${lang}: ${count} files`);
  }
  lines.push('');

  lines.push('## Files');
  for (const file of semantics.files) {
    const relPath = file.filePath.replace(directoryPath, '').replace(/^\//, '');
    lines.push(`\n### ${relPath}`);

    if (file.functions.length > 0) {
      lines.push('Functions:');
      for (const fn of file.functions.slice(0, 10)) {
        const exported = fn.isExported ? 'export ' : '';
        const async = fn.isAsync ? 'async ' : '';
        lines.push(`  - ${exported}${async}${fn.name}(${fn.params.join(', ')})`);
      }
      if (file.functions.length > 10) {
        lines.push(`  ... and ${file.functions.length - 10} more`);
      }
    }

    if (file.classes.length > 0) {
      lines.push('Classes:');
      for (const cls of file.classes) {
        lines.push(`  - ${cls.name}`);
      }
    }

    if (file.types.length > 0) {
      lines.push('Types:');
      for (const t of file.types.slice(0, 5)) {
        lines.push(`  - ${t.kind} ${t.name}`);
      }
      if (file.types.length > 5) {
        lines.push(`  ... and ${file.types.length - 5} more`);
      }
    }
  }

  return lines.join('\n');
}
