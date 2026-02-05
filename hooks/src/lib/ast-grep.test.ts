/**
 * ast-grep.test.ts - Tests for semantic code analysis
 */

import { describe, test, expect } from 'bun:test';
import {
  analyzeFile,
  analyzeDirectory,
  getFileSemantics,
  getDirectorySemantics,
  hashContent,
  isAstGrepAvailable,
  clearCache,
} from './ast-grep';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const TEST_DIR = join(tmpdir(), 'ast-grep-test-' + Date.now());

// Setup test directory
function setup() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true });
  }
  mkdirSync(TEST_DIR, { recursive: true });
}

// Cleanup test directory
function cleanup() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true });
  }
}

describe('ast-grep wrapper', () => {
  test('hashContent generates consistent hashes', () => {
    const content = 'const x = 1;';
    const hash1 = hashContent(content);
    const hash2 = hashContent(content);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(16);
  });

  test('hashContent generates different hashes for different content', () => {
    const hash1 = hashContent('const x = 1;');
    const hash2 = hashContent('const x = 2;');
    expect(hash1).not.toBe(hash2);
  });

  test('isAstGrepAvailable returns boolean', async () => {
    const available = await isAstGrepAvailable();
    expect(typeof available).toBe('boolean');
  });
});

describe('analyzeFile', () => {
  test('extracts TypeScript functions', async () => {
    setup();
    const filePath = join(TEST_DIR, 'test.ts');
    writeFileSync(filePath, `
export function greet(name: string): string {
  return 'Hello, ' + name;
}

export async function fetchData(url: string): Promise<Response> {
  return fetch(url);
}

const privateFunc = () => {};
`);

    const result = await analyzeFile(filePath);

    expect(result).not.toBeNull();
    expect(result!.functions.length).toBeGreaterThanOrEqual(2);

    const greet = result!.functions.find(f => f.name === 'greet');
    expect(greet).toBeDefined();
    expect(greet!.isExported).toBe(true);
    expect(greet!.isAsync).toBe(false);
    expect(greet!.params).toContain('name');

    const fetchData = result!.functions.find(f => f.name === 'fetchData');
    expect(fetchData).toBeDefined();
    expect(fetchData!.isAsync).toBe(true);

    cleanup();
  });

  test('extracts TypeScript classes', async () => {
    setup();
    const filePath = join(TEST_DIR, 'class.ts');
    writeFileSync(filePath, `
export class MyService extends BaseService implements IService {
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}

class PrivateClass {}
`);

    const result = await analyzeFile(filePath);

    expect(result).not.toBeNull();
    expect(result!.classes.length).toBeGreaterThanOrEqual(1);

    const myService = result!.classes.find(c => c.name === 'MyService');
    expect(myService).toBeDefined();
    expect(myService!.isExported).toBe(true);
    expect(myService!.extends).toBe('BaseService');

    cleanup();
  });

  test('extracts TypeScript imports', async () => {
    setup();
    const filePath = join(TEST_DIR, 'imports.ts');
    writeFileSync(filePath, `
import { readFile, writeFile } from 'fs';
import path from 'path';
import type { Config } from './types';
import * as utils from './utils';
`);

    const result = await analyzeFile(filePath);

    expect(result).not.toBeNull();
    expect(result!.imports.length).toBeGreaterThanOrEqual(3);

    const fsImport = result!.imports.find(i => i.source === 'fs');
    expect(fsImport).toBeDefined();
    expect(fsImport!.specifiers.some(s => s.name === 'readFile')).toBe(true);

    cleanup();
  });

  test('extracts TypeScript types and interfaces', async () => {
    setup();
    const filePath = join(TEST_DIR, 'types.ts');
    writeFileSync(filePath, `
export type UserId = string;

export interface User {
  id: UserId;
  name: string;
}

export enum Status {
  Active,
  Inactive,
}

type PrivateType = number;
`);

    const result = await analyzeFile(filePath);

    expect(result).not.toBeNull();
    expect(result!.types.length).toBeGreaterThanOrEqual(3);

    const userId = result!.types.find(t => t.name === 'UserId');
    expect(userId).toBeDefined();
    expect(userId!.kind).toBe('type');
    expect(userId!.isExported).toBe(true);

    const user = result!.types.find(t => t.name === 'User');
    expect(user).toBeDefined();
    expect(user!.kind).toBe('interface');

    const status = result!.types.find(t => t.name === 'Status');
    expect(status).toBeDefined();
    expect(status!.kind).toBe('enum');

    cleanup();
  });

  test('returns null for unsupported file types', async () => {
    setup();
    const filePath = join(TEST_DIR, 'test.txt');
    writeFileSync(filePath, 'Hello, world!');

    const result = await analyzeFile(filePath);
    expect(result).toBeNull();

    cleanup();
  });

  test('returns null for non-existent files', async () => {
    const result = await analyzeFile('/nonexistent/file.ts');
    expect(result).toBeNull();
  });

  test('caches results correctly', async () => {
    setup();
    clearCache();

    const filePath = join(TEST_DIR, 'cached.ts');
    writeFileSync(filePath, 'export const x = 1;');

    const result1 = await analyzeFile(filePath);
    const result2 = await analyzeFile(filePath);

    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();
    expect(result1!.contentHash).toBe(result2!.contentHash);

    cleanup();
  });
});

describe('analyzeDirectory', () => {
  test('analyzes multiple files in directory', async () => {
    setup();

    writeFileSync(join(TEST_DIR, 'a.ts'), 'export function a() {}');
    writeFileSync(join(TEST_DIR, 'b.ts'), 'export function b() {}');
    mkdirSync(join(TEST_DIR, 'sub'));
    writeFileSync(join(TEST_DIR, 'sub', 'c.ts'), 'export function c() {}');

    const result = await analyzeDirectory(TEST_DIR);

    expect(result).not.toBeNull();
    expect(result!.files.length).toBe(3);
    expect(result!.summary.totalFunctions).toBe(3);

    cleanup();
  });

  test('excludes node_modules by default', async () => {
    setup();

    writeFileSync(join(TEST_DIR, 'main.ts'), 'export function main() {}');
    mkdirSync(join(TEST_DIR, 'node_modules', 'pkg'), { recursive: true });
    writeFileSync(join(TEST_DIR, 'node_modules', 'pkg', 'index.ts'), 'export function pkg() {}');

    const result = await analyzeDirectory(TEST_DIR);

    expect(result).not.toBeNull();
    expect(result!.files.length).toBe(1);
    expect(result!.files[0].filePath).toContain('main.ts');

    cleanup();
  });
});

describe('getFileSemantics', () => {
  test('returns formatted summary', async () => {
    setup();
    const filePath = join(TEST_DIR, 'formatted.ts');
    writeFileSync(filePath, `
import { join } from 'path';

export interface Config {
  name: string;
}

export function process(config: Config): void {
  console.log(config.name);
}
`);

    const summary = await getFileSemantics(filePath);

    expect(summary).toContain('formatted.ts');
    expect(summary).toContain('typescript');
    expect(summary).toContain('Imports');
    expect(summary).toContain('path');
    expect(summary).toContain('Functions');
    expect(summary).toContain('process');
    expect(summary).toContain('Types');
    expect(summary).toContain('Config');

    cleanup();
  });
});

describe('getDirectorySemantics', () => {
  test('returns formatted directory summary', async () => {
    setup();

    writeFileSync(join(TEST_DIR, 'x.ts'), 'export function x() {}');
    writeFileSync(join(TEST_DIR, 'y.ts'), 'export function y() {}');

    const summary = await getDirectorySemantics(TEST_DIR);

    expect(summary).toContain('Directory:');
    expect(summary).toContain('Summary');
    expect(summary).toContain('Files: 2');
    expect(summary).toContain('typescript');

    cleanup();
  });
});

describe('Python support', () => {
  test('extracts Python functions', async () => {
    setup();
    const filePath = join(TEST_DIR, 'test.py');
    writeFileSync(filePath, `
def greet(name: str) -> str:
    return f"Hello, {name}"

async def fetch_data(url: str):
    pass

def _private_func():
    pass
`);

    const result = await analyzeFile(filePath);

    expect(result).not.toBeNull();
    expect(result!.language).toBe('python');
    expect(result!.functions.length).toBeGreaterThanOrEqual(2);

    const greet = result!.functions.find(f => f.name === 'greet');
    expect(greet).toBeDefined();
    expect(greet!.params).toContain('name');

    const fetchData = result!.functions.find(f => f.name === 'fetch_data');
    expect(fetchData).toBeDefined();
    expect(fetchData!.isAsync).toBe(true);

    cleanup();
  });

  test('extracts Python classes', async () => {
    setup();
    const filePath = join(TEST_DIR, 'classes.py');
    writeFileSync(filePath, `
class MyClass(BaseClass):
    def __init__(self, name):
        self.name = name

    def get_name(self):
        return self.name
`);

    const result = await analyzeFile(filePath);

    expect(result).not.toBeNull();
    expect(result!.classes.length).toBeGreaterThanOrEqual(1);

    const myClass = result!.classes.find(c => c.name === 'MyClass');
    expect(myClass).toBeDefined();
    expect(myClass!.extends).toBe('BaseClass');

    cleanup();
  });

  test('extracts Python imports', async () => {
    setup();
    const filePath = join(TEST_DIR, 'imports.py');
    writeFileSync(filePath, `
from os import path, getcwd
from typing import List, Dict
import json
import sys as system
`);

    const result = await analyzeFile(filePath);

    expect(result).not.toBeNull();
    expect(result!.imports.length).toBeGreaterThanOrEqual(3);

    const osImport = result!.imports.find(i => i.source === 'os');
    expect(osImport).toBeDefined();
    expect(osImport!.specifiers.some(s => s.name === 'path')).toBe(true);

    cleanup();
  });
});

describe('token estimation', () => {
  test('estimates tokens correctly', async () => {
    setup();
    const filePath = join(TEST_DIR, 'large.ts');
    const content = `
export interface Config { name: string; value: number; }
export type Id = string;
export function process(config: Config): void {}
export function transform(data: any): any {}
export class Service { run() {} }
`;
    writeFileSync(filePath, content);

    const result = await analyzeFile(filePath);

    expect(result).not.toBeNull();
    expect(result!.tokenEstimate).toBeGreaterThan(0);
    expect(result!.tokenEstimate).toBeLessThan(result!.lineCount * 10); // Much less than raw

    cleanup();
  });
});
