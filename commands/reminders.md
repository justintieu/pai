# /pai reminders

Display all configured deadline reminders (ignores mute status).

## Usage

```
/pai reminders
```

## Behavior

When invoked:
1. Read `~/.pai/memory/reminders/deadlines.yaml`
2. Display ALL deadlines with days remaining (or overdue status)
3. Group by status: overdue, due soon (<=7 days), upcoming (<=30 days), future

## Display Format

```
All Business Deadlines

OVERDUE:
  !! [Title]
     Due: [Date] (X days overdue)

DUE SOON (within 7 days):
  !  [Title]
     Due: [Date] (X days)

UPCOMING (within 30 days):
     [Title]
     Due: [Date] (X days)

FUTURE:
     [Title]
     Due: [Date] (X days)
```

## Implementation

```bash
# Read and parse deadlines.yaml
cat ~/.pai/memory/reminders/deadlines.yaml
```

## Notes for AI

When the user runs `/pai reminders`:
1. Read the deadlines.yaml file
2. Calculate days until each deadline from today's date
3. Sort by due date (soonest first)
4. Display using the format above
5. For each deadline show: title, due date, days remaining/overdue, category, recurring frequency
6. This command IGNORES the mute file - always show all deadlines
