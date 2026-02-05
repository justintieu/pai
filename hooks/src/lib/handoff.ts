/**
 * handoff.ts - Structured session handoff utilities
 *
 * Provides TypeScript types and utilities for reading/writing structured handoffs.
 * Handoffs preserve context across session compactions or restarts.
 *
 * Format: YAML frontmatter with markdown body
 * Location: ~/.pai/memory/handoffs/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { paiPath } from '@/lib/paths';

// ============================================================================
// Types
// ============================================================================

/**
 * Task status in a handoff
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

/**
 * Individual task item
 */
export interface HandoffTask {
  status: TaskStatus;
  description: string;
}

/**
 * Handoff frontmatter (YAML header)
 */
export interface HandoffFrontmatter {
  session: string;
  goal: string;
  focus: string;
  timestamp: string;
}

/**
 * Handoff body content (markdown sections)
 */
export interface HandoffBody {
  tasks: HandoffTask[];
  modifiedFiles: string[];
  errors: string[];
  nextSteps: string[];
}

/**
 * Complete handoff structure
 */
export interface Handoff extends HandoffFrontmatter, HandoffBody {}

/**
 * Result of parsing a handoff file
 */
export type HandoffParseResult =
  | { success: true; handoff: Handoff; filepath: string }
  | { success: false; error: string };

/**
 * Result of writing a handoff file
 */
export type HandoffWriteResult =
  | { success: true; filepath: string }
  | { success: false; error: string };

// ============================================================================
// Constants
// ============================================================================

const HANDOFFS_DIR = 'memory/handoffs';

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * Get the handoffs directory path
 */
export function getHandoffsDir(): string {
  return paiPath(HANDOFFS_DIR);
}

/**
 * Generate a handoff filename from session name and timestamp
 */
export function generateHandoffFilename(session: string, timestamp?: string): string {
  const ts = timestamp || new Date().toISOString();
  const safeSession = session.replace(/[^a-zA-Z0-9-_]/g, '-');
  const datePrefix = ts.slice(0, 10); // YYYY-MM-DD
  const timePrefix = ts.slice(11, 19).replace(/:/g, ''); // HHMMSS
  return `${datePrefix}-${timePrefix}-${safeSession}.md`;
}

// ============================================================================
// Parsing Utilities
// ============================================================================

/**
 * Parse task status from markdown checkbox format
 * Format: - [status] description
 */
function parseTaskLine(line: string): HandoffTask | null {
  const match = line.match(/^-\s*\[([^\]]+)\]\s*(.+)$/);
  if (!match) return null;

  const statusText = match[1].toLowerCase().trim();
  const description = match[2].trim();

  // Map status text to TaskStatus
  let status: TaskStatus;
  switch (statusText) {
    case 'pending':
    case ' ':
    case '':
      status = 'pending';
      break;
    case 'in_progress':
    case 'in progress':
    case '~':
      status = 'in_progress';
      break;
    case 'completed':
    case 'done':
    case 'x':
      status = 'completed';
      break;
    case 'blocked':
    case '!':
      status = 'blocked';
      break;
    default:
      status = 'pending';
  }

  return { status, description };
}

/**
 * Parse list items from a markdown section
 */
function parseListSection(content: string): string[] {
  return content
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(Boolean);
}

/**
 * Parse YAML frontmatter from content
 */
function parseFrontmatter(content: string): { frontmatter: Partial<HandoffFrontmatter>; body: string } {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return { frontmatter: {}, body: content };
  }

  const yamlContent = frontmatterMatch[1];
  const body = frontmatterMatch[2];
  const frontmatter: Partial<HandoffFrontmatter> = {};

  // Parse simple key: value pairs
  for (const line of yamlContent.split('\n')) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'session' || key === 'goal' || key === 'focus' || key === 'timestamp') {
        frontmatter[key] = value.trim();
      }
    }
  }

  return { frontmatter, body };
}

/**
 * Parse markdown body into HandoffBody
 */
function parseBody(body: string): HandoffBody {
  const result: HandoffBody = {
    tasks: [],
    modifiedFiles: [],
    errors: [],
    nextSteps: [],
  };

  // Split by sections (## headers)
  const sections = body.split(/\n##\s+/);

  for (const section of sections) {
    const lines = section.split('\n');
    const header = lines[0]?.toLowerCase() || '';
    const content = lines.slice(1).join('\n');

    if (header.includes('current task state') || header.includes('task')) {
      // Parse tasks with status
      for (const line of content.split('\n')) {
        const task = parseTaskLine(line.trim());
        if (task) {
          result.tasks.push(task);
        }
      }
    } else if (header.includes('modified files') || header.includes('files')) {
      result.modifiedFiles = parseListSection(content);
    } else if (header.includes('error')) {
      result.errors = parseListSection(content);
    } else if (header.includes('next step')) {
      result.nextSteps = parseListSection(content);
    }
  }

  return result;
}

/**
 * Parse a handoff file content into a Handoff object
 */
export function parseHandoff(content: string): Handoff {
  const { frontmatter, body } = parseFrontmatter(content);
  const bodyContent = parseBody(body);

  return {
    session: frontmatter.session || '',
    goal: frontmatter.goal || '',
    focus: frontmatter.focus || '',
    timestamp: frontmatter.timestamp || new Date().toISOString(),
    ...bodyContent,
  };
}

// ============================================================================
// Serialization Utilities
// ============================================================================

/**
 * Format a task as a markdown checkbox line
 */
function formatTask(task: HandoffTask): string {
  return `- [${task.status}] ${task.description}`;
}

/**
 * Format a list of strings as markdown bullet points
 */
function formatList(items: string[]): string {
  if (items.length === 0) return '- (none)';
  return items.map(item => `- ${item}`).join('\n');
}

/**
 * Serialize a Handoff object to YAML+markdown format
 */
export function serializeHandoff(handoff: Handoff): string {
  const lines: string[] = [];

  // Frontmatter
  lines.push('---');
  lines.push(`session: ${handoff.session}`);
  lines.push(`goal: ${handoff.goal}`);
  lines.push(`focus: ${handoff.focus}`);
  lines.push(`timestamp: ${handoff.timestamp}`);
  lines.push('---');
  lines.push('');

  // Tasks section
  lines.push('## Current Task State');
  if (handoff.tasks.length === 0) {
    lines.push('- (none)');
  } else {
    for (const task of handoff.tasks) {
      lines.push(formatTask(task));
    }
  }
  lines.push('');

  // Modified files section
  lines.push('## Modified Files');
  lines.push(formatList(handoff.modifiedFiles));
  lines.push('');

  // Errors section
  lines.push('## Errors Encountered');
  lines.push(formatList(handoff.errors));
  lines.push('');

  // Next steps section
  lines.push('## Next Steps');
  lines.push(formatList(handoff.nextSteps));
  lines.push('');

  return lines.join('\n');
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Write a handoff to the handoffs directory
 */
export function writeHandoff(handoff: Handoff): HandoffWriteResult {
  try {
    const dir = getHandoffsDir();
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const filename = generateHandoffFilename(handoff.session, handoff.timestamp);
    const filepath = join(dir, filename);
    const content = serializeHandoff(handoff);

    writeFileSync(filepath, content, 'utf-8');

    return { success: true, filepath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to write handoff: ${message}` };
  }
}

/**
 * Read and parse a handoff file by path
 */
export function readHandoff(filepath: string): HandoffParseResult {
  try {
    if (!existsSync(filepath)) {
      return { success: false, error: `Handoff file not found: ${filepath}` };
    }

    const content = readFileSync(filepath, 'utf-8');
    const handoff = parseHandoff(content);

    return { success: true, handoff, filepath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to read handoff: ${message}` };
  }
}

/**
 * List available handoff files
 * Returns files sorted by modification time (most recent first)
 */
export function listHandoffs(): string[] {
  const dir = getHandoffsDir();

  if (!existsSync(dir)) {
    return [];
  }

  try {
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(f => join(dir, f));

    // Sort by filename (which includes timestamp) in reverse order
    return files.sort().reverse();
  } catch {
    return [];
  }
}

/**
 * Get the most recent handoff
 */
export function getMostRecentHandoff(): HandoffParseResult {
  const handoffs = listHandoffs();

  if (handoffs.length === 0) {
    return { success: false, error: 'No handoffs found' };
  }

  return readHandoff(handoffs[0]);
}

/**
 * Get handoffs for a specific session
 */
export function getHandoffsForSession(session: string): string[] {
  const safeSession = session.replace(/[^a-zA-Z0-9-_]/g, '-');
  return listHandoffs().filter(filepath => filepath.includes(safeSession));
}

// ============================================================================
// Builder Helpers
// ============================================================================

/**
 * Create a new handoff with defaults
 */
export function createHandoff(options: {
  session: string;
  goal: string;
  focus?: string;
  tasks?: HandoffTask[];
  modifiedFiles?: string[];
  errors?: string[];
  nextSteps?: string[];
}): Handoff {
  return {
    session: options.session,
    goal: options.goal,
    focus: options.focus || options.goal,
    timestamp: new Date().toISOString(),
    tasks: options.tasks || [],
    modifiedFiles: options.modifiedFiles || [],
    errors: options.errors || [],
    nextSteps: options.nextSteps || [],
  };
}

/**
 * Create a task object
 */
export function task(status: TaskStatus, description: string): HandoffTask {
  return { status, description };
}
