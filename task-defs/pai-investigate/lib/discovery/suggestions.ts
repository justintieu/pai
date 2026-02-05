/**
 * suggestions.ts - Contextual suggestion generation for related repositories
 *
 * Extracts context from investigation reports and generates search queries
 * to find similar/related repositories. Suggestions include brief explanations.
 */

import type { InvestigationReport } from "../report.ts";
import type { SearchResult } from "./types.ts";
import { formatStars } from "./types.ts";
import { searchRepos } from "./search.ts";

/**
 * Context extracted from an investigation for generating suggestions
 *
 * @example
 * const context: SuggestionContext = {
 *   topics: ["ai", "agents", "llm"],
 *   language: "Python",
 *   dependencies: ["langchain", "openai"],
 *   owner: "anthropics"
 * };
 */
export interface SuggestionContext {
  /** Topics from repo metadata */
  topics: string[];
  /** Primary programming language */
  language: string | null;
  /** Key runtime dependencies (max 5) */
  dependencies: string[];
  /** Owner to exclude from suggestions */
  owner: string;
}

/**
 * A suggested repository with reason for suggestion
 *
 * @example
 * const suggestion: Suggestion = {
 *   fullName: "langchain-ai/langchain",
 *   description: "Build context-aware reasoning applications",
 *   stargazersCount: 89234,
 *   language: "Python",
 *   url: "https://github.com/langchain-ai/langchain",
 *   reason: "shares topics ai, llm, agents"
 * };
 */
export interface Suggestion {
  /** Repository name in owner/repo format */
  fullName: string;
  /** Repository description */
  description: string | null;
  /** Number of stars */
  stargazersCount: number;
  /** Primary language */
  language: string | null;
  /** Full GitHub URL */
  url: string;
  /** Why this was suggested (e.g., "Similar: shares topics ai, agents") */
  reason: string;
}

/**
 * A query with its associated reason for suggestion explanations
 */
interface SuggestionQuery {
  /** The search query */
  query: string;
  /** The reason to attach to results */
  reason: string;
}

/**
 * Extract suggestion context from an investigation report
 *
 * @param report - Investigation report to extract context from
 * @returns SuggestionContext with topics, language, dependencies, and owner
 *
 * @example
 * const context = extractSuggestionContext(report);
 * // { topics: ["ai", "llm"], language: "Python", dependencies: ["langchain"], owner: "anthropics" }
 */
export function extractSuggestionContext(report: InvestigationReport): SuggestionContext {
  // Extract owner from repo name (owner/repo format)
  const owner = report.investigation.repo.split("/")[0] || "";

  // Extract topics from metadata
  const topics = report.metadata.topics || [];

  // Extract language from metadata
  const language = report.metadata.language || null;

  // Extract runtime dependencies (first 5 names only)
  const dependencies = report.dependencies?.runtime
    ? report.dependencies.runtime.slice(0, 5).map((d) => d.name)
    : [];

  return {
    topics,
    language,
    dependencies,
    owner,
  };
}

/**
 * Build search queries from suggestion context
 *
 * @param context - Suggestion context with topics, language, dependencies, owner
 * @returns Array of query objects with query string and reason
 *
 * @example
 * const queries = buildSuggestionQueries(context);
 * // [{ query: "topic:ai topic:llm -user:anthropics", reason: "shares topics ai, llm" }]
 */
export function buildSuggestionQueries(context: SuggestionContext): SuggestionQuery[] {
  const queries: SuggestionQuery[] = [];
  const ownerExclude = context.owner ? ` -user:${context.owner}` : "";

  // Strategy 1: Topic-based (if topics exist)
  if (context.topics.length > 0) {
    const topTopics = context.topics.slice(0, 3);
    const topicQuery = topTopics.map((t) => `topic:${t}`).join(" ");
    queries.push({
      query: `${topicQuery}${ownerExclude}`,
      reason: `shares topics ${topTopics.join(", ")}`,
    });
  }

  // Strategy 2: Language + dependency (if language and deps exist)
  if (context.language && context.dependencies.length > 0) {
    const dep = context.dependencies[0];
    queries.push({
      query: `${dep} language:${context.language.toLowerCase()}${ownerExclude}`,
      reason: `uses ${dep} in ${context.language}`,
    });
  }

  // Strategy 3: Dependencies only (if deps exist but not language)
  if (context.dependencies.length >= 2 && !context.language) {
    const deps = context.dependencies.slice(0, 2);
    queries.push({
      query: `${deps.join(" ")}${ownerExclude}`,
      reason: `uses ${deps.join(" and ")}`,
    });
  }

  // Strategy 4: If we have language but only one dep
  if (context.language && context.dependencies.length === 1 && queries.length < 2) {
    queries.push({
      query: `${context.dependencies[0]} language:${context.language.toLowerCase()}${ownerExclude}`,
      reason: `uses ${context.dependencies[0]} in ${context.language}`,
    });
  }

  return queries;
}

/**
 * Generate suggestions based on investigation report
 *
 * @param report - Investigation report to generate suggestions from
 * @returns Promise resolving to up to 3 unique Suggestion objects with reasons
 *
 * @example
 * const suggestions = await generateSuggestions(report);
 * // [{ fullName: "...", reason: "shares topics ai, agents", ... }]
 */
export async function generateSuggestions(
  report: InvestigationReport
): Promise<Suggestion[]> {
  const context = extractSuggestionContext(report);
  const queries = buildSuggestionQueries(context);

  const seen = new Set<string>();
  const suggestions: Suggestion[] = [];

  // Also exclude the investigated repo itself
  const investigatedRepo = report.investigation.repo;

  for (const { query, reason } of queries) {
    if (suggestions.length >= 3) break;

    const results = await searchRepos(query, {
      limit: 5,
      minStars: 100,
      recentActivity: true,
    });

    for (const result of results) {
      if (suggestions.length >= 3) break;
      if (seen.has(result.fullName)) continue;
      if (result.fullName === investigatedRepo) continue;

      seen.add(result.fullName);
      suggestions.push({
        fullName: result.fullName,
        description: result.description,
        stargazersCount: result.stargazersCount,
        language: result.language,
        url: result.url,
        reason,
      });
    }
  }

  return suggestions;
}

/**
 * Format a suggestion reason as italicized markdown
 *
 * @param reason - The reason string
 * @returns Italicized markdown string
 *
 * @example
 * formatSuggestionReason("shares topics ai, agents")
 * // "_Similar: shares topics ai, agents_"
 */
export function formatSuggestionReason(reason: string): string {
  return `_Similar: ${reason}_`;
}

/**
 * Format suggestions as a markdown list
 *
 * @param suggestions - Array of Suggestion objects
 * @returns Formatted markdown string
 *
 * @example
 * formatSuggestions(suggestions);
 * // "**Related repositories:**\n\n1. **owner/repo** (Python | 1.2k stars)\n   _Similar: shares topics ai_\n   Description here"
 */
export function formatSuggestions(suggestions: Suggestion[]): string {
  if (suggestions.length === 0) {
    return "**Related repositories:**\n\nNo suggestions found.";
  }

  const lines: string[] = ["**Related repositories:**", ""];

  for (let i = 0; i < suggestions.length; i++) {
    const s = suggestions[i];
    const stars = formatStars(s.stargazersCount);
    const lang = s.language ?? "?";
    const desc = s.description
      ? s.description.length > 50
        ? s.description.slice(0, 47) + "..."
        : s.description
      : "(no description)";

    lines.push(`${i + 1}. **${s.fullName}** (${lang} | ${stars} stars)`);
    lines.push(`   ${formatSuggestionReason(s.reason)}`);
    lines.push(`   ${desc}`);
  }

  return lines.join("\n");
}

// Allow running directly for testing
if (import.meta.main) {
  // Create a mock investigation report
  const mockReport: InvestigationReport = {
    investigation: {
      repo: "anthropics/anthropic-cookbook",
      url: "https://github.com/anthropics/anthropic-cookbook",
      date: new Date().toISOString(),
      mode: "quick_scan",
    },
    metadata: {
      description: "A collection of notebooks for working with Claude",
      language: "Python",
      topics: ["ai", "llm", "agents"],
      stars: 5000,
      forks: 500,
      size_kb: 10000,
      last_push: new Date().toISOString(),
      created: "2023-01-01T00:00:00Z",
      license: "MIT",
    },
    structure: {
      entry_points: [],
      key_directories: [],
      file_count: 100,
      truncated: false,
    },
    dependencies: {
      runtime: [{ name: "langchain" }, { name: "openai" }, { name: "anthropic" }],
      dev: [],
    },
    insights: {
      patterns: [],
      notable: [],
      potential_learnings: [],
    },
    rate_limit: {
      calls_used: 0,
      calls_remaining: 5000,
    },
  };

  console.log("=== Extract Context Test ===");
  const context = extractSuggestionContext(mockReport);
  console.log(JSON.stringify(context, null, 2));

  console.log("\n=== Build Queries Test ===");
  const queries = buildSuggestionQueries(context);
  for (const q of queries) {
    console.log(`Query: ${q.query}`);
    console.log(`Reason: ${q.reason}`);
    console.log("");
  }

  console.log("=== Generate Suggestions Test ===");
  const suggestions = await generateSuggestions(mockReport);
  console.log(`Found ${suggestions.length} suggestions\n`);
  console.log(formatSuggestions(suggestions));
}
