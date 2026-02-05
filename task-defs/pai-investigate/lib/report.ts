/**
 * report.ts - Investigation report generation and persistence
 *
 * Generates structured YAML reports for GitHub repository investigations.
 * Reports are saved to ~/.pai/output/investigations/ for future reference.
 */

import { existsSync, mkdirSync } from "fs";

/**
 * Entry point type within a repository
 */
export type EntryPointType = "main_entry" | "documentation" | "config" | "test_entry";

/**
 * Investigation mode
 */
export type InvestigationMode = "quick_scan" | "deep_dive";

/**
 * Full investigation report structure
 */
export interface InvestigationReport {
  investigation: {
    /** Repository in owner/repo format */
    repo: string;
    /** Full GitHub URL */
    url: string;
    /** ISO timestamp of investigation */
    date: string;
    /** Investigation mode used */
    mode: InvestigationMode;
  };
  metadata: {
    /** Repository description */
    description: string | null;
    /** Primary language */
    language: string | null;
    /** GitHub topics */
    topics: string[];
    /** Star count */
    stars: number;
    /** Fork count */
    forks: number;
    /** Repository size in KB */
    size_kb: number;
    /** Last push date (ISO) */
    last_push: string;
    /** Creation date (ISO) */
    created: string;
    /** License identifier or null */
    license: string | null;
  };
  structure: {
    /** Detected entry points for reading the repo */
    entry_points: Array<{
      path: string;
      type: EntryPointType;
    }>;
    /** Key directories with purposes */
    key_directories: Array<{
      path: string;
      purpose: string;
    }>;
    /** Total file count */
    file_count: number;
    /** Whether tree was truncated (>100k files) */
    truncated: boolean;
  };
  dependencies: {
    /** Runtime dependencies */
    runtime: Array<{ name: string; version?: string }>;
    /** Dev dependencies */
    dev: Array<{ name: string; version?: string }>;
  } | null;
  insights: {
    /** Identified patterns in the codebase */
    patterns: Array<{
      name: string;
      description: string;
    }>;
    /** Notable observations */
    notable: string[];
    /** Potential learnings to extract */
    potential_learnings: string[];
  };
  rate_limit: {
    /** API calls used during investigation */
    calls_used: number;
    /** API calls remaining after investigation */
    calls_remaining: number;
  };
}

/**
 * Default empty report values
 */
const DEFAULT_REPORT: InvestigationReport = {
  investigation: {
    repo: "",
    url: "",
    date: new Date().toISOString(),
    mode: "quick_scan",
  },
  metadata: {
    description: null,
    language: null,
    topics: [],
    stars: 0,
    forks: 0,
    size_kb: 0,
    last_push: "",
    created: "",
    license: null,
  },
  structure: {
    entry_points: [],
    key_directories: [],
    file_count: 0,
    truncated: false,
  },
  dependencies: null,
  insights: {
    patterns: [],
    notable: [],
    potential_learnings: [],
  },
  rate_limit: {
    calls_used: 0,
    calls_remaining: 0,
  },
};

/**
 * Generate a complete investigation report from partial data.
 *
 * @param data - Partial report data to merge with defaults
 * @returns Complete InvestigationReport with all fields populated
 *
 * @example
 * const report = generateReport({
 *   investigation: { repo: "owner/repo", url: "https://github.com/owner/repo", mode: "quick_scan" },
 *   metadata: { description: "Test", language: "TypeScript", stars: 100 }
 * });
 */
export function generateReport(data: Partial<InvestigationReport>): InvestigationReport {
  const now = new Date().toISOString();

  return {
    investigation: {
      ...DEFAULT_REPORT.investigation,
      date: now,
      ...data.investigation,
    },
    metadata: {
      ...DEFAULT_REPORT.metadata,
      ...data.metadata,
    },
    structure: {
      ...DEFAULT_REPORT.structure,
      ...data.structure,
    },
    dependencies: data.dependencies ?? DEFAULT_REPORT.dependencies,
    insights: {
      ...DEFAULT_REPORT.insights,
      ...data.insights,
    },
    rate_limit: {
      ...DEFAULT_REPORT.rate_limit,
      ...data.rate_limit,
    },
  };
}

/**
 * Stringify a value for YAML output with proper escaping
 */
function yamlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string") {
    // Quote strings with special characters
    if (value.includes(":") || value.includes("#") || value.includes("\n") || value.includes('"')) {
      return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return value || '""';
  }
  return String(value);
}

/**
 * Convert investigation report to YAML string
 */
function reportToYaml(report: InvestigationReport): string {
  const lines: string[] = [];

  // Investigation section
  lines.push("investigation:");
  lines.push(`  repo: ${yamlValue(report.investigation.repo)}`);
  lines.push(`  url: ${yamlValue(report.investigation.url)}`);
  lines.push(`  date: ${yamlValue(report.investigation.date)}`);
  lines.push(`  mode: ${report.investigation.mode}`);
  lines.push("");

  // Metadata section
  lines.push("metadata:");
  lines.push(`  description: ${yamlValue(report.metadata.description)}`);
  lines.push(`  language: ${yamlValue(report.metadata.language)}`);
  if (report.metadata.topics.length === 0) {
    lines.push("  topics: []");
  } else {
    lines.push("  topics:");
    for (const topic of report.metadata.topics) {
      lines.push(`    - ${topic}`);
    }
  }
  lines.push(`  stars: ${report.metadata.stars}`);
  lines.push(`  forks: ${report.metadata.forks}`);
  lines.push(`  size_kb: ${report.metadata.size_kb}`);
  lines.push(`  last_push: ${yamlValue(report.metadata.last_push)}`);
  lines.push(`  created: ${yamlValue(report.metadata.created)}`);
  lines.push(`  license: ${yamlValue(report.metadata.license)}`);
  lines.push("");

  // Structure section
  lines.push("structure:");
  if (report.structure.entry_points.length === 0) {
    lines.push("  entry_points: []");
  } else {
    lines.push("  entry_points:");
    for (const ep of report.structure.entry_points) {
      lines.push(`    - path: ${yamlValue(ep.path)}`);
      lines.push(`      type: ${ep.type}`);
    }
  }
  if (report.structure.key_directories.length === 0) {
    lines.push("  key_directories: []");
  } else {
    lines.push("  key_directories:");
    for (const kd of report.structure.key_directories) {
      lines.push(`    - path: ${yamlValue(kd.path)}`);
      lines.push(`      purpose: ${kd.purpose}`);
    }
  }
  lines.push(`  file_count: ${report.structure.file_count}`);
  lines.push(`  truncated: ${report.structure.truncated}`);
  lines.push("");

  // Dependencies section
  if (report.dependencies === null) {
    lines.push("dependencies: null");
  } else {
    lines.push("dependencies:");
    if (report.dependencies.runtime.length === 0) {
      lines.push("  runtime: []");
    } else {
      lines.push("  runtime:");
      for (const dep of report.dependencies.runtime) {
        if (dep.version) {
          lines.push(`    - name: ${dep.name}`);
          lines.push(`      version: ${yamlValue(dep.version)}`);
        } else {
          lines.push(`    - name: ${dep.name}`);
        }
      }
    }
    if (report.dependencies.dev.length === 0) {
      lines.push("  dev: []");
    } else {
      lines.push("  dev:");
      for (const dep of report.dependencies.dev) {
        if (dep.version) {
          lines.push(`    - name: ${dep.name}`);
          lines.push(`      version: ${yamlValue(dep.version)}`);
        } else {
          lines.push(`    - name: ${dep.name}`);
        }
      }
    }
  }
  lines.push("");

  // Insights section
  lines.push("insights:");
  if (report.insights.patterns.length === 0) {
    lines.push("  patterns: []");
  } else {
    lines.push("  patterns:");
    for (const p of report.insights.patterns) {
      lines.push(`    - name: ${yamlValue(p.name)}`);
      lines.push(`      description: ${yamlValue(p.description)}`);
    }
  }
  if (report.insights.notable.length === 0) {
    lines.push("  notable: []");
  } else {
    lines.push("  notable:");
    for (const n of report.insights.notable) {
      lines.push(`    - ${yamlValue(n)}`);
    }
  }
  if (report.insights.potential_learnings.length === 0) {
    lines.push("  potential_learnings: []");
  } else {
    lines.push("  potential_learnings:");
    for (const pl of report.insights.potential_learnings) {
      lines.push(`    - ${yamlValue(pl)}`);
    }
  }
  lines.push("");

  // Rate limit section
  lines.push("rate_limit:");
  lines.push(`  calls_used: ${report.rate_limit.calls_used}`);
  lines.push(`  calls_remaining: ${report.rate_limit.calls_remaining}`);

  return lines.join("\n");
}

/**
 * Get the investigations output directory
 */
function getInvestigationsDir(): string {
  const home = Bun.env.HOME || process.env.HOME || "~";
  return `${home}/.pai/output/investigations`;
}

/**
 * Save an investigation report to YAML file.
 *
 * @param report - Complete investigation report
 * @returns Full path to saved file
 *
 * @example
 * const path = await saveReport(report);
 * // Returns: /Users/user/.pai/output/investigations/owner_repo_2026-01-29.yaml
 */
export async function saveReport(report: InvestigationReport): Promise<string> {
  // Extract owner and repo from report
  const [owner, repo] = report.investigation.repo.split("/");
  const date = report.investigation.date.split("T")[0]; // YYYY-MM-DD

  // Generate filename: owner_repo_YYYY-MM-DD.yaml
  const filename = `${owner}_${repo}_${date}.yaml`;
  const dir = getInvestigationsDir();
  const filepath = `${dir}/${filename}`;

  // Ensure directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Convert to YAML and write
  const yaml = reportToYaml(report);
  await Bun.write(filepath, yaml + "\n");

  return filepath;
}

/**
 * Generate a concise inline summary for conversation context.
 *
 * Optimized to stay under 1000 characters while providing key information.
 *
 * @param report - Complete investigation report
 * @returns Markdown summary suitable for inline display
 *
 * @example
 * const summary = generateInlineSummary(report);
 * // Returns markdown with overview, structure, patterns, learnings
 */
export function generateInlineSummary(report: InvestigationReport): string {
  const { investigation, metadata, structure, insights } = report;

  const lines: string[] = [];

  // Overview line
  const lang = metadata.language || "Unknown";
  const stars = metadata.stars > 0 ? ` | ${metadata.stars} stars` : "";
  lines.push(`**${investigation.repo}** (${lang}${stars})`);

  // Description if available
  if (metadata.description) {
    const desc = metadata.description.length > 100
      ? metadata.description.slice(0, 97) + "..."
      : metadata.description;
    lines.push(`> ${desc}`);
  }
  lines.push("");

  // Structure highlights
  const mainEntry = structure.entry_points.find((e) => e.type === "main_entry");
  const docEntry = structure.entry_points.find((e) => e.type === "documentation");
  if (mainEntry || docEntry) {
    lines.push("**Entry points:**");
    if (mainEntry) lines.push(`- Main: \`${mainEntry.path}\``);
    if (docEntry) lines.push(`- Docs: \`${docEntry.path}\``);
    lines.push("");
  }

  // Key directories (limit to 3)
  if (structure.key_directories.length > 0) {
    const dirs = structure.key_directories.slice(0, 3);
    lines.push(`**Structure:** ${dirs.map((d) => d.path).join(", ")}`);
    lines.push("");
  }

  // Notable patterns (limit to 2)
  if (insights.patterns.length > 0) {
    lines.push("**Patterns:**");
    for (const p of insights.patterns.slice(0, 2)) {
      lines.push(`- ${p.name}`);
    }
    lines.push("");
  }

  // Potential learnings (limit to 3)
  if (insights.potential_learnings.length > 0) {
    lines.push("**Worth exploring:**");
    for (const pl of insights.potential_learnings.slice(0, 3)) {
      const truncated = pl.length > 60 ? pl.slice(0, 57) + "..." : pl;
      lines.push(`- ${truncated}`);
    }
    lines.push("");
  }

  // Full report link
  const [owner, repo] = investigation.repo.split("/");
  const date = investigation.date.split("T")[0];
  const reportPath = `~/.pai/output/investigations/${owner}_${repo}_${date}.yaml`;
  lines.push(`*Full report: ${reportPath}*`);

  return lines.join("\n");
}

// Allow running directly for testing
if (import.meta.main) {
  const report = generateReport({
    investigation: {
      repo: "test/repo",
      url: "https://github.com/test/repo",
      mode: "quick_scan",
    },
    metadata: {
      description: "A test repository for demonstration",
      language: "TypeScript",
      stars: 100,
      topics: ["test", "demo"],
    },
    structure: {
      entry_points: [
        { path: "README.md", type: "documentation" },
        { path: "src/index.ts", type: "main_entry" },
      ],
      key_directories: [
        { path: "src/", purpose: "source_code" },
        { path: "tests/", purpose: "testing" },
      ],
      file_count: 42,
    },
    insights: {
      patterns: [{ name: "Process-Save-Summarize", description: "Sub-agent workflow pattern" }],
      notable: ["Uses Bun runtime"],
      potential_learnings: ["Context management worth extracting"],
    },
    rate_limit: {
      calls_used: 4,
      calls_remaining: 4996,
    },
  });

  console.log("=== Generated Report ===");
  console.log(JSON.stringify(report, null, 2));

  const path = await saveReport(report);
  console.log("\n=== Saved to ===");
  console.log(path);

  const summary = generateInlineSummary(report);
  console.log("\n=== Inline Summary ===");
  console.log(summary);
  console.log(`\n(Summary length: ${summary.length} chars)`);
}
