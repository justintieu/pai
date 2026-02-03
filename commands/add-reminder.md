# /pai add-reminder

Interactively add a new deadline reminder.

## Usage

```
/pai add-reminder
/pai add-reminder <title>
```

## Behavior

When invoked:
1. If no title provided, ask for the deadline title
2. Ask for the due date (YYYY-MM-DD format)
3. Ask for the category (e.g., city-license, state-filing, tax, contract)
4. Ask if it's recurring (yearly/biennial/quarterly/none)
5. Ask for optional notes
6. Confirm before adding
7. Append to `~/.pai/memory/reminders/deadlines.yaml`

## Required Fields

- **id**: Generate from title (lowercase, hyphenated)
- **title**: User-provided deadline name
- **due**: Due date in YYYY-MM-DD format
- **category**: Type of deadline
- **critical**: Default to true for business deadlines
- **recurring**: yearly, biennial, quarterly, or none
- **remind_at**: Default to [30, 14, 7, 1] days before

## YAML Format

```yaml
  - id: generated-from-title
    title: User Provided Title
    due: YYYY-MM-DD
    category: category-name
    critical: true
    recurring: yearly
    remind_at:
      - 30
      - 14
      - 7
      - 1
    notes: Optional user notes
```

## Notes for AI

When the user runs `/pai add-reminder`:
1. Gather all required information interactively
2. Generate a unique ID from the title
3. Show the user the YAML that will be added
4. Ask for confirmation
5. Read the current deadlines.yaml
6. Append the new deadline to the deadlines array
7. Write the updated file
8. Confirm the addition and show when it's due
