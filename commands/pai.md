# /pai Command

Personal AI Infrastructure management command.

## Usage

```
/pai <subcommand> [args]
```

## Subcommands

### /pai learn <insight>
Record a learning, insight, or pattern discovered during this session.

**Workflow:**
1. Capture the insight from the user or infer from conversation
2. Categorize it (technical, process, mistake-to-avoid)
3. Append to `~/.pai/memory/learnings.md` under appropriate section
4. Confirm what was added

**Example:**
```
/pai learn Using `git stash -p` allows selective stashing
```

### /pai sync [type]
Review and sync recent additions back to PAI source.

**Types:** `agent`, `skill`, `command`, `tool`, `all`

**Workflow:**
1. If type specified, focus on that type; otherwise scan for all new additions
2. Show what was added/changed this session (agents, skills, commands, tools)
3. For each item, ask: keep in PAI? (y/n/edit)
4. Write approved items to appropriate `~/.pai/` directory
5. Show summary of what was synced

**Example:**
```
/pai sync agent       # Sync new agent definitions
/pai sync             # Review all additions
```

### /pai status
Show current PAI status and what's been modified this session.

**Workflow:**
1. Show PAI source location
2. List any files modified in `~/.pai/` this session
3. Show pending items that could be synced

### /pai remember <note>
Add a quick note to work status or memory.

**Workflow:**
1. Capture the note
2. Determine best location (work_status.md for tasks, learnings.md for insights)
3. Append with timestamp
4. Confirm

**Example:**
```
/pai remember Left off debugging the auth flow - check token refresh
```

### /pai preference <key> <value>
Update a preference in your PAI.

**Workflow:**
1. Parse key/value
2. Update `~/.pai/context/preferences.md`
3. Confirm the change

**Example:**
```
/pai preference code_style "prefer functional over OOP"
```

### /pai export <type> <name>
Export something from current session to PAI.

**Types:** `agent`, `skill`, `command`, `strategy`

**Workflow:**
1. If item exists in conversation/session, extract its definition
2. Format for the appropriate PAI directory
3. Write to `~/.pai/<type>s/<name>.md`
4. Confirm with file path

**Example:**
```
/pai export agent code-reviewer   # Export agent we defined this session
/pai export skill debugging       # Export a debugging workflow
```

## Notes for AI

- PAI source is at `~/.pai/` (check with `pai status` if unsure)
- Always show the user what will be written before writing
- Use append for learnings/memory, create new files for agents/skills/commands
- Keep entries concise but useful for future context
- When syncing, prefer quality over quantity - not everything needs to persist
