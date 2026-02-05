/**
 * types.ts - Pattern type definitions for extracted patterns
 *
 * Defines the data structures for patterns extracted from investigated repositories.
 * Patterns are classified by type and relevance to PAI, and can be integrated
 * through various automation levels based on the autonomy protocol.
 */

/**
 * Types of patterns that can be extracted from repositories
 */
export type PatternType = "architectural" | "code" | "workflow" | "integration";

/**
 * Automation level for pattern integrations
 */
export type AutomationLevel = "auto" | "review";

/**
 * PAI relevance classification for patterns
 */
export type PaiRelevance = "high" | "medium" | "low";

/**
 * Source information for an extracted pattern
 */
export interface PatternSource {
  /** Repository in owner/repo format */
  repo: string;
  /** Full GitHub URL */
  url: string;
  /** Path to the investigation report that found this pattern */
  report_path: string;
  /** Optional file path where pattern was observed */
  file?: string;
  /** Optional code snippet demonstrating the pattern */
  snippet?: string;
}

/**
 * A pattern extracted from an investigation
 *
 * Patterns represent reusable approaches, techniques, or structures
 * discovered during repository investigation that may be valuable
 * for PAI to adopt or learn from.
 *
 * @example
 * const pattern: ExtractedPattern = {
 *   id: "process-save-summarize_anthropics_anthropic-cookbook",
 *   name: "Process-Save-Summarize",
 *   type: "workflow",
 *   description: "Sub-agent workflow that processes data, saves to files, returns summaries",
 *   source: {
 *     repo: "anthropics/anthropic-cookbook",
 *     url: "https://github.com/anthropics/anthropic-cookbook",
 *     report_path: "~/.pai/output/investigations/anthropics_anthropic-cookbook_2026-01-29.yaml"
 *   },
 *   pai_relevance: "high",
 *   tags: ["workflow", "sub-agent", "delegation"],
 *   extracted_at: "2026-01-29T10:30:00Z"
 * };
 */
export interface ExtractedPattern {
  /** Unique pattern identifier (e.g., "process-save-summarize_owner_repo") */
  id: string;
  /** Human-readable pattern name (e.g., "Process-Save-Summarize") */
  name: string;
  /** Classification of pattern type */
  type: PatternType;
  /** Description of what the pattern does */
  description: string;
  /** Source information linking back to origin */
  source: PatternSource;
  /** How relevant this pattern is to PAI */
  pai_relevance: PaiRelevance;
  /** Existing PAI pattern/skill that provides similar functionality (if any) */
  existing_alternative?: string;
  /** Searchable tags for categorization */
  tags: string[];
  /** ISO timestamp when pattern was extracted */
  extracted_at: string;
}

/**
 * Types of integration actions that can be performed with patterns
 */
export type IntegrationType =
  | "tag"
  | "learning"
  | "pattern_note"
  | "skill_proposal"
  | "agent_proposal"
  | "rule_modification"
  | "workflow_change";

/**
 * An integration action to apply a pattern to PAI
 *
 * Integrations are categorized by their automation level:
 * - 'auto': Applied automatically without user review
 * - 'review': Requires user approval before applying
 *
 * @example
 * const integration: PatternIntegration = {
 *   type: "skill_proposal",
 *   level: "review",
 *   content: {
 *     name: "sub-agent-coordinator",
 *     based_on: "process-save-summarize_anthropics_anthropic-cookbook"
 *   }
 * };
 */
export interface PatternIntegration {
  /** Type of integration action */
  type: IntegrationType;
  /** Automation level (auto-apply or requires review) */
  level: AutomationLevel;
  /** Integration-specific content */
  content: unknown;
}

/**
 * Mapping of integration types to automation levels
 *
 * Based on autonomy-levels.md protocol:
 * - Auto-apply: metadata and memory additions (low risk)
 * - Require review: structural PAI changes (high risk)
 *
 * @example
 * const level = AUTONOMY_MAP["skill_proposal"]; // "review"
 */
export const AUTONOMY_MAP: Record<IntegrationType, AutomationLevel> = {
  // Auto-apply: metadata and memory additions
  tag: "auto",
  learning: "auto",
  pattern_note: "auto",

  // Require review: structural PAI changes
  skill_proposal: "review",
  agent_proposal: "review",
  rule_modification: "review",
  workflow_change: "review",
};

/**
 * Check if an integration type should be auto-applied
 *
 * @param type - Integration type to check
 * @returns true if the integration can be auto-applied
 */
export function isAutoApply(type: IntegrationType): boolean {
  return AUTONOMY_MAP[type] === "auto";
}

/**
 * Check if an integration type requires user review
 *
 * @param type - Integration type to check
 * @returns true if the integration requires review
 */
export function requiresReview(type: IntegrationType): boolean {
  return AUTONOMY_MAP[type] === "review";
}
