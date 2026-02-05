/**
 * Changelog Utility
 *
 * Manages the self-improvement changelog and generates git commit messages.
 * Every rule addition, rejection, or modification is tracked for auditability.
 *
 * Used by: /pai review-rules, /pai compile-rules
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { $ } from 'bun';

// ============================================================================
// Types
// ============================================================================

// Note: RuleProposal will be imported from rule-compiler.ts once it exists
// For now, define locally for compilation
export interface RuleProposal {
  patternId: string;
  title: string;
  domain: string;
  destination: string;
  content: string;
  sourceLearnings: string[];
  generatedAt: string;
  autoApply: boolean;
}

export type ChangelogAction = 'added' | 'rejected' | 'modified' | 'archived';

export interface ChangelogEntry {
  action: ChangelogAction;
  ruleName: string;
  patternId: string;
  date: string;              // YYYY-MM-DD
  sourceLearnings?: number;  // For 'added'
  dateRange?: string;        // "YYYY-MM-DD to YYYY-MM-DD"
  location?: string;         // Destination file path
  commit?: string;           // Short git hash
  reason?: string;           // For 'rejected'
  change?: string;           // For 'modified'
  learningIds?: string[];    // For 'archived'
}

// ============================================================================
// Entry Formatting
// ============================================================================

/**
 * Generate markdown for a single changelog entry based on action type
 */
export function formatChangelogEntry(entry: ChangelogEntry): string {
  switch (entry.action) {
    case 'added':
      return [
        `- **${entry.ruleName}** (approved)`,
        `  - Source: ${entry.sourceLearnings || 0} learnings${entry.dateRange ? ` from ${entry.dateRange}` : ''}`,
        `  - Location: ${entry.location || 'unknown'}`,
        entry.commit ? `  - Commit: ${entry.commit}` : '',
      ].filter(Boolean).join('\n');

    case 'rejected':
      return [
        `- **${entry.ruleName}** (rejected)`,
        `  - Reason: ${entry.reason || 'User preference'}`,
        `  - Pattern archived, won't re-propose`,
      ].join('\n');

    case 'modified':
      return [
        `- **${entry.ruleName}** (updated)`,
        `  - Change: ${entry.change || 'No description'}`,
        entry.commit ? `  - Commit: ${entry.commit}` : '',
      ].filter(Boolean).join('\n');

    case 'archived':
      const learningList = entry.learningIds?.join(', ') || 'none';
      return [
        `- **${entry.sourceLearnings || 0} learnings** archived after rule compilation`,
        `  - Rule: ${entry.ruleName}`,
        `  - Original learnings: ${learningList}`,
      ].join('\n');

    default:
      return `- **${entry.ruleName}** - ${entry.action}`;
  }
}

/**
 * Format date as section header
 */
export function getDateHeader(date: string): string {
  return `## ${date}`;
}

// ============================================================================
// Changelog File Operations
// ============================================================================

/**
 * Get action section header for grouping entries
 */
function getActionSection(action: ChangelogAction): string {
  const sections: Record<ChangelogAction, string> = {
    added: '### Added',
    rejected: '### Rejected',
    modified: '### Modified',
    archived: '### Archived',
  };
  return sections[action];
}

/**
 * Add a changelog entry to the changelog file
 *
 * - Read existing CHANGELOG.md
 * - Find "## Entries" line
 * - Check if today's date header exists; if not, add it
 * - Prepend new entry under appropriate action section
 * - Write updated file
 */
export function addChangelogEntry(changelogPath: string, entry: ChangelogEntry): void {
  if (!existsSync(changelogPath)) {
    throw new Error(`Changelog file not found: ${changelogPath}`);
  }

  const content = readFileSync(changelogPath, 'utf-8');
  const lines = content.split('\n');

  // Find "## Entries" line
  const entriesIndex = lines.findIndex(line => line.trim() === '## Entries');
  if (entriesIndex === -1) {
    throw new Error('Could not find "## Entries" section in changelog');
  }

  // Find where to insert (after "## Entries" and the comment line)
  let insertIndex = entriesIndex + 1;
  // Skip any comment lines immediately after ## Entries
  while (insertIndex < lines.length && lines[insertIndex].trim().startsWith('<!--')) {
    insertIndex++;
  }
  // Skip any empty lines after comments
  while (insertIndex < lines.length && lines[insertIndex].trim() === '') {
    insertIndex++;
  }

  const dateHeader = getDateHeader(entry.date);
  const actionSection = getActionSection(entry.action);
  const entryContent = formatChangelogEntry(entry);

  // Check if today's date header already exists
  const dateHeaderExists = lines.slice(insertIndex).some(line =>
    line.trim() === dateHeader
  );

  const newLines: string[] = [];

  if (!dateHeaderExists) {
    // Add new date header with action section
    newLines.push('');
    newLines.push(dateHeader);
    newLines.push('');
    newLines.push(actionSection);
    newLines.push(entryContent);
  } else {
    // Find the date header and action section
    const dateIndex = lines.findIndex((line, idx) =>
      idx >= insertIndex && line.trim() === dateHeader
    );

    if (dateIndex !== -1) {
      // Look for existing action section under this date
      let actionIndex = -1;
      for (let i = dateIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        // Stop if we hit another date header
        if (line.startsWith('## ') && line !== dateHeader) break;
        if (line === actionSection) {
          actionIndex = i;
          break;
        }
      }

      if (actionIndex !== -1) {
        // Insert after the action section header
        lines.splice(actionIndex + 1, 0, entryContent);
      } else {
        // Insert new action section after date header
        lines.splice(dateIndex + 2, 0, actionSection, entryContent);
      }

      writeFileSync(changelogPath, lines.join('\n'), 'utf-8');
      return;
    }
  }

  // Insert new content
  lines.splice(insertIndex, 0, ...newLines);
  writeFileSync(changelogPath, lines.join('\n'), 'utf-8');
}

// ============================================================================
// Git Commit Utilities
// ============================================================================

/**
 * Generate a git commit message for a rule proposal action
 */
export function generateCommitMessage(
  proposal: RuleProposal,
  action: 'approve' | 'reject'
): string {
  if (action === 'approve') {
    return [
      `self-improve: approve ${proposal.title}`,
      '',
      `Pattern: ${proposal.patternId}`,
      `Source learnings: ${proposal.sourceLearnings.length}`,
      `Route: ${proposal.destination}`,
      '',
      `Rule compiled from ${proposal.sourceLearnings.length} learnings and added to ${proposal.destination}.`,
    ].join('\n');
  } else {
    return [
      `self-improve: reject ${proposal.title}`,
      '',
      `Pattern: ${proposal.patternId}`,
      `Reason: User preference`,
      `Status: Archived, won't re-propose`,
      '',
      `Pattern rejected and marked in index to prevent re-proposal.`,
    ].join('\n');
  }
}

/**
 * Get current git short hash
 */
export async function getGitShortHash(): Promise<string> {
  try {
    const result = await $`git rev-parse --short HEAD`.text();
    return result.trim();
  } catch (err) {
    console.error('Warning: Could not get git hash');
    return 'unknown';
  }
}

/**
 * Prepare files and message for a changelog commit
 */
export function prepareChangelogCommit(entry: ChangelogEntry): {
  message: string;
  files: string[];
} {
  const action = entry.action === 'added' ? 'approve' :
                 entry.action === 'rejected' ? 'reject' :
                 entry.action;

  const message = [
    `self-improve: ${action} ${entry.ruleName}`,
    '',
    `Pattern: ${entry.patternId}`,
  ];

  if (entry.action === 'added') {
    message.push(`Source learnings: ${entry.sourceLearnings || 0}`);
    message.push(`Route: ${entry.location || 'unknown'}`);
  } else if (entry.action === 'rejected') {
    message.push(`Reason: ${entry.reason || 'User preference'}`);
    message.push('Status: Archived, won\'t re-propose');
  } else if (entry.action === 'modified') {
    message.push(`Change: ${entry.change || 'Updated'}`);
  }

  const files = ['core/memory/CHANGELOG.md'];

  if (entry.action === 'added' && entry.location) {
    files.push(entry.location);
  }

  // Always include pattern index
  files.push('core/memory/patterns/index.json');

  return {
    message: message.join('\n'),
    files,
  };
}

