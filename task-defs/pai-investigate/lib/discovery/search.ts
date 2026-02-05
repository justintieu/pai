/**
 * discovery/search.ts - GitHub repository search via gh CLI
 *
 * Provides search functionality for discovering repositories matching
 * a query with quality filtering (stars, recent activity).
 */

import type { SearchResult, SearchOptions } from "./types.ts";
import { saveSearchContext } from "./result-context.ts";

/**
 * Default search options with quality gates
 */
export const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
  limit: 5,
  language: "",
  minStars: 50,
  recentActivity: true,
};

/**
 * Build a GitHub search query string with qualifiers
 *
 * @param keywords - Search terms
 * @param options - Search options including quality filters
 * @returns Formatted query string for gh CLI
 *
 * @example
 * buildSearchQuery("agent framework", { language: "typescript", minStars: 100 })
 * // "agent framework language:typescript stars:>100 pushed:>2025-02-02"
 */
export function buildSearchQuery(
  keywords: string,
  options: SearchOptions = {}
): string {
  const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
  const parts: string[] = [keywords];

  // Add language qualifier if specified
  if (opts.language) {
    parts.push(`language:${opts.language}`);
  }

  // Add minimum stars qualifier
  if (opts.minStars > 0) {
    parts.push(`stars:>=${opts.minStars}`);
  }

  // Add recent activity qualifier (pushed within 1 year)
  if (opts.recentActivity) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateStr = oneYearAgo.toISOString().split("T")[0];
    parts.push(`pushed:>${dateStr}`);
  }

  return parts.join(" ");
}

/**
 * Search for GitHub repositories matching a query
 *
 * Uses gh CLI to search with JSON output format.
 *
 * @param query - Search keywords (e.g., "agent framework")
 * @param options - Search options for filtering and limits
 * @returns Array of SearchResult objects, or empty array on error
 *
 * @example
 * const results = await searchRepos("agent framework", { language: "typescript" });
 * // Returns array of SearchResult with fullName, description, stars, etc.
 */
export async function searchRepos(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
  const limit = Math.min(Math.max(opts.limit, 1), 25); // Clamp between 1-25

  try {
    // Check if gh CLI is available
    const whichResult = await Bun.$`which gh`.quiet();
    if (whichResult.exitCode !== 0) {
      console.warn("gh CLI not found. Install from https://cli.github.com/");
      return [];
    }

    // Build the full search query with qualifiers
    const fullQuery = buildSearchQuery(query, opts);

    // Execute gh search with JSON output
    const result = await Bun.$`gh search repos ${fullQuery} --limit ${limit} --json fullName,description,stargazersCount,language,updatedAt,url`.quiet();

    if (result.exitCode !== 0) {
      const stderr = result.stderr.toString().trim();
      console.warn(`gh search failed: ${stderr}`);
      return [];
    }

    const output = result.stdout.toString().trim();
    if (!output) {
      return [];
    }

    // Parse JSON response
    const data = JSON.parse(output);

    // Map to SearchResult interface
    const results: SearchResult[] = data.map((item: Record<string, unknown>) => ({
      fullName: item.fullName as string,
      description: (item.description as string | null) || null,
      language: (item.language as string | null) || null,
      stargazersCount: item.stargazersCount as number,
      updatedAt: item.updatedAt as string,
      url: item.url as string,
    }));

    // Save context for numbered reference resolution (only if we have results)
    if (results.length > 0) {
      await saveSearchContext(results, query);
    }

    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("SyntaxError") || message.includes("JSON")) {
      console.warn(`Failed to parse search results: ${message}`);
    } else {
      console.warn(`Search error: ${message}`);
    }
    return [];
  }
}

// Allow running directly for testing
if (import.meta.main) {
  const { formatSearchResults } = await import("./types.ts");

  console.log("Searching for: agent framework typescript\n");

  const results = await searchRepos("agent framework", {
    language: "typescript",
    minStars: 100,
    limit: 5,
  });

  if (results.length === 0) {
    console.log("No results found (or gh CLI not available)");
  } else {
    console.log(formatSearchResults(results));
    console.log("\n---\nRaw results:", JSON.stringify(results, null, 2));
  }
}
