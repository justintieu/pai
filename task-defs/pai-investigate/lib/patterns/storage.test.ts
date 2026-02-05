/**
 * storage.test.ts - Tests for pattern storage functions
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { existsSync, mkdirSync, rmSync } from "fs";
import {
  loadPatternIndex,
  savePattern,
  generatePatternId,
  formatPatternMarkdown,
  APPROVED_DIR,
} from "./storage.ts";
import type { ExtractedPattern } from "./types.ts";

// Test pattern for reuse
const createTestPattern = (): ExtractedPattern => ({
  id: generatePatternId("Test-Pattern", "test/repo"),
  name: "Test-Pattern",
  type: "workflow",
  description: "A test pattern for storage verification",
  source: {
    repo: "test/repo",
    url: "https://github.com/test/repo",
    report_path: "~/.pai/output/investigations/test_repo_2026-01-31.yaml",
  },
  pai_relevance: "medium",
  tags: ["test", "storage", "verification"],
  extracted_at: new Date().toISOString(),
});

describe("Pattern Storage", () => {
  describe("loadPatternIndex", () => {
    test("loads existing index.json", async () => {
      const index = await loadPatternIndex();

      // Should always have patterns object and lastUpdated
      expect(index).toHaveProperty("patterns");
      expect(index).toHaveProperty("lastUpdated");
      expect(typeof index.patterns).toBe("object");
      expect(typeof index.lastUpdated).toBe("string");
    });
  });

  describe("generatePatternId", () => {
    test("generates id from name and repo", () => {
      const id = generatePatternId("Process-Save-Summarize", "anthropics/anthropic-cookbook");
      expect(id).toBe("process-save-summarize_anthropics_anthropic-cookbook");
    });

    test("handles spaces in name", () => {
      const id = generatePatternId("My Test Pattern", "owner/repo");
      expect(id).toBe("my-test-pattern_owner_repo");
    });

    test("removes special characters", () => {
      const id = generatePatternId("Pattern (v2)", "owner/repo");
      expect(id).toBe("pattern-v2_owner_repo");
    });
  });

  describe("formatPatternMarkdown", () => {
    test("formats pattern with all fields", () => {
      const pattern = createTestPattern();
      const md = formatPatternMarkdown(pattern);

      // Check key sections
      expect(md).toContain(`# ${pattern.name}`);
      expect(md).toContain(`**Type:** ${pattern.type}`);
      expect(md).toContain(`**PAI Relevance:** ${pattern.pai_relevance}`);
      expect(md).toContain("## Source");
      expect(md).toContain("## Description");
      expect(md).toContain(pattern.description);
      expect(md).toContain("## Tags");
      expect(md).toContain(pattern.tags.join(", "));
    });

    test("includes snippet when provided", () => {
      const pattern: ExtractedPattern = {
        ...createTestPattern(),
        source: {
          ...createTestPattern().source,
          snippet: "const example = 'code';",
        },
      };
      const md = formatPatternMarkdown(pattern);

      expect(md).toContain("## Example");
      expect(md).toContain("const example = 'code';");
    });

    test("includes existing alternative when provided", () => {
      const pattern: ExtractedPattern = {
        ...createTestPattern(),
        existing_alternative: "existing-skill.md",
      };
      const md = formatPatternMarkdown(pattern);

      expect(md).toContain("## Existing Alternative");
      expect(md).toContain("existing-skill.md");
    });
  });

  describe("savePattern", () => {
    let savedPath: string;

    test("saves pattern to approved directory", async () => {
      const pattern = createTestPattern();
      savedPath = await savePattern(pattern);

      // Check file was created
      expect(savedPath).toContain(APPROVED_DIR);
      expect(savedPath).toContain(pattern.id);
      expect(existsSync(savedPath)).toBe(true);
    });

    test("updates pattern index", async () => {
      const pattern = createTestPattern();
      await savePattern(pattern);

      const index = await loadPatternIndex();
      expect(index.patterns[pattern.id]).toBeDefined();
      expect(index.patterns[pattern.id].status).toBe("approved");
      expect(index.patterns[pattern.id].repo).toBe(pattern.source.repo);
    });

    // Cleanup test file after tests
    afterAll(() => {
      if (savedPath && existsSync(savedPath)) {
        rmSync(savedPath);
      }
    });
  });
});
