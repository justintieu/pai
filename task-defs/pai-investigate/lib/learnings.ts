/**
 * learnings.ts - Learning extraction and persistence from investigations
 *
 * Auto-extracts learnings during investigation (no user confirmation needed).
 * Each learning links to source repo URL and investigation report path.
 */

import { existsSync, mkdirSync } from "fs";
import type { InvestigationReport } from "./report.ts";

/**
 * Learning extracted from an investigation
 */
export interface InvestigationLearning {
  /** Learning title */
  title: string;
  /** Category for storage (always ALGORITHM per research) */
  category: "ALGORITHM";
  /** Source information for attribution */
  source: {
    /** Full repo name (owner/repo) */
    repo: string;
    /** GitHub URL */
    url: string;
    /** Path to investigation report */
    report_path: string;
  };
  /** Core insight extracted */
  insight: string;
  /** Why this matters / context */
  why_it_matters: string;
  /** Searchable tags */
  tags: string[];
}

/**
 * Extract learnings from an investigation report.
 *
 * Converts potential_learnings from the report into structured InvestigationLearning
 * objects with proper attribution and context.
 *
 * @param report - Complete investigation report
 * @param reportPath - Path where report was saved
 * @returns Array of structured learnings
 *
 * @example
 * const report = { insights: { potential_learnings: ["Context management pattern"] }, ... };
 * const learnings = extractLearnings(report, "~/.pai/output/investigations/owner_repo_2026-01-29.yaml");
 */
export function extractLearnings(
  report: InvestigationReport,
  reportPath: string
): InvestigationLearning[] {
  const learnings: InvestigationLearning[] = [];

  // Extract from potential_learnings in insights
  for (const potentialLearning of report.insights.potential_learnings) {
    // Build tags from repo context
    const tags: string[] = [];
    if (report.metadata.language) {
      tags.push(report.metadata.language.toLowerCase());
    }
    for (const topic of report.metadata.topics.slice(0, 5)) {
      tags.push(topic);
    }
    // Add pattern names as tags
    for (const pattern of report.insights.patterns.slice(0, 3)) {
      tags.push(pattern.name.toLowerCase().replace(/\s+/g, "-"));
    }

    // Create learning from potential_learning string
    const learning: InvestigationLearning = {
      title: `Investigation: ${potentialLearning.slice(0, 60)}${potentialLearning.length > 60 ? "..." : ""}`,
      category: "ALGORITHM",
      source: {
        repo: report.investigation.repo,
        url: report.investigation.url,
        report_path: reportPath,
      },
      insight: potentialLearning,
      why_it_matters: buildWhyItMatters(report, potentialLearning),
      tags: [...new Set(tags)], // Deduplicate
    };

    learnings.push(learning);
  }

  // Also extract from notable observations if they're significant
  for (const notable of report.insights.notable) {
    // Only extract notable items that suggest patterns or techniques
    if (notable.toLowerCase().includes("uses") || notable.toLowerCase().includes("pattern")) {
      const tags: string[] = [];
      if (report.metadata.language) {
        tags.push(report.metadata.language.toLowerCase());
      }

      const learning: InvestigationLearning = {
        title: `Notable: ${notable.slice(0, 60)}${notable.length > 60 ? "..." : ""}`,
        category: "ALGORITHM",
        source: {
          repo: report.investigation.repo,
          url: report.investigation.url,
          report_path: reportPath,
        },
        insight: notable,
        why_it_matters: `Observed in ${report.investigation.repo} (${report.metadata.stars} stars). May indicate common practice or interesting approach.`,
        tags: [...new Set(tags)],
      };

      learnings.push(learning);
    }
  }

  return learnings;
}

/**
 * Build the "why it matters" context for a learning
 */
function buildWhyItMatters(report: InvestigationReport, learning: string): string {
  const parts: string[] = [];

  // Add repo context
  parts.push(`Discovered in ${report.investigation.repo}`);
  if (report.metadata.stars > 100) {
    parts.push(`(${report.metadata.stars} stars)`);
  }
  parts.push(".");

  // Add language context
  if (report.metadata.language) {
    parts.push(`Built with ${report.metadata.language}.`);
  }

  // Add pattern context if related
  const relatedPattern = report.insights.patterns.find((p) =>
    learning.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])
  );
  if (relatedPattern) {
    parts.push(`Related pattern: ${relatedPattern.description}`);
  }

  return parts.join(" ");
}

/**
 * Get the learnings directory for a given date
 */
function getLearningsDir(): string {
  const home = Bun.env.HOME || process.env.HOME || "~";
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `${home}/.pai/memory/learning/ALGORITHM/${yearMonth}`;
}

/**
 * Generate a filename for a learning
 */
function generateFilename(learning: InvestigationLearning): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const repoName = learning.source.repo.replace("/", "_").replace(/[^a-zA-Z0-9_-]/g, "");
  return `${date}_investigation_${repoName}.md`;
}

/**
 * Format a learning as markdown
 */
function formatLearningMarkdown(learning: InvestigationLearning): string {
  const lines: string[] = [];

  lines.push("# Investigation Learning");
  lines.push("");
  lines.push(`**Title:** ${learning.title}`);
  lines.push(`**Category:** ${learning.category}`);
  lines.push(`**Source:** [${learning.source.repo}](${learning.source.url})`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Insight");
  lines.push("");
  lines.push(learning.insight);
  lines.push("");
  lines.push("## Why It Matters");
  lines.push("");
  lines.push(learning.why_it_matters);
  lines.push("");
  lines.push("## Tags");
  lines.push("");
  lines.push(learning.tags.join(", "));
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`*Auto-extracted from investigation: ${learning.source.report_path}*`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Save a single learning to the memory directory.
 *
 * @param learning - Learning to save
 * @returns Path to saved file
 *
 * @example
 * const path = await saveLearning(learning);
 * // Returns: /Users/user/.pai/memory/learning/ALGORITHM/2026-01/2026-01-29_investigation_owner_repo.md
 */
export async function saveLearning(learning: InvestigationLearning): Promise<string> {
  const dir = getLearningsDir();
  const filename = generateFilename(learning);
  const filepath = `${dir}/${filename}`;

  // Ensure directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Format and write
  const markdown = formatLearningMarkdown(learning);
  await Bun.write(filepath, markdown);

  return filepath;
}

/**
 * Save multiple learnings to the memory directory.
 *
 * @param learnings - Array of learnings to save
 * @returns Array of paths to saved files
 *
 * @example
 * const paths = await saveAllLearnings(learnings);
 * console.log(paths.length); // Number of files created
 */
export async function saveAllLearnings(learnings: InvestigationLearning[]): Promise<string[]> {
  const paths: string[] = [];

  for (let i = 0; i < learnings.length; i++) {
    const learning = learnings[i];
    // Add index to filename to avoid overwriting when multiple learnings from same repo
    const dir = getLearningsDir();
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const repoName = learning.source.repo.replace("/", "_").replace(/[^a-zA-Z0-9_-]/g, "");
    const suffix = learnings.length > 1 ? `_${i + 1}` : "";
    const filename = `${date}_investigation_${repoName}${suffix}.md`;
    const filepath = `${dir}/${filename}`;

    // Ensure directory exists
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Format and write
    const markdown = formatLearningMarkdown(learning);
    await Bun.write(filepath, markdown);

    paths.push(filepath);
  }

  return paths;
}

// Allow running directly for testing
if (import.meta.main) {
  // Mock a minimal report for testing
  const mockReport: InvestigationReport = {
    investigation: {
      repo: "test/example-repo",
      url: "https://github.com/test/example-repo",
      date: new Date().toISOString(),
      mode: "quick_scan",
    },
    metadata: {
      description: "A test repository",
      language: "TypeScript",
      topics: ["automation", "testing"],
      stars: 500,
      forks: 50,
      size_kb: 1000,
      last_push: new Date().toISOString(),
      created: new Date().toISOString(),
      license: "MIT",
    },
    structure: {
      entry_points: [],
      key_directories: [],
      file_count: 100,
      truncated: false,
    },
    dependencies: null,
    insights: {
      patterns: [{ name: "Process-Save-Summarize", description: "Sub-agent workflow pattern" }],
      notable: ["Uses Bun runtime", "Heavy YAML configuration"],
      potential_learnings: [
        "Context management pattern worth extracting",
        "Sub-agent coordination approach is effective",
      ],
    },
    rate_limit: {
      calls_used: 4,
      calls_remaining: 4996,
    },
  };

  const reportPath = "~/.pai/output/investigations/test_example-repo_2026-01-29.yaml";

  console.log("=== Extract Learnings Test ===\n");

  const learnings = extractLearnings(mockReport, reportPath);
  console.log(`Extracted ${learnings.length} learnings:\n`);

  for (const learning of learnings) {
    console.log(`Title: ${learning.title}`);
    console.log(`Insight: ${learning.insight}`);
    console.log(`Tags: ${learning.tags.join(", ")}`);
    console.log("");
  }

  console.log("=== Save Learnings Test ===\n");

  const paths = await saveAllLearnings(learnings);
  console.log(`Saved ${paths.length} learning files:`);
  for (const path of paths) {
    console.log(`  - ${path}`);
  }
}
