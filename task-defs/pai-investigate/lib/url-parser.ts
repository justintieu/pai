/**
 * url-parser.ts - GitHub URL parsing for investigations
 *
 * Parses various GitHub URL formats into normalized owner/repo format.
 * Handles HTTPS, SSH, and URLs with paths (tree/blob).
 */

/**
 * Parsed GitHub repository information
 */
export interface GitHubRepo {
  /** Repository owner (user or organization) */
  owner: string;
  /** Repository name */
  repo: string;
  /** Normalized URL: https://github.com/{owner}/{repo} */
  url: string;
}

/**
 * Parse a GitHub URL into owner/repo format.
 *
 * Handles:
 * - HTTPS format: `https://github.com/owner/repo`
 * - HTTPS with .git: `https://github.com/owner/repo.git`
 * - SSH format: `git@github.com:owner/repo.git`
 * - With trailing slash: `https://github.com/owner/repo/`
 * - With path: `https://github.com/owner/repo/tree/main/src` -> extracts owner/repo only
 *
 * @param url - GitHub URL in any supported format
 * @returns GitHubRepo with normalized owner/repo, or null if invalid/non-GitHub URL
 *
 * @example
 * parseGitHubUrl("https://github.com/anthropics/anthropic-cookbook")
 * // => { owner: "anthropics", repo: "anthropic-cookbook", url: "https://github.com/anthropics/anthropic-cookbook" }
 *
 * parseGitHubUrl("git@github.com:anthropics/anthropic-cookbook.git")
 * // => { owner: "anthropics", repo: "anthropic-cookbook", url: "https://github.com/anthropics/anthropic-cookbook" }
 *
 * parseGitHubUrl("https://google.com/foo")
 * // => null
 */
export function parseGitHubUrl(url: string): GitHubRepo | null {
  if (!url) {
    return null;
  }

  // Trim whitespace
  const trimmed = url.trim();

  // Extract owner/repo from various GitHub URL formats
  // Matches: github.com/owner/repo or github.com:owner/repo (SSH)
  const match = trimmed.match(/github\.com[:/]([^/]+)\/([^/\s]+)/);

  if (!match) {
    return null;
  }

  let owner = match[1].trim();
  let repo = match[2].trim();

  // Remove .git suffix if present
  if (repo.endsWith(".git")) {
    repo = repo.slice(0, -4);
  }

  // Remove trailing slash if present (shouldn't happen after regex but safety)
  if (repo.endsWith("/")) {
    repo = repo.slice(0, -1);
  }

  // Validate owner and repo are non-empty
  if (!owner || !repo) {
    return null;
  }

  // Return normalized URL
  return {
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
  };
}

// Allow running directly for testing
if (import.meta.main) {
  const testUrls = [
    "https://github.com/anthropics/anthropic-cookbook",
    "https://github.com/anthropics/anthropic-cookbook.git",
    "git@github.com:anthropics/anthropic-cookbook.git",
    "https://github.com/anthropics/anthropic-cookbook/",
    "https://github.com/anthropics/anthropic-cookbook/tree/main/src",
    "https://google.com/foo",
    "",
    "invalid-url",
  ];

  console.log("URL Parser Test Results:\n");
  for (const url of testUrls) {
    const result = parseGitHubUrl(url);
    console.log(`Input:  "${url}"`);
    if (result) {
      console.log(`Output: { owner: "${result.owner}", repo: "${result.repo}", url: "${result.url}" }`);
    } else {
      console.log("Output: null");
    }
    console.log();
  }
}
