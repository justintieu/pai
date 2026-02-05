/**
 * discovery/types.ts - Types for repository discovery via GitHub search
 *
 * Provides type definitions for search queries, results, and formatting
 * for the repository discovery feature.
 */

/**
 * Search result from GitHub API via gh CLI
 */
export interface SearchResult {
  /** Repository full name in owner/repo format */
  fullName: string;
  /** Repository description, may be null */
  description: string | null;
  /** Primary programming language, may be null */
  language: string | null;
  /** Number of stars */
  stargazersCount: number;
  /** Last update timestamp (ISO date string) */
  updatedAt: string;
  /** GitHub URL for the repository */
  url: string;
}

/**
 * Structured search query components
 */
export interface SearchQuery {
  /** Keywords extracted from user query */
  keywords: string[];
  /** GitHub search qualifiers */
  qualifiers: {
    /** Filter by programming language */
    language?: string;
    /** Filter by star count (e.g., ">100") */
    stars?: string;
    /** Filter by last push date (e.g., ">2025-01-01") */
    pushed?: string;
  };
  /** Maximum number of results (default 5) */
  limit: number;
}

/**
 * Options for search operations
 */
export interface SearchOptions {
  /** Maximum results to return (default 5, max 25) */
  limit?: number;
  /** Filter by programming language */
  language?: string;
  /** Minimum star count for quality gate (default 50) */
  minStars?: number;
  /** Only include repos with recent activity (pushed within 1 year) */
  recentActivity?: boolean;
}

/**
 * Format a star count for display (e.g., 1234 -> "1.2k")
 *
 * @param count - Raw star count
 * @returns Formatted string with k suffix for thousands
 *
 * @example
 * formatStars(1234) // "1.2k"
 * formatStars(500) // "500"
 * formatStars(10500) // "10.5k"
 */
export function formatStars(count: number): string {
  if (count >= 1000) {
    const k = count / 1000;
    // Use one decimal place, remove trailing zero
    const formatted = k.toFixed(1);
    return formatted.endsWith(".0")
      ? `${Math.floor(k)}k`
      : `${formatted}k`;
  }
  return String(count);
}

/**
 * Truncate a string to a maximum length, adding ellipsis if needed
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns Truncated string
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format search results as a numbered markdown list
 *
 * Format per CONTEXT.md:
 * "1. **owner/repo** (TypeScript | 1.2k stars)
 *    Description here"
 *
 * @param results - Array of SearchResult objects
 * @returns Formatted markdown string
 *
 * @example
 * formatSearchResults([{
 *   fullName: 'anthropics/claude',
 *   description: 'AI assistant',
 *   stargazersCount: 1234,
 *   language: 'TypeScript',
 *   updatedAt: '2026-01-01',
 *   url: 'https://github.com/anthropics/claude'
 * }])
 * // "1. **anthropics/claude** (TypeScript | 1.2k stars)\n   AI assistant"
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return "No repositories found matching your search criteria.";
  }

  return results
    .map((result, index) => {
      const num = index + 1;
      const stars = formatStars(result.stargazersCount);
      const lang = result.language || "Unknown";
      const desc = result.description
        ? truncate(result.description, 60)
        : "No description";

      return `${num}. **${result.fullName}** (${lang} | ${stars} stars)\n   ${desc}`;
    })
    .join("\n\n");
}

// Allow running directly for testing
if (import.meta.main) {
  // Test formatStars
  console.log("Testing formatStars:");
  console.log(`  500 -> "${formatStars(500)}"`);
  console.log(`  1000 -> "${formatStars(1000)}"`);
  console.log(`  1234 -> "${formatStars(1234)}"`);
  console.log(`  10500 -> "${formatStars(10500)}"`);

  // Test formatSearchResults
  console.log("\nTesting formatSearchResults:");
  const testResults: SearchResult[] = [
    {
      fullName: "anthropics/claude-code",
      description: "Claude Code is a powerful AI assistant for developers that helps with code understanding and generation",
      stargazersCount: 15234,
      language: "TypeScript",
      updatedAt: "2026-01-15T00:00:00Z",
      url: "https://github.com/anthropics/claude-code",
    },
    {
      fullName: "microsoft/vscode",
      description: "Visual Studio Code",
      stargazersCount: 180000,
      language: "TypeScript",
      updatedAt: "2026-01-20T00:00:00Z",
      url: "https://github.com/microsoft/vscode",
    },
    {
      fullName: "test/no-desc",
      description: null,
      stargazersCount: 500,
      language: null,
      updatedAt: "2026-01-01T00:00:00Z",
      url: "https://github.com/test/no-desc",
    },
  ];

  console.log(formatSearchResults(testResults));
}
