/**
 * dependencies.ts - Dependency parsing from manifest files
 *
 * Parses dependencies from package.json, Cargo.toml, pyproject.toml, and go.mod
 * to populate the dependencies section of investigation reports.
 */

import type { TreeInfo } from "./api-client.ts";

/**
 * Structured dependency information
 */
export interface DependencyInfo {
  /** Runtime dependencies */
  runtime: Array<{ name: string; version?: string }>;
  /** Development dependencies */
  dev: Array<{ name: string; version?: string }>;
}

/**
 * Manifest file detection and parsing configuration
 */
interface ManifestConfig {
  /** File path to look for */
  path: string;
  /** Parser function */
  parser: (content: string) => DependencyInfo;
}

/**
 * Manifest configurations by language
 */
const MANIFEST_CONFIGS: Record<string, ManifestConfig[]> = {
  TypeScript: [{ path: "package.json", parser: parsePackageJson }],
  JavaScript: [{ path: "package.json", parser: parsePackageJson }],
  Rust: [{ path: "Cargo.toml", parser: parseCargoToml }],
  Python: [
    { path: "pyproject.toml", parser: parsePyprojectToml },
    { path: "requirements.txt", parser: parseRequirementsTxt },
  ],
  Go: [{ path: "go.mod", parser: parseGoMod }],
  Ruby: [{ path: "Gemfile", parser: parseGemfile }],
};

/**
 * Default manifest files to check when language is unknown
 */
const DEFAULT_MANIFESTS: ManifestConfig[] = [
  { path: "package.json", parser: parsePackageJson },
  { path: "Cargo.toml", parser: parseCargoToml },
  { path: "pyproject.toml", parser: parsePyprojectToml },
  { path: "go.mod", parser: parseGoMod },
  { path: "requirements.txt", parser: parseRequirementsTxt },
  { path: "Gemfile", parser: parseGemfile },
];

/**
 * Fetch file content from GitHub API.
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - File path in repository
 * @returns File content as string, or null if not found
 */
async function getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
  try {
    const result = await Bun.$`gh api repos/${owner}/${repo}/contents/${path} --jq '.content'`.quiet();

    if (result.exitCode !== 0) {
      return null;
    }

    const base64Content = result.stdout.toString().trim();
    if (!base64Content) {
      return null;
    }

    // Decode base64 content
    const cleanBase64 = base64Content.replace(/\n/g, "");
    return Buffer.from(cleanBase64, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

/**
 * Parse dependencies from manifest files in a repository.
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param tree - Repository tree structure
 * @param language - Primary language (from metadata)
 * @returns DependencyInfo or null if no manifest found
 *
 * @example
 * const deps = await parseDependencies("anthropics", "anthropic-cookbook", tree, "Python");
 * if (deps) {
 *   console.log(`Runtime deps: ${deps.runtime.length}`);
 * }
 */
export async function parseDependencies(
  owner: string,
  repo: string,
  tree: TreeInfo | null,
  language: string | null
): Promise<DependencyInfo | null> {
  if (!tree) {
    return null;
  }

  // Get manifest configurations to try
  const configs = language ? MANIFEST_CONFIGS[language] ?? DEFAULT_MANIFESTS : DEFAULT_MANIFESTS;

  // Check which manifest files exist in the tree
  const existingManifests = configs.filter((config) =>
    tree.files.some((f) => f.path === config.path)
  );

  if (existingManifests.length === 0) {
    return null;
  }

  // Try each manifest in order until one succeeds
  for (const config of existingManifests) {
    const content = await getFileContent(owner, repo, config.path);
    if (content) {
      try {
        const deps = config.parser(content);
        // Only return if we found some dependencies
        if (deps.runtime.length > 0 || deps.dev.length > 0) {
          return deps;
        }
      } catch {
        // Parser failed, try next manifest
        continue;
      }
    }
  }

  return null;
}

/**
 * Parse package.json for dependencies.
 *
 * @param content - package.json content as string
 * @returns DependencyInfo with dependencies and devDependencies
 */
export function parsePackageJson(content: string): DependencyInfo {
  const pkg = JSON.parse(content);
  const runtime: Array<{ name: string; version?: string }> = [];
  const dev: Array<{ name: string; version?: string }> = [];

  // Parse dependencies
  if (pkg.dependencies && typeof pkg.dependencies === "object") {
    for (const [name, version] of Object.entries(pkg.dependencies)) {
      runtime.push({ name, version: String(version) });
    }
  }

  // Parse devDependencies
  if (pkg.devDependencies && typeof pkg.devDependencies === "object") {
    for (const [name, version] of Object.entries(pkg.devDependencies)) {
      dev.push({ name, version: String(version) });
    }
  }

  return { runtime, dev };
}

/**
 * Parse Cargo.toml for dependencies.
 *
 * Uses simple line-by-line parsing rather than a full TOML parser.
 *
 * @param content - Cargo.toml content as string
 * @returns DependencyInfo with [dependencies] and [dev-dependencies]
 */
export function parseCargoToml(content: string): DependencyInfo {
  const runtime: Array<{ name: string; version?: string }> = [];
  const dev: Array<{ name: string; version?: string }> = [];

  const lines = content.split("\n");
  let currentSection: "deps" | "dev-deps" | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect section headers
    if (trimmed === "[dependencies]") {
      currentSection = "deps";
      continue;
    }
    if (trimmed === "[dev-dependencies]") {
      currentSection = "dev-deps";
      continue;
    }
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      currentSection = null;
      continue;
    }

    // Skip if not in a deps section
    if (!currentSection) continue;

    // Parse dependency line: name = "version" or name = { version = "..." }
    const simpleMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*"([^"]+)"/);
    const complexMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{.*version\s*=\s*"([^"]+)"/);

    const match = simpleMatch || complexMatch;
    if (match) {
      const dep = { name: match[1], version: match[2] };
      if (currentSection === "deps") {
        runtime.push(dep);
      } else {
        dev.push(dep);
      }
    }
  }

  return { runtime, dev };
}

/**
 * Parse pyproject.toml for dependencies.
 *
 * Handles [project.dependencies] and [project.optional-dependencies] sections.
 *
 * @param content - pyproject.toml content as string
 * @returns DependencyInfo
 */
export function parsePyprojectToml(content: string): DependencyInfo {
  const runtime: Array<{ name: string; version?: string }> = [];
  const dev: Array<{ name: string; version?: string }> = [];

  // Parse [project] section dependencies array
  // Format: dependencies = ["package>=1.0", "other-package"]
  const depsMatch = content.match(/\[project\][\s\S]*?dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (depsMatch) {
    const depsContent = depsMatch[1];
    const packages = depsContent.match(/"([^"]+)"/g);
    if (packages) {
      for (const pkg of packages) {
        const clean = pkg.replace(/"/g, "");
        const parsed = parsePythonDep(clean);
        runtime.push(parsed);
      }
    }
  }

  // Parse [project.optional-dependencies] for dev deps
  // Look for common dev dependency groups: dev, test, testing, lint
  // Use line-by-line parsing for more reliable matching
  const lines = content.split("\n");
  let inOptionalDeps = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect optional-dependencies section
    if (line === "[project.optional-dependencies]") {
      inOptionalDeps = true;
      continue;
    }
    // Exit on next section
    if (line.startsWith("[") && line.endsWith("]") && inOptionalDeps) {
      inOptionalDeps = false;
      continue;
    }

    if (!inOptionalDeps) continue;

    // Match dev/test/lint groups: dev = ["pytest", ...] or multi-line
    const groupMatch = line.match(/^(dev|test|testing|lint)\s*=\s*\[(.*)$/);
    if (groupMatch) {
      // Single line or start of multi-line
      let arrayContent = groupMatch[2];

      // If array doesn't close on this line, keep reading
      if (!arrayContent.includes("]")) {
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          arrayContent += " " + nextLine;
          if (nextLine.includes("]")) break;
        }
      }

      // Extract packages from array content
      const packages = arrayContent.match(/"([^"]+)"/g);
      if (packages) {
        for (const pkg of packages) {
          const clean = pkg.replace(/"/g, "");
          const parsed = parsePythonDep(clean);
          dev.push(parsed);
        }
      }
    }
  }

  return { runtime, dev };
}

/**
 * Parse a Python dependency string like "requests>=2.0.0" or "flask"
 */
function parsePythonDep(dep: string): { name: string; version?: string } {
  // Split on version specifiers: >=, <=, ==, ~=, !=, >, <
  const match = dep.match(/^([a-zA-Z0-9_-]+)([<>=!~]+.+)?/);
  if (match) {
    return {
      name: match[1],
      version: match[2] || undefined,
    };
  }
  return { name: dep };
}

/**
 * Parse requirements.txt for dependencies.
 *
 * @param content - requirements.txt content as string
 * @returns DependencyInfo (all as runtime, no dev separation)
 */
export function parseRequirementsTxt(content: string): DependencyInfo {
  const runtime: Array<{ name: string; version?: string }> = [];

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) continue;
    // Skip -r, -e, and other flags
    if (trimmed.startsWith("-")) continue;

    const parsed = parsePythonDep(trimmed);
    if (parsed.name) {
      runtime.push(parsed);
    }
  }

  return { runtime, dev: [] };
}

/**
 * Parse go.mod for dependencies.
 *
 * @param content - go.mod content as string
 * @returns DependencyInfo (all as runtime, Go has no dev deps concept)
 */
export function parseGoMod(content: string): DependencyInfo {
  const runtime: Array<{ name: string; version?: string }> = [];

  const lines = content.split("\n");
  let inRequire = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect require block start
    if (trimmed.startsWith("require (")) {
      inRequire = true;
      continue;
    }
    if (trimmed === ")") {
      inRequire = false;
      continue;
    }

    // Parse single-line require
    const singleMatch = trimmed.match(/^require\s+(\S+)\s+(\S+)/);
    if (singleMatch) {
      runtime.push({ name: singleMatch[1], version: singleMatch[2] });
      continue;
    }

    // Parse multi-line require
    if (inRequire) {
      const multiMatch = trimmed.match(/^(\S+)\s+(\S+)/);
      if (multiMatch && !multiMatch[1].startsWith("//")) {
        runtime.push({ name: multiMatch[1], version: multiMatch[2] });
      }
    }
  }

  return { runtime, dev: [] };
}

/**
 * Parse Gemfile for dependencies.
 *
 * @param content - Gemfile content as string
 * @returns DependencyInfo
 */
export function parseGemfile(content: string): DependencyInfo {
  const runtime: Array<{ name: string; version?: string }> = [];
  const dev: Array<{ name: string; version?: string }> = [];

  const lines = content.split("\n");
  let inDevGroup = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect group blocks
    if (trimmed.match(/^group\s+:(?:development|test)/)) {
      inDevGroup = true;
      continue;
    }
    if (trimmed === "end") {
      inDevGroup = false;
      continue;
    }

    // Parse gem lines: gem "name", "version" or gem "name"
    const gemMatch = trimmed.match(/^gem\s+['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]+)['"]\s*)?/);
    if (gemMatch) {
      const dep = { name: gemMatch[1], version: gemMatch[2] || undefined };
      if (inDevGroup) {
        dev.push(dep);
      } else {
        runtime.push(dep);
      }
    }
  }

  return { runtime, dev };
}

// Allow running directly for testing
if (import.meta.main) {
  console.log("=== Dependency Parser Tests ===\n");

  // Test package.json parsing
  console.log("--- package.json ---");
  const pkgJson = `{
    "name": "test",
    "dependencies": {
      "react": "^18.0.0",
      "express": "4.18.2"
    },
    "devDependencies": {
      "typescript": "^5.0.0",
      "jest": "^29.0.0"
    }
  }`;
  const pkgDeps = parsePackageJson(pkgJson);
  console.log("Runtime:", pkgDeps.runtime);
  console.log("Dev:", pkgDeps.dev);
  console.log();

  // Test Cargo.toml parsing
  console.log("--- Cargo.toml ---");
  const cargoToml = `[package]
name = "test"
version = "0.1.0"

[dependencies]
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }

[dev-dependencies]
tempfile = "3.0"`;
  const cargoDeps = parseCargoToml(cargoToml);
  console.log("Runtime:", cargoDeps.runtime);
  console.log("Dev:", cargoDeps.dev);
  console.log();

  // Test pyproject.toml parsing
  console.log("--- pyproject.toml ---");
  const pyproject = `[project]
name = "test"
dependencies = [
    "requests>=2.28.0",
    "flask",
]

[project.optional-dependencies]
dev = ["pytest>=7.0", "black"]
test = ["coverage"]`;
  const pyDeps = parsePyprojectToml(pyproject);
  console.log("Runtime:", pyDeps.runtime);
  console.log("Dev:", pyDeps.dev);
  console.log();

  // Test go.mod parsing
  console.log("--- go.mod ---");
  const goMod = `module example.com/test

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/lib/pq v1.10.9
)

require github.com/single/dep v0.1.0`;
  const goDeps = parseGoMod(goMod);
  console.log("Runtime:", goDeps.runtime);
  console.log();

  // Test requirements.txt parsing
  console.log("--- requirements.txt ---");
  const reqTxt = `# Requirements
flask>=2.0.0
requests==2.28.0
pytest  # test dependency
-r base.txt`;
  const reqDeps = parseRequirementsTxt(reqTxt);
  console.log("Runtime:", reqDeps.runtime);
  console.log();

  // Test Gemfile parsing
  console.log("--- Gemfile ---");
  const gemfile = `source "https://rubygems.org"

gem "rails", "~> 7.0"
gem "puma"

group :development, :test do
  gem "rspec-rails"
  gem "factory_bot"
end`;
  const gemDeps = parseGemfile(gemfile);
  console.log("Runtime:", gemDeps.runtime);
  console.log("Dev:", gemDeps.dev);
}
