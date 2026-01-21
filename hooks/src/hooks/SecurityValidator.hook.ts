#!/usr/bin/env bun
/**
 * SecurityValidator.hook.ts - Security Validation for Tool Calls (PreToolUse)
 *
 * PURPOSE:
 * Validates Bash commands and file operations against security patterns before
 * execution. Prevents accidental or malicious operations that could damage the
 * system, expose secrets, or compromise security.
 *
 * TRIGGER: PreToolUse (matcher: Bash, Edit, Write, Read)
 *
 * INPUT:
 * - tool_name: "Bash" | "Edit" | "Write" | "Read"
 * - tool_input: { command?: string, file_path?: string, ... }
 * - session_id: Current session identifier
 *
 * OUTPUT:
 * - stdout: JSON decision object
 *   - {"continue": true} → Allow operation
 *   - {"decision": "ask", "message": "..."} → Prompt user for confirmation
 * - exit(0): Normal completion (with decision)
 * - exit(2): Hard block (catastrophic operation prevented)
 *
 * SIDE EFFECTS:
 * - Writes to: memory/security/YYYY/MM/security-{summary}-{timestamp}.jsonl
 * - User prompt: May trigger confirmation dialog for confirm-level operations
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { paiPath } from '../lib/paths';

// ========================================
// Security Event Logging
// ========================================

interface SecurityEvent {
  timestamp: string;
  session_id: string;
  event_type: 'block' | 'confirm' | 'alert' | 'allow';
  tool: string;
  category: 'bash_command' | 'path_access';
  target: string;
  pattern_matched?: string;
  reason?: string;
  action_taken: string;
}

function generateEventSummary(event: SecurityEvent): string {
  const eventWord = event.event_type;
  const source = event.reason || event.target || 'unknown';
  const words = source
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1)
    .slice(0, 5);

  return [eventWord, ...words].join('-');
}

function getSecurityLogPath(event: SecurityEvent): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const min = now.getMinutes().toString().padStart(2, '0');
  const sec = now.getSeconds().toString().padStart(2, '0');

  const summary = generateEventSummary(event);
  const timestamp = `${year}${month}${day}-${hour}${min}${sec}`;

  return paiPath('memory', 'security', year, month, `security-${summary}-${timestamp}.jsonl`);
}

function logSecurityEvent(event: SecurityEvent): void {
  try {
    const logPath = getSecurityLogPath(event);
    const dir = logPath.substring(0, logPath.lastIndexOf('/'));

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const content = JSON.stringify(event, null, 2);
    writeFileSync(logPath, content);
  } catch {
    console.error('Warning: Failed to log security event');
  }
}

// ========================================
// Types
// ========================================

interface HookInput {
  session_id: string;
  tool_name: string;
  tool_input: Record<string, unknown> | string;
}

interface Pattern {
  pattern: string;
  reason: string;
}

interface PatternsConfig {
  bash: {
    blocked: Pattern[];
    confirm: Pattern[];
    alert: Pattern[];
  };
  paths: {
    zeroAccess: string[];
    readOnly: string[];
    confirmWrite: string[];
    noDelete: string[];
  };
}

// ========================================
// Default Security Patterns
// ========================================

const DEFAULT_PATTERNS: PatternsConfig = {
  bash: {
    blocked: [
      { pattern: 'rm\\s+-rf\\s+/', reason: 'Recursive deletion of root directory' },
      { pattern: 'rm\\s+-rf\\s+~', reason: 'Recursive deletion of home directory' },
      { pattern: ':(){:|:&};:', reason: 'Fork bomb detected' },
      { pattern: 'mkfs', reason: 'Filesystem formatting command' },
      { pattern: 'dd\\s+if=/dev/zero\\s+of=/dev/sd', reason: 'Disk wiping command' },
      { pattern: '>(\\s+)?/dev/sd', reason: 'Direct disk write' },
      { pattern: 'chmod\\s+-R\\s+777\\s+/', reason: 'Recursive permission change on root' },
      { pattern: 'curl.*\\|.*sh', reason: 'Piping remote script to shell' },
      { pattern: 'wget.*\\|.*sh', reason: 'Piping remote script to shell' },
    ],
    confirm: [
      { pattern: 'git\\s+push.*--force', reason: 'Force push may overwrite remote history' },
      { pattern: 'git\\s+reset\\s+--hard', reason: 'Hard reset will discard all changes' },
      { pattern: 'npm\\s+publish', reason: 'Publishing package to npm' },
      { pattern: 'docker\\s+system\\s+prune', reason: 'Docker system prune will remove all unused data' },
      { pattern: 'rm\\s+-rf', reason: 'Recursive deletion' },
    ],
    alert: [
      { pattern: 'sudo', reason: 'Elevated privileges requested' },
      { pattern: 'su\\s+-', reason: 'Switching to root user' },
      { pattern: 'chmod', reason: 'Changing file permissions' },
      { pattern: 'chown', reason: 'Changing file ownership' },
    ],
  },
  paths: {
    zeroAccess: [
      '~/.ssh',
      '~/.gnupg',
      '~/.aws/credentials',
      '~/.config/gcloud',
      '/etc/passwd',
      '/etc/shadow',
    ],
    readOnly: [
      '/etc',
      '/usr',
      '/bin',
      '/sbin',
    ],
    confirmWrite: [
      '~/.bashrc',
      '~/.zshrc',
      '~/.profile',
      '~/.gitconfig',
    ],
    noDelete: [
      '~/.ssh',
      '~/.gnupg',
      '~/.bashrc',
      '~/.zshrc',
    ],
  },
};

let patternsCache: PatternsConfig | null = null;

function loadPatterns(): PatternsConfig {
  if (patternsCache) return patternsCache;

  // Try to load custom patterns from PAI directory
  const customPatternsPath = paiPath('hooks', 'security-patterns.json');
  if (existsSync(customPatternsPath)) {
    try {
      const content = readFileSync(customPatternsPath, 'utf-8');
      const custom = JSON.parse(content) as Partial<PatternsConfig>;
      patternsCache = {
        bash: {
          blocked: [...DEFAULT_PATTERNS.bash.blocked, ...(custom.bash?.blocked || [])],
          confirm: [...DEFAULT_PATTERNS.bash.confirm, ...(custom.bash?.confirm || [])],
          alert: [...DEFAULT_PATTERNS.bash.alert, ...(custom.bash?.alert || [])],
        },
        paths: {
          zeroAccess: [...DEFAULT_PATTERNS.paths.zeroAccess, ...(custom.paths?.zeroAccess || [])],
          readOnly: [...DEFAULT_PATTERNS.paths.readOnly, ...(custom.paths?.readOnly || [])],
          confirmWrite: [...DEFAULT_PATTERNS.paths.confirmWrite, ...(custom.paths?.confirmWrite || [])],
          noDelete: [...DEFAULT_PATTERNS.paths.noDelete, ...(custom.paths?.noDelete || [])],
        },
      };
      return patternsCache;
    } catch (error) {
      console.error('Failed to load custom patterns:', error);
    }
  }

  patternsCache = DEFAULT_PATTERNS;
  return patternsCache;
}

// ========================================
// Pattern Matching
// ========================================

function matchesPattern(command: string, pattern: string): boolean {
  try {
    const regex = new RegExp(pattern, 'i');
    return regex.test(command);
  } catch {
    return command.toLowerCase().includes(pattern.toLowerCase());
  }
}

function expandPath(path: string): string {
  if (path.startsWith('~')) {
    return path.replace('~', homedir());
  }
  return path;
}

function matchesPathPattern(filePath: string, pattern: string): boolean {
  const expandedPattern = expandPath(pattern);
  const expandedPath = expandPath(filePath);

  if (pattern.includes('*')) {
    let regexPattern = expandedPattern
      .replace(/\*\*/g, '<<<DOUBLESTAR>>>')
      .replace(/\*/g, '<<<SINGLESTAR>>>')
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/<<<DOUBLESTAR>>>/g, '.*')
      .replace(/<<<SINGLESTAR>>>/g, '[^/]*');

    try {
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(expandedPath);
    } catch {
      return false;
    }
  }

  return expandedPath === expandedPattern ||
         expandedPath.startsWith(expandedPattern.endsWith('/') ? expandedPattern : expandedPattern + '/');
}

// ========================================
// Validation Functions
// ========================================

function validateBashCommand(command: string): { action: 'allow' | 'block' | 'confirm' | 'alert'; reason?: string } {
  const patterns = loadPatterns();

  for (const p of patterns.bash.blocked) {
    if (matchesPattern(command, p.pattern)) {
      return { action: 'block', reason: p.reason };
    }
  }

  for (const p of patterns.bash.confirm) {
    if (matchesPattern(command, p.pattern)) {
      return { action: 'confirm', reason: p.reason };
    }
  }

  for (const p of patterns.bash.alert) {
    if (matchesPattern(command, p.pattern)) {
      return { action: 'alert', reason: p.reason };
    }
  }

  return { action: 'allow' };
}

type PathAction = 'read' | 'write' | 'delete';

function validatePath(filePath: string, action: PathAction): { action: 'allow' | 'block' | 'confirm'; reason?: string } {
  const patterns = loadPatterns();

  for (const p of patterns.paths.zeroAccess) {
    if (matchesPathPattern(filePath, p)) {
      return { action: 'block', reason: `Zero access path: ${p}` };
    }
  }

  if (action === 'write' || action === 'delete') {
    for (const p of patterns.paths.readOnly) {
      if (matchesPathPattern(filePath, p)) {
        return { action: 'block', reason: `Read-only path: ${p}` };
      }
    }
  }

  if (action === 'write') {
    for (const p of patterns.paths.confirmWrite) {
      if (matchesPathPattern(filePath, p)) {
        return { action: 'confirm', reason: `Writing to protected file requires confirmation: ${p}` };
      }
    }
  }

  if (action === 'delete') {
    for (const p of patterns.paths.noDelete) {
      if (matchesPathPattern(filePath, p)) {
        return { action: 'block', reason: `Cannot delete protected path: ${p}` };
      }
    }
  }

  return { action: 'allow' };
}

// ========================================
// Tool-Specific Handlers
// ========================================

function handleBash(input: HookInput): void {
  const command = typeof input.tool_input === 'string'
    ? input.tool_input
    : (input.tool_input?.command as string) || '';

  if (!command) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const result = validateBashCommand(command);

  switch (result.action) {
    case 'block':
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        session_id: input.session_id,
        event_type: 'block',
        tool: 'Bash',
        category: 'bash_command',
        target: command.slice(0, 500),
        reason: result.reason,
        action_taken: 'Hard block - exit 2'
      });
      console.error(`🚨 BLOCKED: ${result.reason}`);
      console.error(`Command: ${command.slice(0, 100)}`);
      process.exit(2);
      break;

    case 'confirm':
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        session_id: input.session_id,
        event_type: 'confirm',
        tool: 'Bash',
        category: 'bash_command',
        target: command.slice(0, 500),
        reason: result.reason,
        action_taken: 'Prompted user for confirmation'
      });
      console.log(JSON.stringify({
        decision: 'ask',
        message: `⚠️ ${result.reason}\n\nCommand: ${command.slice(0, 200)}\n\nProceed?`
      }));
      break;

    case 'alert':
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        session_id: input.session_id,
        event_type: 'alert',
        tool: 'Bash',
        category: 'bash_command',
        target: command.slice(0, 500),
        reason: result.reason,
        action_taken: 'Logged alert, allowed execution'
      });
      console.error(`⚠️ ALERT: ${result.reason}`);
      console.error(`Command: ${command.slice(0, 100)}`);
      console.log(JSON.stringify({ continue: true }));
      break;

    default:
      console.log(JSON.stringify({ continue: true }));
  }
}

function handleEdit(input: HookInput): void {
  const filePath = typeof input.tool_input === 'string'
    ? input.tool_input
    : (input.tool_input?.file_path as string) || '';

  if (!filePath) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const result = validatePath(filePath, 'write');

  switch (result.action) {
    case 'block':
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        session_id: input.session_id,
        event_type: 'block',
        tool: 'Edit',
        category: 'path_access',
        target: filePath,
        reason: result.reason,
        action_taken: 'Hard block - exit 2'
      });
      console.error(`🚨 BLOCKED: ${result.reason}`);
      console.error(`Path: ${filePath}`);
      process.exit(2);
      break;

    case 'confirm':
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        session_id: input.session_id,
        event_type: 'confirm',
        tool: 'Edit',
        category: 'path_access',
        target: filePath,
        reason: result.reason,
        action_taken: 'Prompted user for confirmation'
      });
      console.log(JSON.stringify({
        decision: 'ask',
        message: `⚠️ ${result.reason}\n\nPath: ${filePath}\n\nProceed?`
      }));
      break;

    default:
      console.log(JSON.stringify({ continue: true }));
  }
}

function handleWrite(input: HookInput): void {
  const filePath = typeof input.tool_input === 'string'
    ? input.tool_input
    : (input.tool_input?.file_path as string) || '';

  if (!filePath) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const result = validatePath(filePath, 'write');

  switch (result.action) {
    case 'block':
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        session_id: input.session_id,
        event_type: 'block',
        tool: 'Write',
        category: 'path_access',
        target: filePath,
        reason: result.reason,
        action_taken: 'Hard block - exit 2'
      });
      console.error(`🚨 BLOCKED: ${result.reason}`);
      console.error(`Path: ${filePath}`);
      process.exit(2);
      break;

    case 'confirm':
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        session_id: input.session_id,
        event_type: 'confirm',
        tool: 'Write',
        category: 'path_access',
        target: filePath,
        reason: result.reason,
        action_taken: 'Prompted user for confirmation'
      });
      console.log(JSON.stringify({
        decision: 'ask',
        message: `⚠️ ${result.reason}\n\nPath: ${filePath}\n\nProceed?`
      }));
      break;

    default:
      console.log(JSON.stringify({ continue: true }));
  }
}

function handleRead(input: HookInput): void {
  const filePath = typeof input.tool_input === 'string'
    ? input.tool_input
    : (input.tool_input?.file_path as string) || '';

  if (!filePath) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const result = validatePath(filePath, 'read');

  switch (result.action) {
    case 'block':
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        session_id: input.session_id,
        event_type: 'block',
        tool: 'Read',
        category: 'path_access',
        target: filePath,
        reason: result.reason,
        action_taken: 'Hard block - exit 2'
      });
      console.error(`🚨 BLOCKED: ${result.reason}`);
      console.error(`Path: ${filePath}`);
      process.exit(2);
      break;

    default:
      console.log(JSON.stringify({ continue: true }));
  }
}

// ========================================
// Main
// ========================================

async function main(): Promise<void> {
  let input: HookInput;

  try {
    const text = await Promise.race([
      Bun.stdin.text(),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 100)
      )
    ]);

    if (!text.trim()) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    input = JSON.parse(text);
  } catch {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  switch (input.tool_name) {
    case 'Bash':
      handleBash(input);
      break;
    case 'Edit':
    case 'MultiEdit':
      handleEdit(input);
      break;
    case 'Write':
      handleWrite(input);
      break;
    case 'Read':
      handleRead(input);
      break;
    default:
      console.log(JSON.stringify({ continue: true }));
  }
}

main().catch(() => {
  console.log(JSON.stringify({ continue: true }));
});
