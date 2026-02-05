/**
 * entry-points.ts - Entry point and directory detection for repository investigation
 *
 * Automatically identifies where to start reading a repository based on
 * common file patterns across different languages and frameworks.
 */

/**
 * Entry point type classification
 */
export type EntryPointType = "main_entry" | "documentation" | "config" | "test_entry";

/**
 * Detected entry point in a repository
 */
export interface EntryPoint {
  /** File path relative to repo root */
  path: string;
  /** Type of entry point */
  type: EntryPointType;
}

/**
 * Detected key directory in a repository
 */
export interface KeyDirectory {
  /** Directory path with trailing slash */
  path: string;
  /** Purpose of the directory */
  purpose: string;
}

/**
 * Documentation file patterns (checked first as they're the best starting point)
 */
const DOC_PATTERNS = [
  "README.md",
  "README.rst",
  "README.txt",
  "README",
  "docs/index.md",
  "docs/README.md",
  "GETTING_STARTED.md",
  "GUIDE.md",
  "documentation/index.md",
];

/**
 * Main entry patterns by language/framework
 */
const MAIN_PATTERNS = [
  // TypeScript/JavaScript
  "src/index.ts",
  "src/index.js",
  "src/main.ts",
  "src/main.js",
  "index.ts",
  "index.js",
  "main.ts",
  "main.js",
  "lib/index.ts",
  "lib/index.js",
  "app/index.ts",
  "app/index.js",
  // Rust
  "src/lib.rs",
  "src/main.rs",
  // Python
  "main.py",
  "app.py",
  "__main__.py",
  "src/__main__.py",
  "src/main.py",
  // Go
  "cmd/main.go",
  "main.go",
  // Java/Kotlin
  "src/main/java/Main.java",
  "src/main/kotlin/Main.kt",
  // Ruby
  "lib/main.rb",
  // PHP
  "index.php",
  "public/index.php",
];

/**
 * Configuration/manifest file patterns
 */
const CONFIG_PATTERNS = [
  // JavaScript/TypeScript
  "package.json",
  "tsconfig.json",
  "bun.lockb",
  // Rust
  "Cargo.toml",
  // Python
  "pyproject.toml",
  "setup.py",
  "requirements.txt",
  // Go
  "go.mod",
  // Ruby
  "Gemfile",
  // PHP
  "composer.json",
  // Java
  "pom.xml",
  "build.gradle",
  // General
  "Makefile",
  "Dockerfile",
];

/**
 * Test directory prefixes
 */
const TEST_PREFIXES = [
  "tests/",
  "test/",
  "__tests__/",
  "spec/",
  "specs/",
  "testing/",
];

/**
 * Directory name to purpose mapping
 */
const PURPOSE_MAP: Record<string, string> = {
  // Source code
  src: "source_code",
  lib: "library_code",
  app: "application",
  pkg: "packages",
  packages: "packages",
  internal: "internal_code",
  core: "core_code",
  // Entry points
  cmd: "command_entry",
  bin: "executables",
  // Testing
  tests: "testing",
  test: "testing",
  __tests__: "testing",
  spec: "testing",
  // Documentation
  docs: "documentation",
  doc: "documentation",
  documentation: "documentation",
  // Examples
  examples: "examples",
  example: "examples",
  samples: "examples",
  // Scripts/tools
  scripts: "build_scripts",
  tools: "tooling",
  // Web/UI
  web: "web_frontend",
  client: "web_frontend",
  frontend: "web_frontend",
  ui: "user_interface",
  public: "static_assets",
  static: "static_assets",
  assets: "static_assets",
  // API
  api: "api_layer",
  server: "server",
  backend: "backend",
  // Config
  config: "configuration",
  configs: "configuration",
  // CI/CD
  ".github": "ci_cd",
  ".circleci": "ci_cd",
  ".gitlab": "ci_cd",
  // Data
  data: "data",
  fixtures: "test_fixtures",
  // Vendor/external
  vendor: "vendor_code",
  third_party: "vendor_code",
  node_modules: "vendor_code",
};

/**
 * Priority order for entry point types (lower = higher priority)
 */
const TYPE_PRIORITY: Record<EntryPointType, number> = {
  main_entry: 0,
  documentation: 1,
  config: 2,
  test_entry: 3,
};

/**
 * Detect entry points in a repository based on file listing.
 *
 * @param files - Array of files with path and size
 * @param readme - README content if available (unused but kept for API compatibility)
 * @returns Sorted array of detected entry points
 *
 * @example
 * const files = [
 *   { path: "README.md", size: 1000 },
 *   { path: "src/index.ts", size: 500 },
 *   { path: "package.json", size: 200 }
 * ];
 * const entries = detectEntryPoints(files, "# Project");
 * // Returns: [
 * //   { path: "src/index.ts", type: "main_entry" },
 * //   { path: "README.md", type: "documentation" },
 * //   { path: "package.json", type: "config" }
 * // ]
 */
export function detectEntryPoints(
  files: Array<{ path: string; size: number }>,
  readme: string | null
): EntryPoint[] {
  const entries: EntryPoint[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const filePath = file.path;
    const fileName = filePath.split("/").pop() || filePath;

    // Skip if already detected
    if (seen.has(filePath)) continue;

    // Check documentation patterns
    if (isDocumentation(filePath)) {
      entries.push({ path: filePath, type: "documentation" });
      seen.add(filePath);
      continue;
    }

    // Check main entry patterns
    if (isMainEntry(filePath)) {
      entries.push({ path: filePath, type: "main_entry" });
      seen.add(filePath);
      continue;
    }

    // Check config patterns
    if (isConfig(fileName)) {
      entries.push({ path: filePath, type: "config" });
      seen.add(filePath);
      continue;
    }

    // Check test entry (first file in test directory at depth 2)
    if (isTestEntry(filePath)) {
      entries.push({ path: filePath, type: "test_entry" });
      seen.add(filePath);
      continue;
    }
  }

  // Sort by type priority
  return entries.sort((a, b) => TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type]);
}

/**
 * Check if a path matches documentation patterns
 */
function isDocumentation(filePath: string): boolean {
  for (const pattern of DOC_PATTERNS) {
    if (filePath === pattern || filePath.endsWith("/" + pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a path matches main entry patterns
 */
function isMainEntry(filePath: string): boolean {
  return MAIN_PATTERNS.includes(filePath);
}

/**
 * Check if a filename matches config patterns
 */
function isConfig(fileName: string): boolean {
  return CONFIG_PATTERNS.includes(fileName);
}

/**
 * Check if a path is a test entry (file directly in test directory)
 */
function isTestEntry(filePath: string): boolean {
  for (const prefix of TEST_PREFIXES) {
    if (filePath.startsWith(prefix)) {
      // Only match files at depth 2 (e.g., tests/foo.ts, not tests/unit/foo.ts)
      const remaining = filePath.slice(prefix.length);
      if (!remaining.includes("/")) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Detect key directories in a repository based on directory listing.
 *
 * @param directories - Array of directory paths (without trailing slashes)
 * @returns Array of key directories with their purposes
 *
 * @example
 * const dirs = detectKeyDirectories(["src", "tests", "docs", "node_modules"]);
 * // Returns: [
 * //   { path: "src/", purpose: "source_code" },
 * //   { path: "tests/", purpose: "testing" },
 * //   { path: "docs/", purpose: "documentation" },
 * //   { path: "node_modules/", purpose: "vendor_code" }
 * // ]
 */
export function detectKeyDirectories(directories: string[]): KeyDirectory[] {
  const results: KeyDirectory[] = [];

  for (const dir of directories) {
    // Only process top-level directories (no slashes)
    if (dir.includes("/")) continue;

    // Strip leading dot for matching but keep in path
    const dirName = dir.startsWith(".") ? dir : dir;
    const purpose = PURPOSE_MAP[dirName];

    if (purpose) {
      results.push({
        path: dir + "/",
        purpose,
      });
    }
  }

  // Sort by purpose importance (source code first, vendor last)
  const purposePriority: Record<string, number> = {
    source_code: 0,
    library_code: 1,
    application: 2,
    core_code: 3,
    command_entry: 4,
    api_layer: 5,
    server: 6,
    testing: 7,
    documentation: 8,
    examples: 9,
    configuration: 10,
    ci_cd: 11,
    vendor_code: 99,
  };

  return results.sort((a, b) => {
    const priorityA = purposePriority[a.purpose] ?? 50;
    const priorityB = purposePriority[b.purpose] ?? 50;
    return priorityA - priorityB;
  });
}

// Allow running directly for testing
if (import.meta.main) {
  console.log("=== Entry Point Detection Test ===\n");

  const files = [
    { path: "README.md", size: 1000 },
    { path: "src/index.ts", size: 500 },
    { path: "src/utils.ts", size: 300 },
    { path: "package.json", size: 200 },
    { path: "tsconfig.json", size: 150 },
    { path: "tests/main.test.ts", size: 400 },
    { path: "tests/unit/utils.test.ts", size: 350 },
    { path: "docs/index.md", size: 600 },
  ];

  const entries = detectEntryPoints(files, "# Test Project");
  console.log("Files input:", files.map((f) => f.path).join(", "));
  console.log("\nDetected entry points:");
  for (const e of entries) {
    console.log(`  - ${e.path} (${e.type})`);
  }

  console.log("\n=== Key Directory Detection Test ===\n");

  const directories = ["src", "tests", "docs", "node_modules", ".github", "scripts", "random"];
  const keyDirs = detectKeyDirectories(directories);

  console.log("Directories input:", directories.join(", "));
  console.log("\nDetected key directories:");
  for (const d of keyDirs) {
    console.log(`  - ${d.path} -> ${d.purpose}`);
  }
}
