/**
 * proposals.ts - Skill and rule proposal creation
 *
 * Generates proposal documents for complex changes that require user review.
 * Proposals are saved to ~/.pai/memory/patterns/pending/ for later approval.
 */

import { existsSync, mkdirSync } from "fs";
import type { ExtractedPattern } from "./types.ts";

/**
 * Base directory for pending proposals
 */
const HOME = Bun.env.HOME || process.env.HOME || "~";
export const PENDING_DIR = `${HOME}/.pai/memory/patterns/pending`;

/**
 * A skill proposal generated from an extracted pattern
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
 * Create a skill proposal from an extracted pattern
 *
 * Generates a proposal with slugified name and default skill location.
 *
 * @param pattern - The pattern to create a proposal for
 * @returns A skill proposal with pending status
 *
 * @example
 * const proposal = createSkillProposal(pattern);
 * console.log(proposal.proposed_name); // "process-save-summarize"
 * console.log(proposal.proposed_location); // "~/.pai/skills/process-save-summarize/SKILL.md"
 */
export function createSkillProposal(pattern: ExtractedPattern): SkillProposal {
  const proposedName = pattern.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return {
    pattern,
    proposed_name: proposedName,
    proposed_location: `${HOME}/.pai/skills/${proposedName}/SKILL.md`,
    description: pattern.description,
    status: "pending",
  };
}

/**
 * Generate a skeleton SKILL.md for a proposed skill
 *
 * Creates markdown content following the PAI skill format.
 *
 * @param proposal - The skill proposal to generate a skeleton for
 * @returns Markdown content for the SKILL.md file
 *
 * @example
 * const skeleton = generateSkillSkeleton(proposal);
 * console.log(skeleton); // Full SKILL.md markdown
 */
export function generateSkillSkeleton(proposal: SkillProposal): string {
  const lines: string[] = [];

  lines.push(`# ${proposal.proposed_name}`);
  lines.push("");
  lines.push("**Status:** Proposed");
  lines.push(`**Source:** ${proposal.pattern.source.repo}`);
  lines.push("");

  lines.push("## Purpose");
  lines.push("");
  lines.push(proposal.description);
  lines.push("");

  lines.push("## Invocation");
  lines.push("");
  lines.push(`\`/pai ${proposal.proposed_name}\``);
  lines.push("");

  lines.push("## Workflow");
  lines.push("");
  lines.push("[To be defined upon approval]");
  lines.push("");

  lines.push("## Context Required");
  lines.push("");
  lines.push("[To be defined upon approval]");
  lines.push("");

  lines.push("---");
  lines.push(
    `*Proposed from investigation: ${proposal.pattern.source.report_path}*`
  );
  lines.push("");

  return lines.join("\n");
}

/**
 * Create a rule modification proposal from an extracted pattern
 *
 * @param pattern - The pattern to create a proposal for
 * @param targetFile - The rule file to modify (e.g., "~/.pai/rules/workflows.md")
 * @returns A rule modification proposal with pending status
 *
 * @example
 * const proposal = createRuleProposal(pattern, "~/.pai/rules/workflows.md");
 * console.log(proposal.change_type); // "add"
 */
export function createRuleProposal(
  pattern: ExtractedPattern,
  targetFile: string
): RuleModification {
  // Generate proposed content based on pattern
  const proposedContent = [
    `## ${pattern.name}`,
    "",
    `**Source:** ${pattern.source.repo}`,
    "",
    pattern.description,
    "",
    "### When to Use",
    "",
    `Apply this pattern when working with ${pattern.type} scenarios.`,
    "",
    pattern.source.snippet
      ? ["### Example", "", "```", pattern.source.snippet, "```", ""].join("\n")
      : "",
    `*Tags: ${pattern.tags.join(", ")}*`,
    "",
  ].join("\n");

  return {
    pattern,
    target_file: targetFile,
    change_type: "add",
    proposed_content: proposedContent,
    status: "pending",
  };
}

/**
 * Format a proposal as markdown for the pending/ directory
 *
 * Creates a human-readable proposal document with all relevant details.
 *
 * @param proposal - The proposal to format (skill or rule)
 * @param type - The type of proposal
 * @returns Formatted markdown string
 */
export function formatProposalMarkdown(
  proposal: SkillProposal | RuleModification,
  type: "skill" | "rule"
): string {
  const lines: string[] = [];
  const now = new Date().toISOString();
  const id = proposal.pattern.id;

  if (type === "skill") {
    const skillProposal = proposal as SkillProposal;

    lines.push(`# Proposal: ${skillProposal.proposed_name}`);
    lines.push("");
    lines.push("**Type:** skill");
    lines.push("**Status:** pending");
    lines.push(`**Created:** ${now}`);
    lines.push("");

    lines.push("## Source");
    lines.push("");
    lines.push(`Pattern: ${skillProposal.pattern.name}`);
    lines.push(`Repo: ${skillProposal.pattern.source.repo}`);
    lines.push("");

    lines.push("## Proposed Change");
    lines.push("");
    lines.push(`Create new skill at: \`${skillProposal.proposed_location}\``);
    lines.push("");
    lines.push("### Skill Skeleton");
    lines.push("");
    lines.push("```markdown");
    lines.push(generateSkillSkeleton(skillProposal));
    lines.push("```");
    lines.push("");
  } else {
    const ruleProposal = proposal as RuleModification;

    lines.push(`# Proposal: Rule Modification`);
    lines.push("");
    lines.push("**Type:** rule");
    lines.push("**Status:** pending");
    lines.push(`**Created:** ${now}`);
    lines.push("");

    lines.push("## Source");
    lines.push("");
    lines.push(`Pattern: ${ruleProposal.pattern.name}`);
    lines.push(`Repo: ${ruleProposal.pattern.source.repo}`);
    lines.push("");

    lines.push("## Proposed Change");
    lines.push("");
    lines.push(`Target file: \`${ruleProposal.target_file}\``);
    lines.push(`Change type: ${ruleProposal.change_type}`);
    lines.push("");
    lines.push("### Proposed Content");
    lines.push("");
    lines.push("```markdown");
    lines.push(ruleProposal.proposed_content);
    lines.push("```");
    lines.push("");
  }

  lines.push("## To Approve");
  lines.push("");
  lines.push(`Run \`/pai approve-proposal ${id}\` or review and apply manually.`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Save a proposal to the pending/ directory
 *
 * Creates a markdown file with the proposal details for later review.
 *
 * @param proposal - The proposal to save
 * @param type - The type of proposal ("skill" or "rule")
 * @returns The file path where the proposal was saved
 *
 * @example
 * const path = await saveProposal(skillProposal, "skill");
 * console.log(`Saved to: ${path}`);
 */
export async function saveProposal(
  proposal: SkillProposal | RuleModification,
  type: "skill" | "rule"
): Promise<string> {
  // Ensure directory exists
  if (!existsSync(PENDING_DIR)) {
    mkdirSync(PENDING_DIR, { recursive: true });
  }

  // Generate filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const id = proposal.pattern.id;
  const filename = `${type}_${id}_${timestamp}.md`;
  const filepath = `${PENDING_DIR}/${filename}`;

  // Format and write
  const markdown = formatProposalMarkdown(proposal, type);
  await Bun.write(filepath, markdown);

  return filepath;
}

/**
 * Get all pending proposals from the directory
 *
 * @returns Array of filenames in the pending directory
 */
export async function getPendingProposals(): Promise<string[]> {
  if (!existsSync(PENDING_DIR)) {
    return [];
  }

  const glob = new Bun.Glob("*.md");
  const files: string[] = [];
  for await (const file of glob.scan(PENDING_DIR)) {
    files.push(file);
  }
  return files;
}
