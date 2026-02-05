/**
 * api-client.ts - GitHub API operations via gh CLI
 *
 * Wraps gh CLI for repository metadata, README, and tree structure fetching.
 * Uses Bun.shell for zero new dependencies. Error cases return null, not throw.
 */

/**
 * Repository metadata from GitHub API
 */
export interface RepoMetadata {
  /** Repository name */
  name: string;
  /** Repository description (null if not set) */
  description: string | null;
  /** Primary programming language (null if not detected) */
  language: string | null;
  /** Repository topics/tags */
  topics: string[];
  /** Star count */
  stars: number;
  /** Fork count */
  forks: number;
  /** Repository size in KB */
  size_kb: number;
  /** Default branch name (e.g., "main", "master") */
  default_branch: string;
  /** Last push timestamp (ISO 8601) */
  pushed_at: string;
  /** Creation timestamp (ISO 8601) */
  created_at: string;
  /** Visibility ("public" or "private") */
  visibility: string;
  /** Whether wiki is enabled */
  has_wiki: boolean;
  /** License SPDX identifier (null if none) */
  license: string | null;
}

/**
 * Repository tree structure from GitHub API
 */
export interface TreeInfo {
  /** Whether the tree was truncated (>100k files) */
  truncated: boolean;
  /** Total number of files and directories */
  file_count: number;
  /** List of directory paths */
  directories: string[];
  /** List of files with path and size */
  files: Array<{ path: string; size: number }>;
}

/**
 * Get repository metadata from GitHub API.
 *
 * @param owner - Repository owner (user or organization)
 * @param repo - Repository name
 * @returns RepoMetadata or null on error (404, auth error, network error)
 *
 * @example
 * const meta = await getRepoMetadata("anthropics", "anthropic-cookbook");
 * console.log(meta?.language); // "Jupyter Notebook"
 */
export async function getRepoMetadata(
  owner: string,
  repo: string
): Promise<RepoMetadata | null> {
  try {
    const jqFilter = `{
      name: .name,
      description: .description,
      language: .language,
      topics: .topics,
      stars: .stargazers_count,
      forks: .forks_count,
      size_kb: .size,
      default_branch: .default_branch,
      pushed_at: .pushed_at,
      created_at: .created_at,
      visibility: .visibility,
      has_wiki: .has_wiki,
      license: .license.spdx_id
    }`;

    const result = await Bun.$`gh api repos/${owner}/${repo} --jq ${jqFilter}`.quiet();

    if (result.exitCode !== 0) {
      // 404 (not found/private), auth error, or network error
      return null;
    }

    const output = result.stdout.toString().trim();
    const data = JSON.parse(output);

    return {
      name: data.name,
      description: data.description,
      language: data.language,
      topics: data.topics || [],
      stars: data.stars,
      forks: data.forks,
      size_kb: data.size_kb,
      default_branch: data.default_branch,
      pushed_at: data.pushed_at,
      created_at: data.created_at,
      visibility: data.visibility,
      has_wiki: data.has_wiki,
      license: data.license,
    };
  } catch (error) {
    // JSON parse error or other unexpected error
    return null;
  }
}

/**
 * Get README content from GitHub API.
 *
 * @param owner - Repository owner (user or organization)
 * @param repo - Repository name
 * @returns README content as string, or null on error (404, no README)
 *
 * @example
 * const readme = await getReadme("anthropics", "anthropic-cookbook");
 * console.log(readme?.substring(0, 100)); // First 100 chars of README
 */
export async function getReadme(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    // Get base64-encoded README content
    const result = await Bun.$`gh api repos/${owner}/${repo}/readme --jq '.content'`.quiet();

    if (result.exitCode !== 0) {
      // 404 (no README) or other error
      return null;
    }

    const base64Content = result.stdout.toString().trim();

    if (!base64Content) {
      return null;
    }

    // Decode base64 content
    // GitHub returns content with newlines that need to be removed before decoding
    const cleanBase64 = base64Content.replace(/\n/g, "");
    const decoded = Buffer.from(cleanBase64, "base64").toString("utf-8");

    return decoded;
  } catch (error) {
    // Decode error or other unexpected error
    return null;
  }
}

/**
 * Get repository tree structure from GitHub API.
 *
 * @param owner - Repository owner (user or organization)
 * @param repo - Repository name
 * @param branch - Branch name (typically default_branch from metadata)
 * @returns TreeInfo with directories and files, or null on error
 *
 * @example
 * const tree = await getTree("anthropics", "anthropic-cookbook", "main");
 * console.log(tree?.file_count); // Total files
 * console.log(tree?.directories); // All directories
 */
export async function getTree(
  owner: string,
  repo: string,
  branch: string
): Promise<TreeInfo | null> {
  try {
    const jqFilter = `{
      truncated: .truncated,
      tree: .tree
    }`;

    const result = await Bun.$`gh api "repos/${owner}/${repo}/git/trees/${branch}?recursive=1" --jq ${jqFilter}`.quiet();

    if (result.exitCode !== 0) {
      // Branch not found, repo not found, or other error
      return null;
    }

    const output = result.stdout.toString().trim();
    const data = JSON.parse(output);

    // Separate directories (tree) from files (blob)
    const directories: string[] = [];
    const files: Array<{ path: string; size: number }> = [];

    for (const item of data.tree || []) {
      if (item.type === "tree") {
        directories.push(item.path);
      } else if (item.type === "blob") {
        files.push({
          path: item.path,
          size: item.size || 0,
        });
      }
    }

    return {
      truncated: data.truncated || false,
      file_count: (data.tree || []).length,
      directories,
      files,
    };
  } catch (error) {
    // JSON parse error or other unexpected error
    return null;
  }
}

// Allow running directly for testing
if (import.meta.main) {
  console.log("API Client Test Results:\n");

  // Test getRepoMetadata
  console.log("=== getRepoMetadata ===");
  const meta = await getRepoMetadata("anthropics", "anthropic-cookbook");
  if (meta) {
    console.log(`Name: ${meta.name}`);
    console.log(`Description: ${meta.description}`);
    console.log(`Language: ${meta.language}`);
    console.log(`Stars: ${meta.stars}`);
    console.log(`Default branch: ${meta.default_branch}`);
    console.log(`Topics: ${meta.topics.join(", ")}`);
  } else {
    console.log("Failed to fetch metadata (check gh auth status)");
  }

  console.log("\n=== getReadme ===");
  const readme = await getReadme("anthropics", "anthropic-cookbook");
  if (readme) {
    console.log(`README length: ${readme.length} chars`);
    console.log(`First 200 chars:\n${readme.substring(0, 200)}...`);
  } else {
    console.log("Failed to fetch README");
  }

  console.log("\n=== getTree ===");
  if (meta) {
    const tree = await getTree("anthropics", "anthropic-cookbook", meta.default_branch);
    if (tree) {
      console.log(`Truncated: ${tree.truncated}`);
      console.log(`Total items: ${tree.file_count}`);
      console.log(`Directories: ${tree.directories.length}`);
      console.log(`Files: ${tree.files.length}`);
      console.log(`\nFirst 5 directories: ${tree.directories.slice(0, 5).join(", ")}`);
      console.log(`First 5 files: ${tree.files.slice(0, 5).map(f => f.path).join(", ")}`);
    } else {
      console.log("Failed to fetch tree");
    }
  }

  // Test error case
  console.log("\n=== Error case (non-existent repo) ===");
  const noMeta = await getRepoMetadata("anthropics", "this-repo-does-not-exist-12345");
  console.log(`Result for non-existent repo: ${noMeta === null ? "null (expected)" : "unexpected result"}`);
}
