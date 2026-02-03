/**
 * yaml.ts - Simple YAML read/write utilities
 *
 * Provides consistent YAML handling across PAI hooks.
 * Uses simple parsing for known structures - no external dependencies.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

/**
 * Parse simple YAML to object
 * Handles: scalars, arrays, nested objects (1 level)
 */
export function parseYaml<T = Record<string, unknown>>(content: string): T {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');
  let currentKey = '';
  let inArray = false;
  let inNested = false;
  let nestedKey = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Array item
    if (trimmed.startsWith('- ') && inArray) {
      const value = trimmed.slice(2).replace(/^["']|["']$/g, '');
      if (inNested && nestedKey) {
        const nested = result[nestedKey] as Record<string, unknown[]>;
        if (nested && Array.isArray(nested[currentKey])) {
          nested[currentKey].push(value);
        }
      } else if (Array.isArray(result[currentKey])) {
        (result[currentKey] as unknown[]).push(value);
      }
      continue;
    }

    // Key-value pair
    const match = trimmed.match(/^([a-z_][a-z0-9_]*):\s*(.*)$/i);
    if (match) {
      const [, key, rawValue] = match;
      const value = rawValue.replace(/^["']|["']$/g, '');

      // Check indentation for nesting
      const indent = line.search(/\S/);

      if (indent === 0) {
        // Top-level key
        inNested = false;
        nestedKey = '';

        if (value === '' || value === '[]') {
          // Could be object or array
          result[key] = value === '[]' ? [] : {};
          currentKey = key;
          inArray = value === '' || value === '[]';
        } else {
          result[key] = parseValue(value);
          inArray = false;
        }
      } else if (indent > 0 && !inNested) {
        // First level nesting - this key is nested under previous top-level
        const parentKey = Object.keys(result).pop() || '';
        if (typeof result[parentKey] === 'object' && !Array.isArray(result[parentKey])) {
          inNested = true;
          nestedKey = parentKey;
          const nested = result[parentKey] as Record<string, unknown>;
          if (value === '' || value === '[]') {
            nested[key] = [];
            currentKey = key;
            inArray = true;
          } else {
            nested[key] = parseValue(value);
            inArray = false;
          }
        }
      } else if (inNested && nestedKey) {
        // Continue nested object
        const nested = result[nestedKey] as Record<string, unknown>;
        if (value === '' || value === '[]') {
          nested[key] = [];
          currentKey = key;
          inArray = true;
        } else {
          nested[key] = parseValue(value);
          inArray = false;
        }
      }
    }
  }

  return result as T;
}

/**
 * Parse a scalar value
 */
function parseValue(value: string): unknown {
  if (value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  return value;
}

/**
 * Stringify object to YAML
 */
export function stringifyYaml(obj: Record<string, unknown>, indent = 0): string {
  const pad = '  '.repeat(indent);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      lines.push(`${pad}${key}: null`);
    } else if (typeof value === 'boolean') {
      lines.push(`${pad}${key}: ${value}`);
    } else if (typeof value === 'number') {
      lines.push(`${pad}${key}: ${value}`);
    } else if (typeof value === 'string') {
      // Quote strings with special chars
      if (value.includes(':') || value.includes('#') || value.includes('\n')) {
        lines.push(`${pad}${key}: "${value.replace(/"/g, '\\"')}"`);
      } else {
        lines.push(`${pad}${key}: ${value}`);
      }
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${pad}${key}: []`);
      } else {
        lines.push(`${pad}${key}:`);
        for (const item of value) {
          if (typeof item === 'string') {
            lines.push(`${pad}  - ${item}`);
          } else if (typeof item === 'object') {
            lines.push(`${pad}  -`);
            lines.push(stringifyYaml(item as Record<string, unknown>, indent + 2));
          } else {
            lines.push(`${pad}  - ${item}`);
          }
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${pad}${key}:`);
      lines.push(stringifyYaml(value as Record<string, unknown>, indent + 1));
    }
  }

  return lines.join('\n');
}

/**
 * Read YAML file
 */
export function readYamlFile<T = Record<string, unknown>>(filepath: string): T | null {
  try {
    if (!existsSync(filepath)) return null;
    const content = readFileSync(filepath, 'utf-8');
    return parseYaml<T>(content);
  } catch (error) {
    console.error(`[yaml] Error reading ${filepath}:`, error);
    return null;
  }
}

/**
 * Write YAML file (creates directories if needed)
 */
export function writeYamlFile(filepath: string, data: Record<string, unknown>): boolean {
  try {
    const dir = dirname(filepath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const content = stringifyYaml(data);
    writeFileSync(filepath, content + '\n', 'utf-8');
    return true;
  } catch (error) {
    console.error(`[yaml] Error writing ${filepath}:`, error);
    return false;
  }
}
