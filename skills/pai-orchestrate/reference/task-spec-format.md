# XML Task Spec Format

Task specifications use XML for machine-parseable structure within markdown plans.

## Format

```xml
<task type="auto|manual|verify" id="task-01">
  <name>Brief task name</name>
  <files>comma, separated, file/paths</files>
  <depends>task-00</depends>  <!-- optional: task ID this depends on -->
  <wave>1</wave>              <!-- execution wave number -->
  <action>
    1. First step
    2. Second step
    3. Third step
  </action>
  <verify>How to verify this task is complete</verify>
  <done>Definition of done - acceptance criteria</done>
</task>
```

## Task Types

| Type | Description | When to Use |
|------|-------------|-------------|
| `auto` | Fully automatable by agent | Code changes, file operations |
| `manual` | Requires human action | External system changes, approvals |
| `verify` | Verification task | Testing, validation |

## Attributes

- **id**: Unique identifier for dependency tracking (format: `task-NN`)
- **type**: Execution type (auto/manual/verify)

## Elements

### Required
- `<name>`: Brief descriptive name (1-10 words)
- `<action>`: Numbered steps to complete the task
- `<done>`: Clear acceptance criteria

### Optional
- `<files>`: Files affected (for code tasks)
- `<depends>`: Task ID this depends on
- `<wave>`: Execution wave (calculated from dependencies if omitted)
- `<verify>`: Command or method to verify completion

## Example Plan

```markdown
# Plan: Add User Authentication

## Tasks

<task type="auto" id="task-01">
  <name>Create user model</name>
  <files>src/db/models/User.ts</files>
  <wave>1</wave>
  <action>
    1. Create User.ts with id, email, passwordHash fields
    2. Add TypeScript types
    3. Export from models/index.ts
  </action>
  <verify>import { User } from './models' compiles</verify>
  <done>User model exists with proper typing</done>
</task>

<task type="auto" id="task-02">
  <name>Create auth middleware</name>
  <files>src/middleware/auth.ts</files>
  <depends>task-01</depends>
  <wave>2</wave>
  <action>
    1. Create validateToken middleware
    2. Import User model for lookup
    3. Add to middleware exports
  </action>
  <verify>middleware parses valid JWT without error</verify>
  <done>Auth middleware validates tokens and attaches user to request</done>
</task>

<task type="verify" id="task-03">
  <name>Run auth tests</name>
  <depends>task-02</depends>
  <wave>3</wave>
  <action>
    1. Run npm test src/auth
    2. Verify all tests pass
  </action>
  <done>All auth tests green</done>
</task>
```

## Wave Calculation

Waves are calculated from dependencies:
- Tasks with no `<depends>` → Wave 1
- Tasks depending on Wave N → Wave N+1
- Tasks in same wave execute in parallel

## Parsing Notes

- Use simple regex extraction, not full XML parser
- Extract by tag name: `<name>(.*?)</name>`
- Handle multiline `<action>` content
- Task IDs are for dependency tracking only
