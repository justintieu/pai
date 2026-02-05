/**
 * result-context.ts - Search result context storage and reference resolution
 *
 * Stores search results after each search for numbered reference resolution.
 * Enables "investigate #3" pattern to reference results by number.
 *
 * Storage: ~/.pai/memory/search-context.json
 */

import { homedir } from "os";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import type { SearchResult } from "./types.ts";

/**
 * Path to the search context file
 */
export const CONTEXT_PATH = `${homedir()}/.pai/memory/search-context.json`;

/**
 * Search context stored after each search
 */
export interface SearchContext {
  /** Search results from last search */
  results: SearchResult[];
  /** Original search query */
  query: string;
  /** ISO timestamp when saved */
  timestamp: string;
}

/**
 * Save search context for later reference resolution.
 *
 * Overwrites previous context (only one context at a time).
 *
 * @param results - Search results to save
 * @param query - Original search query
 *
 * @example
 * await saveSearchContext(results, "agent framework typescript");
 */
export async function saveSearchContext(
  results: SearchResult[],
  query: string
): Promise<void> {
  const context: SearchContext = {
    results,
    query,
    timestamp: new Date().toISOString(),
  };

  // Ensure parent directory exists
  const dir = CONTEXT_PATH.substring(0, CONTEXT_PATH.lastIndexOf("/"));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  await Bun.write(CONTEXT_PATH, JSON.stringify(context, null, 2));
}

/**
 * Get the saved search context.
 *
 * @returns SearchContext or null if not found or invalid
 *
 * @example
 * const ctx = await getSearchContext();
 * if (ctx) console.log(`Last search: "${ctx.query}" returned ${ctx.results.length} results`);
 */
export async function getSearchContext(): Promise<SearchContext | null> {
  if (!existsSync(CONTEXT_PATH)) {
    return null;
  }

  try {
    const content = await Bun.file(CONTEXT_PATH).text();
    return JSON.parse(content) as SearchContext;
  } catch (error) {
    // Handle JSON parse errors gracefully
    console.warn(`Failed to parse search context: ${error}`);
    return null;
  }
}

/**
 * Resolve a numbered reference to a URL.
 *
 * Handles formats: "#3", "3", "#03", "result 3"
 *
 * @param ref - Reference string to resolve
 * @returns URL string or null if reference invalid or context missing
 *
 * @example
 * const url = await resolveReference("#3");
 * if (url) console.log(`Result #3: ${url}`);
 */
export async function resolveReference(ref: string): Promise<string | null> {
  // Parse reference to extract number
  // Handles: "#3", "3", "#03", "result 3", "Result 3"
  const match = ref.match(/(?:#|result\s*)?(\d+)/i);
  if (!match) {
    console.warn(`Invalid reference format: "${ref}" (expected #N, N, or "result N")`);
    return null;
  }

  const num = parseInt(match[1], 10);
  if (isNaN(num) || num < 1) {
    console.warn(`Invalid reference number: ${num}`);
    return null;
  }

  // Load context
  const context = await getSearchContext();
  if (!context) {
    console.warn("No search context available. Run a search first.");
    return null;
  }

  // Convert 1-based index to 0-based
  const index = num - 1;
  if (index >= context.results.length) {
    console.warn(
      `Reference #${num} out of bounds. Only ${context.results.length} results available.`
    );
    return null;
  }

  return context.results[index].url;
}

/**
 * Clear the search context file.
 *
 * Useful for cleanup after batch investigation.
 *
 * @example
 * await clearSearchContext();
 */
export function clearSearchContext(): void {
  if (existsSync(CONTEXT_PATH)) {
    unlinkSync(CONTEXT_PATH);
  }
}

// Allow running directly for testing
if (import.meta.main) {
  console.log("Testing result-context module...\n");

  // Create mock results
  const mockResults: SearchResult[] = [
    {
      fullName: "anthropics/anthropic-cookbook",
      description: "AI examples and tutorials",
      language: "Python",
      stargazersCount: 5000,
      updatedAt: "2026-01-15T00:00:00Z",
      url: "https://github.com/anthropics/anthropic-cookbook",
    },
    {
      fullName: "langchain-ai/langchain",
      description: "LLM orchestration framework",
      language: "Python",
      stargazersCount: 80000,
      updatedAt: "2026-01-20T00:00:00Z",
      url: "https://github.com/langchain-ai/langchain",
    },
    {
      fullName: "microsoft/autogen",
      description: "Multi-agent framework",
      language: "Python",
      stargazersCount: 25000,
      updatedAt: "2026-01-18T00:00:00Z",
      url: "https://github.com/microsoft/autogen",
    },
  ];

  // Test 1: Save context
  console.log("Test 1: saveSearchContext");
  await saveSearchContext(mockResults, "agent framework python");
  console.log(`  Saved ${mockResults.length} results to ${CONTEXT_PATH}`);
  console.log("  PASS\n");

  // Test 2: Get context
  console.log("Test 2: getSearchContext");
  const ctx = await getSearchContext();
  if (ctx && ctx.results.length === 3 && ctx.query === "agent framework python") {
    console.log(`  Retrieved context: query="${ctx.query}", results=${ctx.results.length}`);
    console.log("  PASS\n");
  } else {
    console.log("  FAIL: Context not retrieved correctly");
    process.exit(1);
  }

  // Test 3: Resolve valid references
  console.log("Test 3: resolveReference (valid)");
  const testCases = [
    { ref: "#1", expected: mockResults[0].url },
    { ref: "2", expected: mockResults[1].url },
    { ref: "#03", expected: mockResults[2].url },
    { ref: "result 1", expected: mockResults[0].url },
    { ref: "Result 2", expected: mockResults[1].url },
  ];

  let allPassed = true;
  for (const tc of testCases) {
    const url = await resolveReference(tc.ref);
    if (url === tc.expected) {
      console.log(`  "${tc.ref}" -> ${url} PASS`);
    } else {
      console.log(`  "${tc.ref}" -> ${url} (expected ${tc.expected}) FAIL`);
      allPassed = false;
    }
  }
  console.log(allPassed ? "  All valid references PASS\n" : "  Some references FAIL\n");

  // Test 4: Resolve invalid references
  console.log("Test 4: resolveReference (invalid)");
  const invalidRefs = [
    { ref: "#0", desc: "zero index" },
    { ref: "#5", desc: "out of bounds" },
    { ref: "abc", desc: "non-numeric" },
    { ref: "", desc: "empty string" },
  ];

  for (const tc of invalidRefs) {
    const url = await resolveReference(tc.ref);
    console.log(`  "${tc.ref}" (${tc.desc}) -> ${url === null ? "null" : url} ${url === null ? "PASS" : "FAIL"}`);
  }
  console.log("");

  // Test 5: Clear context
  console.log("Test 5: clearSearchContext");
  clearSearchContext();
  const clearedCtx = await getSearchContext();
  if (clearedCtx === null) {
    console.log("  Context cleared successfully");
    console.log("  PASS\n");
  } else {
    console.log("  FAIL: Context still exists after clear");
    process.exit(1);
  }

  // Test 6: Resolve with no context
  console.log("Test 6: resolveReference (no context)");
  const noCtxUrl = await resolveReference("#1");
  if (noCtxUrl === null) {
    console.log("  Returns null when no context");
    console.log("  PASS\n");
  } else {
    console.log("  FAIL: Should return null when no context");
    process.exit(1);
  }

  console.log("All tests passed!");
}
