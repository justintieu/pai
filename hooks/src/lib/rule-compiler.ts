/**
 * Rule Compiler Utility
 *
 * Generates rule proposals from detected patterns and routes them to
 * appropriate locations based on domain. The "compiler" in the
 * learnings-to-rules pipeline.
 *
 * Used by: /pai compile-rules, /pai review-rules
 */

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type { PatternMatch, Learning } from './pattern-detection';

// ============================================================================
// Interfaces
// ============================================================================

export interface RuleProposal {
  patternId: string;
  title: string;           // Human-readable rule name
  domain: string;
  destination: string;     // Target file path
  content: string;         // Generated rule markdown
  sourceLearnings: string[]; // Learning IDs that formed this pattern
  generatedAt: string;
  autoApply: boolean;      // Whether this can auto-apply without approval
}

export interface RuleDestination {
  path: string;
  section?: string;        // Section within file to append to
}

// ============================================================================
// Constants
// ============================================================================

// Rules that can auto-apply without explicit user approval
// Low-risk, mechanical rules that don't affect behavior
export const AUTO_APPLY_ALLOWLIST = [
  'naming-convention',
  'code-formatting',
  'comment-style',
  'import-order',
  'file-naming',
];

// Rules that ALWAYS require approval
// High-impact rules that affect how PAI behaves
export const REQUIRE_APPROVAL_TAGS = [
  'behavioral',
  'process',
  'communication',
  'decision',
  'strategy',
  'workflow',
];

// Domain to destination mapping
const DOMAIN_DESTINATIONS: Record<string, RuleDestination> = {
  // Coding-related domains -> core/rules/
  'coding': { path: 'core/rules/coding.md' },
  'git': { path: 'core/rules/git.md' },
  'api': { path: 'core/rules/api.md' },
  'testing': { path: 'core/rules/testing.md' },
  'frontend': { path: 'core/rules/frontend.md' },
  'security': { path: 'core/rules/security.md' },
  'technical': { path: 'core/rules/technical.md' },

  // Non-coding domains -> core/context/
  'communications': { path: 'core/context/voice/style-rules.md' },
  'scheduling': { path: 'core/context/preferences/scheduling.md' },
  'finance': { path: 'core/context/preferences/finance.md' },
  'learning': { path: 'core/context/preferences/learning.md' },

  // General/process -> strategies
  'general': { path: 'core/context/strategies/general.md' },
  'process': { path: 'core/context/strategies/general.md' },
};

// ============================================================================
// Functions
// ============================================================================

/**
 * Get the destination file path for a rule based on domain
 *
 * Maps domain to destination file:
 * - coding domains -> core/rules/
 * - communications -> core/context/voice/
 * - scheduling/finance/learning -> core/context/preferences/
 * - general/process -> core/context/strategies/
 */
export function getRuleDestination(domain: string, tags: string[]): RuleDestination {
  const normalizedDomain = domain.toLowerCase();

  // Check explicit mapping first
  if (DOMAIN_DESTINATIONS[normalizedDomain]) {
    return DOMAIN_DESTINATIONS[normalizedDomain];
  }

  // Check if any tag suggests a specific domain
  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase();
    if (DOMAIN_DESTINATIONS[normalizedTag]) {
      return DOMAIN_DESTINATIONS[normalizedTag];
    }
  }

  // Default: general strategies
  return { path: 'core/context/strategies/general.md' };
}

/**
 * Determine if a rule can auto-apply without user approval
 *
 * Rules can auto-apply if:
 * 1. At least one tag is in AUTO_APPLY_ALLOWLIST
 * 2. No tags are in REQUIRE_APPROVAL_TAGS
 *
 * Safe default: require approval if uncertain
 */
export function canAutoApply(patternId: string, tags: string[]): boolean {
  const normalizedTags = tags.map(t => t.toLowerCase());

  // Check for tags that require approval (blocks auto-apply)
  for (const tag of normalizedTags) {
    if (REQUIRE_APPROVAL_TAGS.includes(tag)) {
      return false;
    }
  }

  // Check for tags in allowlist
  for (const tag of normalizedTags) {
    if (AUTO_APPLY_ALLOWLIST.includes(tag)) {
      return true;
    }
  }

  // Safe default: require approval
  return false;
}

/**
 * Format a rule proposal into markdown
 *
 * Generates rule markdown in standard format:
 * - Title and description
 * - Do/Avoid sections
 * - Source attribution
 *
 * Note: The actual content extraction (themes, specific actions) happens
 * at runtime via Claude prompting. This function provides the structure.
 */
export function formatRuleProposal(pattern: PatternMatch, learnings: Learning[]): string {
  // Extract common tags for context
  const allTags = learnings.flatMap(l => l.tags);
  const tagCounts: Record<string, number> = {};
  for (const tag of allTags) {
    const normalized = tag.toLowerCase();
    tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
  }

  const commonTags = Object.entries(tagCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag);

  // Get date range from learnings
  const dates = learnings
    .map(l => l.date)
    .filter(Boolean)
    .sort();
  const dateRange = dates.length > 1
    ? `${dates[0]} to ${dates[dates.length - 1]}`
    : dates[0] || 'unknown';

  // Generate title from pattern ID
  const title = pattern.patternId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Build the rule template
  // Note: The Do/Avoid content is intentionally generic here.
  // The actual compilation uses Claude to synthesize learnings into specific guidance.
  const template = `## ${title}

A pattern detected from ${learnings.length} similar learnings about ${commonTags.join(', ') || pattern.learnings[0]?.domain || 'this topic'}.

**Do:**
- [Action derived from learning patterns]
- [Another action from patterns]

**Avoid:**
- [Anti-pattern identified from learnings]

---
*Compiled from ${learnings.length} learnings (${dateRange})*`;

  return template;
}

/**
 * Generate full proposal file content for pending/ directory
 *
 * Creates a complete proposal document that includes:
 * - Metadata (pattern ID, domain, destination)
 * - The proposed rule content
 * - Source learning references
 * - Action options
 */
export function generateProposalFile(proposal: RuleProposal): string {
  const learningsList = proposal.sourceLearnings
    .map(id => `- ${id}`)
    .join('\n');

  return `# Rule Proposal: ${proposal.title}

**Pattern ID:** ${proposal.patternId}
**Domain:** ${proposal.domain}
**Destination:** ${proposal.destination}
**Auto-apply:** ${proposal.autoApply ? 'yes' : 'no'}
**Generated:** ${proposal.generatedAt}

## Proposed Rule

${proposal.content}

## Source Learnings

${learningsList}

---
**Actions:** Approve | Reject | Edit
`;
}

/**
 * Compile a pattern match into a rule proposal
 *
 * Orchestrates the compilation:
 * 1. Get destination from domain
 * 2. Check if auto-apply is allowed
 * 3. Format rule content
 * 4. Return complete proposal
 */
export function compileRule(pattern: PatternMatch, learnings: Learning[]): RuleProposal {
  // Get all tags from learnings
  const allTags = learnings.flatMap(l => l.tags);

  // Get destination based on domain
  const destination = getRuleDestination(
    learnings[0]?.domain || 'general',
    allTags
  );

  // Check if auto-apply is allowed
  const autoApply = canAutoApply(pattern.patternId, allTags);

  // Generate title from pattern ID
  const title = pattern.patternId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Format rule content
  const content = formatRuleProposal(pattern, learnings);

  return {
    patternId: pattern.patternId,
    title,
    domain: learnings[0]?.domain || 'general',
    destination: destination.path,
    content,
    sourceLearnings: learnings.map(l => l.id),
    generatedAt: new Date().toISOString(),
    autoApply,
  };
}

/**
 * Write a proposal to the pending/ directory
 *
 * Creates the pending directory if it doesn't exist.
 * Returns the filepath for reference.
 */
export function writeProposal(proposal: RuleProposal, pendingDir: string): string {
  // Ensure directory exists
  if (!existsSync(pendingDir)) {
    mkdirSync(pendingDir, { recursive: true });
  }

  // Generate filename from pattern ID
  const filename = `${proposal.patternId}.md`;
  const filepath = join(pendingDir, filename);

  // Generate and write content
  const content = generateProposalFile(proposal);
  writeFileSync(filepath, content, 'utf-8');

  return filepath;
}

// ============================================================================
// Exports
// ============================================================================

export {
  DOMAIN_DESTINATIONS,
};
