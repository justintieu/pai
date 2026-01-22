# Test Workflow

Run tests with context-efficient output - saves full results to files, returns only summary.

## When to Use

- Verifying implementation after changes
- Running tests before commit/PR
- Checking test coverage for a scope
- Debugging failing tests

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| `scope` | No | Run tests for specific indexed scope (default: detect from cwd) |
| `filter` | No | Test file pattern or specific test name (e.g., "auth", "*.integration.ts") |
| `verbose` | No | Include full failure stack traces in summary (default: false) |

## Process

### 1. Detect Test Framework

Check for test configuration files in order:

```
package.json        → jest, vitest, mocha, ava (scripts.test)
jest.config.*       → jest
vitest.config.*     → vitest
pytest.ini          → pytest
pyproject.toml      → pytest (tool.pytest section)
setup.cfg           → pytest
Cargo.toml          → cargo test
go.mod              → go test
Makefile            → make test (if test target exists)
```

**Detection logic:**
```
If package.json exists:
  If scripts.test contains "jest" → jest
  If scripts.test contains "vitest" → vitest
  If scripts.test contains "mocha" → mocha
  If devDependencies has "jest" → jest
  If devDependencies has "vitest" → vitest

If pytest.ini or pyproject.toml[tool.pytest] → pytest
If Cargo.toml → cargo test
If go.mod → go test ./...
If Makefile has "test:" target → make test
```

### 2. Build Test Command

Based on detected framework and parameters:

**JavaScript/TypeScript:**
```bash
# Jest
npx jest {filter} --no-colors 2>&1

# Vitest
npx vitest run {filter} --reporter=verbose 2>&1

# npm script fallback
npm test -- {filter} 2>&1
```

**Python:**
```bash
# pytest
python -m pytest {filter} -v --tb=short 2>&1
```

**Rust:**
```bash
# cargo
cargo test {filter} --no-fail-fast 2>&1
```

**Go:**
```bash
# go test
go test ./... -v {filter} 2>&1
```

### 3. Spawn Test Runner Agent

Use the Task tool to spawn a sub-agent:

```
Task(
  subagent_type: "Execute",
  prompt: """
  You are a test runner agent. Execute tests and capture results.

  Project: {project}
  Scope: {scope}
  Framework: {framework}
  Command: {test_command}
  Filter: {filter or "none"}
  Output directory: {output_dir}/tests/

  Execute the test command and capture ALL output.

  After execution, create a results file:

  **{timestamp}.md** - Full test output
  ```
  # Test Results: {scope}

  **Run at:** {timestamp}
  **Command:** {test_command}
  **Duration:** {duration}

  ## Summary
  - Total: {total}
  - Passed: {passed}
  - Failed: {failed}
  - Skipped: {skipped}

  ## Failures

  ### {test_name}
  **File:** {file}:{line}
  **Error:** {error_message}
  **Stack:**
  ```
  {stack_trace}
  ```

  ## Full Output
  ```
  {complete stdout/stderr}
  ```
  ```

  Save to: {output_dir}/tests/{timestamp}.md

  Return a brief summary in this exact format:
  Results: {passed}/{total} passed. Failures: {file1}:{line1}, {file2}:{line2}

  If all tests pass:
  Results: {total}/{total} passed. All tests green.
  """
)
```

### 4. Parse Test Output

Extract from test runner output:

**Jest output parsing:**
```
Tests:       X failed, Y passed, Z total
```

**Pytest output parsing:**
```
X passed, Y failed, Z skipped in N.NNs
FAILED path/to/test.py::test_name - AssertionError
```

**Cargo output parsing:**
```
test result: FAILED. X passed; Y failed; Z ignored
```

**Go output parsing:**
```
--- FAIL: TestName (0.00s)
FAIL    package/path    0.001s
```

### 5. Extract Failure Locations

For each failure, extract:
- File path (relative to project root)
- Line number (if available)
- Test name
- Error message (first line)
- Stack trace (for verbose mode)

### 6. Save Full Output

Save complete test output to timestamped file:

```
~/.pai/output/codebase/{project}/{scope}/tests/
└── 2026-01-22-143022.md
```

File structure:
```markdown
# Test Results: {scope}

**Run at:** 2026-01-22 14:30:22
**Command:** `npx jest --no-colors`
**Duration:** 12.3s

## Summary

| Metric | Count |
|--------|-------|
| Total | 47 |
| Passed | 45 |
| Failed | 2 |
| Skipped | 0 |

## Failures

### auth.test.ts:89 - should expire token after 24 hours

**Error:** Expected token to be expired
```
expect(received).toBe(expected)

Expected: true
Received: false

  87 |     const token = createToken({ expiresIn: '24h' });
  88 |     advanceTime(25 * 60 * 60 * 1000);
> 89 |     expect(isExpired(token)).toBe(true);
  90 |   });
```

### api.test.ts:156 - should return 404 for missing resource

**Error:** Cannot read property 'status' of undefined
```
TypeError: Cannot read property 'status' of undefined

  154 |   const response = await request(app).get('/api/missing');
  155 |
> 156 |   expect(response.status).toBe(404);
  157 | });
```

## Full Output

<details>
<summary>Complete test output (click to expand)</summary>

```
PASS src/utils/helpers.test.ts
PASS src/middleware/auth.test.ts
FAIL src/routes/auth.test.ts
  ● should expire token after 24 hours
...
```

</details>
```

### 7. Return Summary

Return concise summary to main conversation:

```markdown
## Test Results: {scope}

**Results:** 45/47 passed

**Failures:**
| Location | Test | Error |
|----------|------|-------|
| `auth.test.ts:89` | token expiry | Expected token to be expired |
| `api.test.ts:156` | 404 response | Cannot read property 'status' |

**Full output:** `~/.pai/output/codebase/{project}/{scope}/tests/2026-01-22-143022.md`
```

If all tests pass:
```markdown
## Test Results: {scope}

**Results:** 47/47 passed. All tests green.

**Full output:** `~/.pai/output/codebase/{project}/{scope}/tests/2026-01-22-143022.md`
```

Ultra-compact format (~200 chars):
```
Results: 45/47 passed. Failures: auth.test.ts:89, api.test.ts:156
```

## Verbose Mode

When `--verbose` is specified, include stack traces in summary:

```markdown
## Test Results: {scope}

**Results:** 45/47 passed

### Failures

**auth.test.ts:89** - should expire token after 24 hours
```
expect(received).toBe(expected)
Expected: true
Received: false
```

**api.test.ts:156** - should return 404 for missing resource
```
TypeError: Cannot read property 'status' of undefined
```

**Full output:** `~/.pai/output/codebase/{project}/{scope}/tests/2026-01-22-143022.md`
```

## Filtered Tests

### By file pattern
```
/codebase test --filter "auth"           # Files containing "auth"
/codebase test --filter "*.integration"  # Integration tests only
```

### By test name
```
/codebase test --filter "should expire"  # Tests matching name
```

### By scope
```
/codebase test --scope api               # Tests in api scope only
/codebase test --scope web --filter e2e  # E2E tests in web scope
```

## Continuous Integration Mode

For CI pipelines, the workflow can output machine-readable format:

```json
{
  "scope": "api",
  "timestamp": "2026-01-22T14:30:22Z",
  "duration_ms": 12300,
  "total": 47,
  "passed": 45,
  "failed": 2,
  "skipped": 0,
  "failures": [
    {
      "file": "auth.test.ts",
      "line": 89,
      "test": "should expire token after 24 hours",
      "error": "Expected token to be expired"
    }
  ],
  "output_file": "~/.pai/output/codebase/my-project/api/tests/2026-01-22-143022.md"
}
```

## Context Efficiency

| Phase | Context Used | Saved |
|-------|-------------|-------|
| Framework detection | ~100 chars | Automatic |
| Test execution | Sub-agent | All stdout/stderr |
| Output parsing | Sub-agent | Raw test output |
| Storage | Files | Full output + traces |
| Return | ~200 chars | Summary only |

**Total context saved:** ~98% compared to inline test output

## Examples

**Example 1: Run all tests**
```
User: run the tests
Claude: Running tests...

Results: 47/47 passed. All tests green.
Full output: ~/.pai/output/codebase/my-project/root/tests/2026-01-22-143022.md
```

**Example 2: Run tests for scope with failures**
```
User: run api tests
Claude: Running tests for api scope...

Results: 45/47 passed. Failures: auth.test.ts:89, api.test.ts:156
Full output: ~/.pai/output/codebase/my-project/api/tests/2026-01-22-143522.md
```

**Example 3: Run filtered tests verbosely**
```
User: run auth tests with full output
Claude: Running auth tests with verbose output...

Results: 12/13 passed

**auth.test.ts:89** - should expire token after 24 hours
```
expect(received).toBe(expected)
Expected: true
Received: false
```

Full output: ~/.pai/output/codebase/my-project/api/tests/2026-01-22-144022.md
```
