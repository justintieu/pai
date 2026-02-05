/**
 * extractor.ts - Pattern extraction from investigation reports
 *
 * Converts raw investigation patterns into structured ExtractedPattern objects
 * with PAI relevance assessment and filtering. Pattern recognition is Claude's
 * job during investigation; this module structures the results.
 */

import type { InvestigationReport } from "../report.ts";
import type { ExtractedPattern, PatternType, PaiRelevance } from "./types.ts";
import { loadPatternIndex } from "./storage.ts";

/**
 * Keywords that indicate HIGH PAI relevance
 * These patterns are directly useful for PAI agent infrastructure
 */
const HIGH_RELEVANCE_KEYWORDS = [
  "agent",
  "subagent",
  "sub-agent",
  "context",
  "memory",
  "learning",
  "skill",
  "protocol",
  "workflow",
  "delegation",
  "orchestration",
  "autonomous",
];

/**
 * Keywords that indicate MEDIUM PAI relevance
 * These patterns may be adaptable for PAI use
 */
const MEDIUM_RELEVANCE_KEYWORDS = [
  "automation",
  "pattern",
  "structure",
  "organization",
  "cli",
  "tool",
  "pipeline",
  "template",
  "modular",
  "plugin",
];

/**
 * Generate a unique pattern ID from name and repository.
 *
 * Slugifies the pattern name (lowercase, spaces to hyphens) and appends
 * the normalized repository name with underscores.
 *
 * @param name - Pattern name (e.g., "Process-Save-Summarize")
 * @param repo - Repository in owner/repo format
 * @returns Unique ID (e.g., "process-save-summarize_owner_repo")
 *
 * @example
 * generatePatternId("Process-Save-Summarize", "anthropics/cookbook");
 * // Returns: "process-save-summarize_anthropics_cookbook"
 */
export function generatePatternId(name: string, repo: string): string {
  const normalizedName = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const normalizedRepo = repo.replace("/", "_").replace(/[^a-zA-Z0-9_-]/g, "");

  return `${normalizedName}_${normalizedRepo}`;
}

/**
 * Infer pattern type from description by scanning for keywords.
 *
 * Checks the description against keyword patterns to classify:
 * - 'workflow': process, pipeline, workflow terms
 * - 'architectural': architecture, structure, design terms
 * - 'integration': integration, connect, api terms
 * - 'code': default for other patterns
 *
 * @param description - Pattern description to analyze
 * @returns Inferred PatternType
 *
 * @example
 * inferPatternType("A workflow for processing sub-agent results");
 * // Returns: "workflow"
 */
export function inferPatternType(description: string): PatternType {
  const lower = description.toLowerCase();

  // Check workflow keywords first (most specific)
  if (
    lower.includes("workflow") ||
    lower.includes("process") ||
    lower.includes("pipeline") ||
    lower.includes("orchestrat") ||
    lower.includes("sequence")
  ) {
    return "workflow";
  }

  // Check architectural keywords
  if (
    lower.includes("architecture") ||
    lower.includes("structure") ||
    lower.includes("design") ||
    lower.includes("pattern") ||
    lower.includes("layer")
  ) {
    return "architectural";
  }

  // Check integration keywords
  if (
    lower.includes("integration") ||
    lower.includes("connect") ||
    lower.includes("api") ||
    lower.includes("interface") ||
    lower.includes("bridge")
  ) {
    return "integration";
  }

  // Default to code pattern
  return "code";
}

/**
 * Assess how relevant a pattern is to PAI.
 *
 * Evaluates the pattern name and description against PAI-specific keywords
 * to determine relevance level:
 * - HIGH: Core agent/memory/learning concepts
 * - MEDIUM: Automation/tooling concepts
 * - LOW: Everything else
 *
 * @param pattern - Pattern with name and description
 * @returns PAI relevance level
 *
 * @example
 * assessPaiRelevance({ name: "Context Manager", description: "Manages agent context" });
 * // Returns: "high"
 */
export function assessPaiRelevance(pattern: {
  name: string;
  description: string;
}): PaiRelevance {
  const text = `${pattern.name} ${pattern.description}`.toLowerCase();

  // Check for HIGH relevance keywords
  for (const keyword of HIGH_RELEVANCE_KEYWORDS) {
    if (text.includes(keyword)) {
      return "high";
    }
  }

  // Check for MEDIUM relevance keywords
  for (const keyword of MEDIUM_RELEVANCE_KEYWORDS) {
    if (text.includes(keyword)) {
      return "medium";
    }
  }

  // Default to LOW
  return "low";
}

/**
 * Find if an existing PAI pattern provides similar functionality.
 *
 * Uses word overlap heuristic: if more than 50% of words in the new
 * pattern name appear in an existing pattern name, it's a potential match.
 *
 * @param patternName - Name of the new pattern
 * @param existingPatterns - Array of existing pattern IDs/names
 * @returns Existing pattern name if similar, undefined otherwise
 *
 * @example
 * findExistingAlternative("Context Manager", ["context-handler_owner_repo"]);
 * // Returns: "context-handler_owner_repo"
 */
export function findExistingAlternative(
  patternName: string,
  existingPatterns: string[]
): string | undefined {
  const patternWords = patternName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/[\s-]+/)
    .filter((w) => w.length > 2); // Skip short words

  if (patternWords.length === 0) {
    return undefined;
  }

  for (const existing of existingPatterns) {
    const existingWords = existing
      .toLowerCase()
      .replace(/[^a-z0-9\s-_]/g, " ")
      .split(/[\s-_]+/)
      .filter((w) => w.length > 2);

    // Count overlapping words
    const overlap = patternWords.filter((w) => existingWords.includes(w)).length;
    const overlapRatio = overlap / patternWords.length;

    if (overlapRatio > 0.5) {
      return existing;
    }
  }

  return undefined;
}

/**
 * Build searchable tags for a pattern.
 *
 * Combines:
 * - Repository language
 * - First 3 repository topics
 * - Inferred pattern type
 * - Words from pattern name
 *
 * @param report - Investigation report for context
 * @param pattern - Pattern with name and description
 * @returns Deduplicated array of tags
 *
 * @example
 * buildPatternTags(report, { name: "Process Manager", description: "..." });
 * // Returns: ["typescript", "agent", "workflow", "process", "manager"]
 */
export function buildPatternTags(
  report: InvestigationReport,
  pattern: { name: string; description: string }
): string[] {
  const tags: Set<string> = new Set();

  // Add language
  if (report.metadata.language) {
    tags.add(report.metadata.language.toLowerCase());
  }

  // Add first 3 topics
  for (const topic of report.metadata.topics.slice(0, 3)) {
    tags.add(topic.toLowerCase());
  }

  // Add inferred pattern type
  const patternType = inferPatternType(pattern.description);
  tags.add(patternType);

  // Add words from pattern name (lowercase, skip short words)
  const nameWords = pattern.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/[\s-]+/)
    .filter((w) => w.length > 2);

  for (const word of nameWords) {
    tags.add(word);
  }

  return Array.from(tags);
}

/**
 * Extract structured patterns from an investigation report.
 *
 * For each pattern in report.insights.patterns:
 * 1. Generate unique pattern ID
 * 2. Infer pattern type from description
 * 3. Assess PAI relevance
 * 4. Check for existing alternatives
 * 5. Build searchable tags
 * 6. Create ExtractedPattern object
 *
 * Filters out patterns with 'low' PAI relevance.
 *
 * @param report - Investigation report containing patterns
 * @param reportPath - Path to the investigation report file
 * @returns Array of ExtractedPattern objects (low-relevance filtered out)
 *
 * @example
 * const patterns = await extractPatterns(report, "~/.pai/output/investigations/owner_repo_2026-01-31.yaml");
 * console.log(`Extracted ${patterns.length} high/medium relevance patterns`);
 */
export async function extractPatterns(
  report: InvestigationReport,
  reportPath: string
): Promise<ExtractedPattern[]> {
  const patterns: ExtractedPattern[] = [];
  const now = new Date().toISOString();

  // Load existing patterns for alternative comparison
  const patternIndex = await loadPatternIndex();
  const existingPatternIds = Object.keys(patternIndex.patterns);

  for (const rawPattern of report.insights.patterns) {
    // Assess PAI relevance first for early filtering
    const paiRelevance = assessPaiRelevance(rawPattern);

    // Skip low-relevance patterns
    if (paiRelevance === "low") {
      continue;
    }

    // Generate pattern ID
    const id = generatePatternId(rawPattern.name, report.investigation.repo);

    // Infer pattern type
    const type = inferPatternType(rawPattern.description);

    // Find existing alternatives
    const existingAlternative = findExistingAlternative(rawPattern.name, existingPatternIds);

    // Build tags
    const tags = buildPatternTags(report, rawPattern);

    // Create ExtractedPattern object
    const extractedPattern: ExtractedPattern = {
      id,
      name: rawPattern.name,
      type,
      description: rawPattern.description,
      source: {
        repo: report.investigation.repo,
        url: report.investigation.url,
        report_path: reportPath,
      },
      pai_relevance: paiRelevance,
      existing_alternative: existingAlternative,
      tags,
      extracted_at: now,
    };

    patterns.push(extractedPattern);
  }

  return patterns;
}

// Allow running directly for testing
if (import.meta.main) {
  const { generateReport } = await import("../report.ts");

  // Create a mock report with patterns
  const mockReport = generateReport({
    investigation: {
      repo: "anthropics/cookbook",
      url: "https://github.com/anthropics/cookbook",
      mode: "quick_scan",
    },
    metadata: {
      description: "Collection of AI agent patterns",
      language: "TypeScript",
      topics: ["ai", "agents", "patterns"],
      stars: 500,
    },
    insights: {
      patterns: [
        {
          name: "Process-Save-Summarize",
          description: "Sub-agent workflow that processes data, saves to files, returns summaries",
        },
        {
          name: "Context Window Management",
          description: "Pattern for managing agent context window efficiently",
        },
        {
          name: "Simple Utility",
          description: "A basic utility function for string formatting",
        },
      ],
      notable: ["Uses Bun runtime"],
      potential_learnings: ["Context management worth extracting"],
    },
  });

  console.log("=== Pattern Extraction Test ===\n");

  const mockReportPath = "~/.pai/output/investigations/anthropics_cookbook_2026-01-31.yaml";
  const extracted = await extractPatterns(mockReport, mockReportPath);

  console.log(`Extracted ${extracted.length} patterns (filtered from 3):\n`);

  for (const pattern of extracted) {
    console.log(`ID: ${pattern.id}`);
    console.log(`Name: ${pattern.name}`);
    console.log(`Type: ${pattern.type}`);
    console.log(`Relevance: ${pattern.pai_relevance}`);
    console.log(`Tags: ${pattern.tags.join(", ")}`);
    console.log("");
  }
}
