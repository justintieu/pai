/**
 * extractor.test.ts - Tests for pattern extraction logic
 */

import { describe, test, expect } from "bun:test";
import {
  generatePatternId,
  inferPatternType,
  assessPaiRelevance,
  findExistingAlternative,
  buildPatternTags,
  extractPatterns,
} from "./extractor.ts";
import type { InvestigationReport } from "../report.ts";
import { generateReport } from "../report.ts";

describe("generatePatternId", () => {
  test("creates valid slug from name and repo", () => {
    const id = generatePatternId("Process-Save-Summarize", "anthropics/cookbook");
    expect(id).toBe("process-save-summarize_anthropics_cookbook");
  });

  test("handles spaces in pattern name", () => {
    const id = generatePatternId("Context Window Manager", "owner/repo");
    expect(id).toBe("context-window-manager_owner_repo");
  });

  test("removes special characters", () => {
    const id = generatePatternId("Pattern (v2.0)", "owner/test-repo");
    expect(id).toBe("pattern-v20_owner_test-repo");
  });

  test("handles empty spaces consistently", () => {
    const id = generatePatternId("  Multiple   Spaces  ", "owner/repo");
    expect(id).toBe("multiple-spaces_owner_repo");
  });
});

describe("inferPatternType", () => {
  test("identifies workflow patterns", () => {
    expect(inferPatternType("A workflow for processing data")).toBe("workflow");
    expect(inferPatternType("Pipeline for data transformation")).toBe("workflow");
    expect(inferPatternType("Process chain implementation")).toBe("workflow");
    expect(inferPatternType("Orchestration of sub-agents")).toBe("workflow");
  });

  test("identifies architectural patterns", () => {
    expect(inferPatternType("Architecture for modular systems")).toBe("architectural");
    expect(inferPatternType("Structure of the codebase")).toBe("architectural");
    expect(inferPatternType("Design pattern for components")).toBe("architectural");
    expect(inferPatternType("Layered application pattern")).toBe("architectural");
  });

  test("identifies integration patterns", () => {
    expect(inferPatternType("Integration with external services")).toBe("integration");
    expect(inferPatternType("API connection handler")).toBe("integration");
    expect(inferPatternType("Bridge between systems")).toBe("integration");
    expect(inferPatternType("Interface adapter")).toBe("integration");
  });

  test("defaults to code for other patterns", () => {
    expect(inferPatternType("A utility function for strings")).toBe("code");
    expect(inferPatternType("Helper class implementation")).toBe("code");
    expect(inferPatternType("Data validation logic")).toBe("code");
  });
});

describe("assessPaiRelevance", () => {
  test("returns high for agent-related patterns", () => {
    expect(assessPaiRelevance({ name: "Agent Controller", description: "Controls agent behavior" })).toBe("high");
    expect(assessPaiRelevance({ name: "Context Manager", description: "Manages context" })).toBe("high");
    expect(assessPaiRelevance({ name: "Memory System", description: "Memory storage" })).toBe("high");
    expect(assessPaiRelevance({ name: "Learning Pipeline", description: "Learning extraction" })).toBe("high");
    expect(assessPaiRelevance({ name: "Skill Builder", description: "Builds skills" })).toBe("high");
  });

  test("returns medium for automation patterns", () => {
    expect(assessPaiRelevance({ name: "Automation Helper", description: "Automates tasks" })).toBe("medium");
    expect(assessPaiRelevance({ name: "CLI Tool", description: "Command line tool" })).toBe("medium");
    expect(assessPaiRelevance({ name: "Pipeline Builder", description: "Build pipelines" })).toBe("medium");
    expect(assessPaiRelevance({ name: "Plugin System", description: "Modular plugins" })).toBe("medium");
  });

  test("returns low for generic patterns", () => {
    expect(assessPaiRelevance({ name: "String Formatter", description: "Formats strings" })).toBe("low");
    expect(assessPaiRelevance({ name: "Date Parser", description: "Parses dates" })).toBe("low");
    expect(assessPaiRelevance({ name: "File Reader", description: "Reads files" })).toBe("low");
  });
});

describe("findExistingAlternative", () => {
  test("finds patterns with high word overlap", () => {
    // "Context Manager" matches "context-manager" because both words overlap = 2/2 = 100%
    const existing = ["context-manager_owner_repo", "data-processor_other_repo"];
    const result = findExistingAlternative("Context Manager", existing);
    expect(result).toBe("context-manager_owner_repo");
  });

  test("returns undefined when no match found", () => {
    const existing = ["totally-different_owner_repo"];
    const result = findExistingAlternative("Context Manager", existing);
    expect(result).toBeUndefined();
  });

  test("handles empty existing patterns", () => {
    const result = findExistingAlternative("Context Manager", []);
    expect(result).toBeUndefined();
  });

  test("requires >50% word overlap", () => {
    // "Context Manager" has 2 words, only "context" overlaps = 1/2 = 50%, not >50%
    const existing = ["context-handler_owner_repo"];
    const result = findExistingAlternative("Context Manager", existing);
    expect(result).toBeUndefined();
  });

  test("finds match with extended word overlap", () => {
    // "context-manager-handler" contains both "context" and "manager" = 2/2 = 100%
    const existing = ["context-manager-handler_owner_repo"];
    const result = findExistingAlternative("Context Manager", existing);
    expect(result).toBe("context-manager-handler_owner_repo");
  });

  test("finds match with single-word pattern at 100%", () => {
    // Single word "Agent" matches pattern with "agent" in it = 1/1 = 100%
    const existing = ["agent-controller_owner_repo"];
    const result = findExistingAlternative("Agent", existing);
    expect(result).toBe("agent-controller_owner_repo");
  });
});

describe("buildPatternTags", () => {
  test("includes language and topics", () => {
    const report = generateReport({
      metadata: { language: "TypeScript", topics: ["ai", "agents", "patterns"] },
    }) as InvestigationReport;

    const tags = buildPatternTags(report, { name: "Test", description: "workflow test" });

    expect(tags).toContain("typescript");
    expect(tags).toContain("ai");
    expect(tags).toContain("agents");
    expect(tags).toContain("patterns");
  });

  test("includes inferred pattern type", () => {
    const report = generateReport({
      metadata: { language: "Python" },
    }) as InvestigationReport;

    const tags = buildPatternTags(report, { name: "Test", description: "A workflow process" });
    expect(tags).toContain("workflow");
  });

  test("includes words from pattern name", () => {
    const report = generateReport({
      metadata: { language: "Go" },
    }) as InvestigationReport;

    const tags = buildPatternTags(report, { name: "Context Manager", description: "test" });
    expect(tags).toContain("context");
    expect(tags).toContain("manager");
  });

  test("limits topics to first 3", () => {
    const report = generateReport({
      metadata: { topics: ["topic1", "topic2", "topic3", "topic4", "topic5"] },
    }) as InvestigationReport;

    const tags = buildPatternTags(report, { name: "Test", description: "test" });
    expect(tags).toContain("topic1");
    expect(tags).toContain("topic2");
    expect(tags).toContain("topic3");
    expect(tags).not.toContain("topic4");
    expect(tags).not.toContain("topic5");
  });

  test("deduplicates tags", () => {
    const report = generateReport({
      metadata: { language: "TypeScript", topics: ["typescript"] },
    }) as InvestigationReport;

    const tags = buildPatternTags(report, { name: "Test", description: "test" });
    const typescriptCount = tags.filter((t) => t === "typescript").length;
    expect(typescriptCount).toBe(1);
  });
});

describe("extractPatterns", () => {
  test("extracts patterns from investigation report", async () => {
    const report = generateReport({
      investigation: {
        repo: "anthropics/cookbook",
        url: "https://github.com/anthropics/cookbook",
        mode: "quick_scan",
      },
      metadata: {
        language: "TypeScript",
        topics: ["ai", "agents"],
      },
      insights: {
        patterns: [
          { name: "Agent Coordinator", description: "Coordinates multiple agents" },
          { name: "Context Manager", description: "Manages context window" },
        ],
      },
    }) as InvestigationReport;

    const patterns = await extractPatterns(report, "~/.pai/output/test.yaml");

    expect(patterns.length).toBe(2);
    expect(patterns[0].id).toBe("agent-coordinator_anthropics_cookbook");
    expect(patterns[0].pai_relevance).toBe("high");
  });

  test("filters out low-relevance patterns", async () => {
    const report = generateReport({
      investigation: {
        repo: "owner/repo",
        url: "https://github.com/owner/repo",
        mode: "quick_scan",
      },
      insights: {
        patterns: [
          { name: "Agent Coordinator", description: "Coordinates agents" },
          { name: "String Formatter", description: "Formats strings nicely" },
          { name: "Date Parser", description: "Parses date strings" },
        ],
      },
    }) as InvestigationReport;

    const patterns = await extractPatterns(report, "~/.pai/output/test.yaml");

    // Only the agent pattern should pass (high relevance)
    expect(patterns.length).toBe(1);
    expect(patterns[0].name).toBe("Agent Coordinator");
  });

  test("populates all ExtractedPattern fields", async () => {
    const report = generateReport({
      investigation: {
        repo: "owner/test",
        url: "https://github.com/owner/test",
        mode: "deep_dive",
      },
      metadata: {
        language: "Python",
        topics: ["ml", "agents"],
      },
      insights: {
        patterns: [
          { name: "Sub-Agent Workflow", description: "Workflow for orchestrating sub-agents" },
        ],
      },
    }) as InvestigationReport;

    const patterns = await extractPatterns(report, "~/.pai/output/test.yaml");

    expect(patterns.length).toBe(1);
    const pattern = patterns[0];

    expect(pattern.id).toBe("sub-agent-workflow_owner_test");
    expect(pattern.name).toBe("Sub-Agent Workflow");
    expect(pattern.type).toBe("workflow");
    expect(pattern.description).toBe("Workflow for orchestrating sub-agents");
    expect(pattern.source.repo).toBe("owner/test");
    expect(pattern.source.url).toBe("https://github.com/owner/test");
    expect(pattern.source.report_path).toBe("~/.pai/output/test.yaml");
    expect(pattern.pai_relevance).toBe("high");
    expect(pattern.tags).toContain("python");
    expect(pattern.tags).toContain("workflow");
    expect(pattern.extracted_at).toBeTruthy();
  });

  test("handles empty patterns array", async () => {
    const report = generateReport({
      investigation: {
        repo: "owner/empty",
        url: "https://github.com/owner/empty",
        mode: "quick_scan",
      },
      insights: {
        patterns: [],
      },
    }) as InvestigationReport;

    const patterns = await extractPatterns(report, "~/.pai/output/test.yaml");
    expect(patterns.length).toBe(0);
  });
});
