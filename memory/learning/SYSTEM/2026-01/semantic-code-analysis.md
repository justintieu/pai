# Semantic Code Analysis (TLDR Pattern)

**Source**: Continuous-Claude-v3 research
**Date**: 2026-01-28

## Insight

Raw source code consumes massive tokens (23K for 100K lines). A 5-layer semantic analysis reduces this to ~1.2K tokens (95% reduction):

1. **AST** (~500 tokens): Function signatures, parameters, docstrings
2. **Call Graph** (+440 tokens): Forward/backward call relationships
3. **Control Flow** (+110 tokens): Cyclomatic complexity, flow paths
4. **Data Flow** (+130 tokens): Variable definitions, transformations
5. **Dependencies** (+150 tokens): Program slicing for specific lines

## Implementation

- Use tree-sitter parsers for AST extraction
- Run as daemon to keep indexes in RAM (300x speedup)
- Incremental recomputation via content hashing
- PreToolUse hook forces TLDR usage instead of raw file reads

## Benefits

- 95% token reduction for code understanding
- Enables larger codebase exploration
- Prevents context pollution from verbose file reads

## Applicability

This is a significant infrastructure investment. Consider:
- Start with AST-only for function signatures
- Add layers incrementally based on need
- Could integrate with existing `Explore` agent

## Tags

token-optimization, code-analysis, context-management
