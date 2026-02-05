/**
 * integration.ts - Autonomy-aware integration categorization and auto-apply
 *
 * Categorizes extracted patterns by autonomy level and applies safe changes
 * automatically while queuing complex changes for review.
 */

import type { ExtractedPattern, AutomationLevel } from "./types.ts";
import { AUTONOMY_MAP } from "./types.ts";
import { savePattern, updatePatternIndex } from "./storage.ts";

/**
 * A skill proposal generated from a high-relevance pattern
 */
export interface SkillProposal {
  /** The pattern this proposal is based on */
  pattern: ExtractedPattern;
  /** Proposed skill name (slugified) */
  proposed_name: string;
  /** Proposed location for the skill */
  proposed_location: string;
  /** Brief description of what the skill would do */
  description: string;
  /** Proposal status */
  status: "pending";
}

/**
 * A rule modification proposal
 */
export interface RuleModification {
  /** The pattern this modification is based on */
  pattern: ExtractedPattern;
  /** Target rule file to modify */
  target_file: string;
  /** Type of change */
  change_type: "add" | "modify";
  /** Proposed content to add/modify */
  proposed_content: string;
  /** Proposal status */
  status: "pending";
}

/**
 * Output from categorizing patterns by autonomy level
 */
export interface IntegrationOutput {
  /** Items that can be auto-applied (tags, learnings, pattern_notes) */
  auto_applied: {
    tags: string[];
    learnings: string[];
    pattern_notes: string[];
  };
  /** Items that require user review (skill_proposals, rule_modifications) */
  pending_review: {
    skill_proposals: SkillProposal[];
    rule_modifications: RuleModification[];
  };
}

/**
 * Check if a pattern is a candidate for becoming a new PAI skill
 *
 * A pattern is a skill candidate if:
 * - It's a workflow or integration type pattern
 * - It has high PAI relevance
 *
 * @param pattern - The extracted pattern to check
 * @returns true if this pattern should become a skill proposal
 *
 * @example
 * const pattern = { type: 'workflow', pai_relevance: 'high', ... };
 * isSkillCandidate(pattern); // true
 */
export function isSkillCandidate(pattern: ExtractedPattern): boolean {
  return (
    (pattern.type === "workflow" || pattern.type === "integration") &&
    pattern.pai_relevance === "high"
  );
}

/**
 * Generate a skill proposal from a pattern
 *
 * @param pattern - The pattern to create a proposal for
 * @returns A skill proposal with pending status
 */
function createSkillProposalFromPattern(pattern: ExtractedPattern): SkillProposal {
  const proposedName = pattern.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const HOME = Bun.env.HOME || process.env.HOME || "~";

  return {
    pattern,
    proposed_name: proposedName,
    proposed_location: `${HOME}/.pai/skills/${proposedName}/SKILL.md`,
    description: pattern.description,
    status: "pending",
  };
}

/**
 * Categorize patterns into auto-apply vs pending-review buckets
 *
 * Based on AUTONOMY_MAP from types.ts:
 * - Auto-apply: tags, learnings, pattern_notes
 * - Require review: skill_proposals, agent_proposals, rule_modifications, workflow_changes
 *
 * High-relevance workflow/integration patterns become skill proposals.
 * All other patterns become pattern_notes for auto-apply.
 *
 * @param patterns - Array of extracted patterns to categorize
 * @returns IntegrationOutput with categorized items
 *
 * @example
 * const patterns = [workflowPattern, codePattern];
 * const output = categorizeIntegrations(patterns);
 * console.log(output.auto_applied.pattern_notes.length); // number of auto-applied patterns
 * console.log(output.pending_review.skill_proposals.length); // number requiring review
 */
export function categorizeIntegrations(
  patterns: ExtractedPattern[]
): IntegrationOutput {
  const output: IntegrationOutput = {
    auto_applied: {
      tags: [],
      learnings: [],
      pattern_notes: [],
    },
    pending_review: {
      skill_proposals: [],
      rule_modifications: [],
    },
  };

  // Collect all unique tags from patterns
  const allTags = new Set<string>();

  for (const pattern of patterns) {
    // Collect tags
    for (const tag of pattern.tags) {
      allTags.add(tag);
    }

    // Categorize the pattern itself
    if (isSkillCandidate(pattern)) {
      // High-relevance workflow/integration patterns -> skill proposals (require review)
      output.pending_review.skill_proposals.push(
        createSkillProposalFromPattern(pattern)
      );
    } else {
      // All other patterns -> pattern_notes (auto-apply)
      output.auto_applied.pattern_notes.push(pattern.name);
    }
  }

  // Add collected tags to auto_applied
  output.auto_applied.tags = Array.from(allTags);

  return output;
}

/**
 * Apply auto-approved integrations
 *
 * Saves patterns to the approved/ directory and updates the pattern index.
 * Only applies to patterns that are NOT skill candidates (those go to pending_review).
 *
 * @param patterns - Original patterns to apply (filters to auto-apply ones)
 * @returns Array of file paths created
 *
 * @example
 * const paths = await applyAutoIntegrations(patterns);
 * console.log(`Created ${paths.length} pattern files`);
 */
export async function applyAutoIntegrations(
  patterns: ExtractedPattern[]
): Promise<string[]> {
  const appliedPaths: string[] = [];

  for (const pattern of patterns) {
    // Only auto-apply patterns that are NOT skill candidates
    if (!isSkillCandidate(pattern)) {
      const filepath = await savePattern(pattern);
      appliedPaths.push(filepath);
    }
  }

  return appliedPaths;
}

/**
 * Format an inline summary of integration results
 *
 * Produces a concise one-line summary per CONTEXT.md format:
 * "Auto-applied: N patterns, M tags | Pending review: K proposals"
 *
 * @param output - The categorized integration output
 * @returns Formatted summary string
 *
 * @example
 * const summary = formatIntegrationSummary(output);
 * // "Auto-applied: 3 patterns, 5 tags | Pending review: 1 skill proposal"
 */
export function formatIntegrationSummary(output: IntegrationOutput): string {
  const parts: string[] = [];

  // Auto-applied section
  const autoItems: string[] = [];
  const patternCount = output.auto_applied.pattern_notes.length;
  const tagCount = output.auto_applied.tags.length;
  const learningCount = output.auto_applied.learnings.length;

  if (patternCount > 0) {
    autoItems.push(`${patternCount} pattern${patternCount === 1 ? "" : "s"}`);
  }
  if (tagCount > 0) {
    autoItems.push(`${tagCount} tag${tagCount === 1 ? "" : "s"}`);
  }
  if (learningCount > 0) {
    autoItems.push(`${learningCount} learning${learningCount === 1 ? "" : "s"}`);
  }

  if (autoItems.length > 0) {
    parts.push(`Auto-applied: ${autoItems.join(", ")}`);
  }

  // Pending review section
  const pendingItems: string[] = [];
  const skillCount = output.pending_review.skill_proposals.length;
  const ruleCount = output.pending_review.rule_modifications.length;

  if (skillCount > 0) {
    pendingItems.push(`${skillCount} skill proposal${skillCount === 1 ? "" : "s"}`);
  }
  if (ruleCount > 0) {
    pendingItems.push(`${ruleCount} rule modification${ruleCount === 1 ? "" : "s"}`);
  }

  if (pendingItems.length > 0) {
    parts.push(`Pending review: ${pendingItems.join(", ")}`);
  }

  // Handle empty case
  if (parts.length === 0) {
    return "No integrations to apply";
  }

  return parts.join(" | ");
}
