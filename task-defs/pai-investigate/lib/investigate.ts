/**
 * investigate.ts - Core investigation orchestrator
 *
 * Main entry point for GitHub repository investigations. Coordinates rate limits,
 * API calls, report generation, dependency extraction, and learning extraction.
 */

import { checkRateLimit, formatRateLimitMessage } from "./rate-limit.ts";
import { parseGitHubUrl } from "./url-parser.ts";
import { getRepoMetadata, getReadme, getTree } from "./api-client.ts";
import { generateReport, saveReport, generateInlineSummary, type InvestigationReport } from "./report.ts";
import { detectEntryPoints, detectKeyDirectories } from "./entry-points.ts";
import { parseDependencies } from "./dependencies.ts";
import { extractLearnings, saveAllLearnings } from "./learnings.ts";
import { resolveReference } from "./discovery/result-context.ts";

/**
 * Result of an investigation operation
 */
export interface InvestigationResult {
  /** Whether investigation completed successfully */
  success: boolean;
  /** Full investigation report (if successful) */
  report?: InvestigationReport;
  /** Path to saved report file */
  report_path?: string;
  /** Concise summary for inline display */
  inline_summary?: string;
  /** Paths to saved learning files */
  learnings_saved?: string[];
  /** Error message if investigation failed */
  error?: string;
  /** Rate limit information */
  rate_limit_info?: {
    remaining: number;
    reset_time: string;
    blocked: boolean;
  };
}

/**
 * Investigation options
 */
export interface InvestigationOptions {
  /** Investigation mode (default: quick_scan) */
  mode?: "quick_scan" | "deep_dive";
  /** Minimum rate limit required to start (default: 50) */
  min_rate_limit?: number;
  /** Whether to extract and save learnings (default: true) */
  extract_learnings?: boolean;
}

/**
 * Investigate a GitHub repository.
 *
 * Main entry point for repository investigation. Coordinates:
 * 1. URL parsing and validation
 * 2. Rate limit checking (blocks if too low)
 * 3. Metadata, README, and tree fetching
 * 4. Dependency extraction from manifest files
 * 5. Entry point and directory detection
 * 6. Report generation and persistence
 * 7. Learning extraction and persistence
 *
 * @param urlOrRef - GitHub repository URL (any format) or numbered reference (#1, #2, etc.)
 * @param options - Investigation options
 * @returns InvestigationResult with report, summary, and learnings
 *
 * @example
 * // By URL
 * const result = await investigate("https://github.com/anthropics/anthropic-cookbook");
 * if (result.success) {
 *   console.log("Report:", result.report_path);
 *   console.log("Summary:", result.inline_summary);
 *   console.log("Learnings:", result.learnings_saved?.length);
 * } else {
 *   console.log("Error:", result.error);
 * }
 *
 * @example
 * // By numbered reference (after running searchRepos)
 * await searchRepos("agent framework");  // Returns numbered results
 * const result = await investigate("#1"); // Investigates first result
 */
export async function investigate(
  urlOrRef: string,
  options?: InvestigationOptions
): Promise<InvestigationResult> {
  const mode = options?.mode ?? "quick_scan";
  const minRateLimit = options?.min_rate_limit ?? 50;
  const shouldExtractLearnings = options?.extract_learnings !== false;

  // 0. Resolve numbered references (#3, 3, result 3) to URLs
  let url = urlOrRef;
  if (urlOrRef.startsWith("#") || /^\d+$/.test(urlOrRef)) {
    const resolved = await resolveReference(urlOrRef);
    if (!resolved) {
      return {
        success: false,
        error: `Could not resolve reference: ${urlOrRef}. Run a search first to get numbered results.`,
      };
    }
    url = resolved;
  }

  // Track API calls for report
  let callsUsed = 0;

  // 1. Parse URL
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return {
      success: false,
      error: `Invalid GitHub URL: ${url}`,
    };
  }

  // 2. Check rate limit (before any API calls)
  const rateLimit = await checkRateLimit(minRateLimit);
  callsUsed++; // rate_limit check uses 1 call

  if (rateLimit.error) {
    return {
      success: false,
      error: rateLimit.error,
      rate_limit_info: {
        remaining: 0,
        reset_time: "Unknown",
        blocked: true,
      },
    };
  }

  if (!rateLimit.sufficient) {
    return {
      success: false,
      error: `Rate limit too low (${rateLimit.remaining} remaining, need ${minRateLimit}). Resets at ${rateLimit.resetTimeFormatted}`,
      rate_limit_info: {
        remaining: rateLimit.remaining,
        reset_time: rateLimit.resetTimeFormatted,
        blocked: true,
      },
    };
  }

  // 3. Fetch repository metadata
  const metadata = await getRepoMetadata(parsed.owner, parsed.repo);
  callsUsed++;

  if (!metadata) {
    return {
      success: false,
      error: `Repository not found or not accessible: ${parsed.owner}/${parsed.repo}`,
      rate_limit_info: {
        remaining: rateLimit.remaining - callsUsed,
        reset_time: rateLimit.resetTimeFormatted,
        blocked: false,
      },
    };
  }

  // 4. Fetch README
  const readme = await getReadme(parsed.owner, parsed.repo);
  callsUsed++;

  // 5. Fetch tree structure
  const tree = await getTree(parsed.owner, parsed.repo, metadata.default_branch);
  callsUsed++;

  // 6. Parse dependencies (may use 1 API call to fetch manifest content)
  const dependencies = await parseDependencies(parsed.owner, parsed.repo, tree, metadata.language);
  if (dependencies) {
    callsUsed++; // Dependency parsing fetches manifest file
  }

  // 7. Detect entry points and key directories
  const entryPoints = detectEntryPoints(tree?.files ?? [], readme);
  const keyDirectories = detectKeyDirectories(tree?.directories ?? []);

  // 8. Generate report
  const report = generateReport({
    investigation: {
      repo: `${parsed.owner}/${parsed.repo}`,
      url: parsed.url,
      mode,
    },
    metadata: {
      description: metadata.description,
      language: metadata.language,
      topics: metadata.topics,
      stars: metadata.stars,
      forks: metadata.forks,
      size_kb: metadata.size_kb,
      last_push: metadata.pushed_at,
      created: metadata.created_at,
      license: metadata.license,
    },
    structure: {
      entry_points: entryPoints,
      key_directories: keyDirectories,
      file_count: tree?.file_count ?? 0,
      truncated: tree?.truncated ?? false,
    },
    dependencies,
    insights: {
      patterns: [],
      notable: buildNotableObservations(metadata, tree, readme),
      potential_learnings: buildPotentialLearnings(metadata, tree, readme),
    },
    rate_limit: {
      calls_used: callsUsed,
      calls_remaining: rateLimit.remaining - callsUsed,
    },
  });

  // 9. Save report
  let reportPath: string;
  try {
    reportPath = await saveReport(report);
  } catch (error) {
    return {
      success: false,
      error: `Failed to save report: ${error instanceof Error ? error.message : String(error)}`,
      rate_limit_info: {
        remaining: rateLimit.remaining - callsUsed,
        reset_time: rateLimit.resetTimeFormatted,
        blocked: false,
      },
    };
  }

  // 10. Extract and save learnings (if enabled)
  let learningsPaths: string[] = [];
  if (shouldExtractLearnings) {
    const learnings = extractLearnings(report, reportPath);
    if (learnings.length > 0) {
      try {
        learningsPaths = await saveAllLearnings(learnings);
      } catch {
        // Non-fatal: learnings save failed but investigation succeeded
        console.warn("Warning: Failed to save learnings");
      }
    }
  }

  // 11. Generate inline summary
  const inlineSummary = generateInlineSummary(report);

  return {
    success: true,
    report,
    report_path: reportPath,
    inline_summary: inlineSummary,
    learnings_saved: learningsPaths,
    rate_limit_info: {
      remaining: rateLimit.remaining - callsUsed,
      reset_time: rateLimit.resetTimeFormatted,
      blocked: false,
    },
  };
}

/**
 * Build notable observations from repo data
 */
function buildNotableObservations(
  metadata: Awaited<ReturnType<typeof getRepoMetadata>>,
  tree: Awaited<ReturnType<typeof getTree>>,
  readme: string | null
): string[] {
  const notable: string[] = [];

  if (!metadata) return notable;

  // Language observation
  if (metadata.language) {
    notable.push(`Uses ${metadata.language}`);
  }

  // Popularity observation
  if (metadata.stars > 1000) {
    notable.push(`Popular repository (${metadata.stars} stars)`);
  } else if (metadata.stars > 100) {
    notable.push(`Active repository (${metadata.stars} stars)`);
  }

  // Size observation
  if (metadata.size_kb > 100000) {
    notable.push("Large repository (>100MB)");
  }

  // Tree observations
  if (tree) {
    if (tree.truncated) {
      notable.push("Large codebase (tree truncated, >100k files)");
    }
    if (tree.files.length > 500) {
      notable.push(`Substantial codebase (${tree.files.length} files)`);
    }
  }

  // README observations
  if (readme) {
    const readmeLength = readme.length;
    if (readmeLength > 10000) {
      notable.push("Comprehensive documentation");
    }
    // Check for specific patterns in README
    if (readme.toLowerCase().includes("contributing")) {
      notable.push("Has contribution guidelines");
    }
  }

  // License observation
  if (metadata.license) {
    notable.push(`${metadata.license} licensed`);
  }

  return notable.slice(0, 5); // Limit to 5 notable items
}

/**
 * Build potential learnings from repo data
 */
function buildPotentialLearnings(
  metadata: Awaited<ReturnType<typeof getRepoMetadata>>,
  tree: Awaited<ReturnType<typeof getTree>>,
  readme: string | null
): string[] {
  const learnings: string[] = [];

  if (!metadata || !tree) return learnings;

  // Architecture patterns based on directory structure
  if (tree.directories.includes("src") && tree.directories.includes("lib")) {
    learnings.push("Separation of source and library code pattern");
  }
  if (tree.directories.includes("packages") || tree.directories.includes("pkg")) {
    learnings.push("Monorepo or multi-package architecture");
  }
  if (tree.directories.includes("cmd")) {
    learnings.push("Go-style command organization pattern");
  }

  // Testing patterns
  const hasTests = tree.directories.some((d) =>
    ["tests", "test", "__tests__", "spec"].includes(d)
  );
  if (hasTests) {
    learnings.push("Testing infrastructure worth examining");
  }

  // Documentation patterns
  if (tree.directories.includes("docs") || tree.directories.includes("documentation")) {
    learnings.push("Documentation organization approach");
  }

  // CI/CD patterns
  if (tree.directories.includes(".github") && tree.files.some((f) => f.path.includes(".github/workflows"))) {
    learnings.push("GitHub Actions workflow patterns");
  }

  // Popular repo = likely good patterns
  if (metadata.stars > 500) {
    learnings.push("Popular repo patterns worth studying");
  }

  // README-based learnings
  if (readme) {
    const readmeLower = readme.toLowerCase();
    if (readmeLower.includes("architecture") || readmeLower.includes("design")) {
      learnings.push("Architecture documentation available");
    }
    if (readmeLower.includes("api") || readmeLower.includes("endpoint")) {
      learnings.push("API design patterns");
    }
  }

  return learnings.slice(0, 5); // Limit to 5 learnings
}

// Allow running directly for testing
if (import.meta.main) {
  const testUrl = process.argv[2] || "https://github.com/anthropics/anthropic-cookbook";

  console.log("=== Investigation Orchestrator Test ===\n");
  console.log(`Investigating: ${testUrl}\n`);

  const startTime = Date.now();
  const result = await investigate(testUrl);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`Duration: ${duration}s\n`);

  if (result.success) {
    console.log("SUCCESS\n");
    console.log(`Report saved: ${result.report_path}`);
    console.log(`Learnings saved: ${result.learnings_saved?.length ?? 0} files`);
    console.log(`Rate limit remaining: ${result.rate_limit_info?.remaining}`);

    console.log("\n=== Inline Summary ===\n");
    console.log(result.inline_summary);

    if (result.report?.dependencies) {
      console.log("\n=== Dependencies ===\n");
      console.log(`Runtime: ${result.report.dependencies.runtime.length}`);
      console.log(`Dev: ${result.report.dependencies.dev.length}`);
    }
  } else {
    console.log("FAILED\n");
    console.log(`Error: ${result.error}`);
    if (result.rate_limit_info) {
      console.log(`Rate limit: ${result.rate_limit_info.remaining} remaining`);
      console.log(`Blocked: ${result.rate_limit_info.blocked}`);
      if (result.rate_limit_info.blocked) {
        console.log(`Resets at: ${result.rate_limit_info.reset_time}`);
      }
    }
  }

  // Test numbered reference (if context exists)
  console.log("\n=== Testing Reference Resolution ===\n");
  const { resolveReference } = await import("./discovery/result-context.ts");
  const { searchRepos } = await import("./discovery/search.ts");

  // Search to populate context
  console.log("Searching for 'agent framework' to test reference...");
  const searchResults = await searchRepos("agent framework", { limit: 1 });
  if (searchResults.length > 0) {
    console.log(`Found: ${searchResults[0].fullName}`);

    // Test reference resolution
    const resolved = await resolveReference("#1");
    console.log(`#1 resolves to: ${resolved}`);

    if (resolved) {
      console.log("\nReference resolution working correctly");
    }
  } else {
    console.log("No search results - skipping reference test");
  }
}
