# PAI Domain Catalog

> **Two-Stage Routing**: This catalog enables domain-first routing for improved skill matching accuracy (~40% improvement when catalog exceeds 15 skills). Route to domain first, then select specific skill.

> **Autonomy Levels**: Each domain has a default autonomy level. See [protocols/autonomy-levels.md](../protocols/autonomy-levels.md) for level definitions.

See `task-defs/index.md` for full trigger patterns and skill descriptions.

---

## Coding

**Default Autonomy:** Operator

**Keywords:** implement, build, create, refactor, debug, fix, add feature, code, develop, new project, index codebase, understand code, cli, typescript

**Skills:**
- pai-orchestrate: Multi-file features, refactors, complex implementations
- pai-codebase: Index and understand codebases, analyze structure
- pai-createcli: Build production-ready TypeScript CLI tools
- pai-createskill: Create new PAI skills following conventions

## Research & Intelligence

**Default Autonomy:** Operator

**Keywords:** research, find out about, look into, investigate, learn about, OSINT, background check, due diligence, recon, scan, scrape, fetch URL, annual reports, threat intelligence

**Skills:**
- pai-research: Multi-source research with parallel agents
- pai-osint: Open source intelligence gathering
- pai-recon: Security reconnaissance and infrastructure mapping
- pai-annualreports: Security vendor report aggregation and analysis
- pai-brightdata: Progressive URL scraping with fallback tiers
- pai-scout: Evaluate external PAI skills and repositories

## Reasoning & Validation

**Default Autonomy:** Operator

**Keywords:** debate, multiple perspectives, red team, critique, stress test, counterarguments, first principles, challenge assumptions, systematic approach, structured execution, validate argument

**Skills:**
- pai-council: Multi-agent debate for multiple perspectives
- pai-redteam: Adversarial analysis and stress-testing
- pai-firstprinciples: Foundational reasoning from first principles
- pai-algorithm: Structured scientific execution methodology

## Web & Visual

**Default Autonomy:** Operator

**Keywords:** browse website, take screenshot, fill form, click button, web automation, create image, generate illustration, make diagram, visualize data, flowchart, infographic

**Skills:**
- pai-browser: Browser automation with Playwright
- pai-art: Visual content generation (illustrations, diagrams)

## Context & Memory

**Default Autonomy:** Operator

**Keywords:** archive session, save context, extract decisions, goals, beliefs, identity, workspace, project context, session tracking, work history, remind me, set reminder, timer

**Skills:**
- pai-historian: Context archiving and extraction
- pai-telos: Goals, beliefs, identity management
- pai-workspace: Project-specific context management
- pai-work-status: Session and work tracking
- pai-remind: Timed reminders and notifications

## PAI Infrastructure

**Default Autonomy:** Operator

**Keywords:** improve PAI, update PAI, validate skill, check skill, integrity check, system health, audit system, spawn agents, create agents, port skill, add skill

**Skills:**
- pai-improve: Update and enhance PAI infrastructure
- pai-validate: Validate and fix PAI skills
- pai-system: System health and integrity checks
- pai-agents: Dynamic agent composition and management
- pai-porter: Port external skills to PAI format

## PAI File Operations

**Default Autonomy:** Operator

**Keywords:** read PAI file, check status, quick lookup, log memory, update status, edit context, update identity, modify beliefs

**Skills:**
- pai-reader: Quick PAI file lookups (fast, haiku-tier)
- pai-logger: Memory and status updates (sonnet-tier)
- pai-editor: Thoughtful context edits (opus-tier)

## Prompting

**Default Autonomy:** Operator

**Keywords:** meta-prompting, template generation, prompt optimization, create prompt, improve prompt, evaluate prompt, rubric

**Skills:**
- pai-prompting: Prompt engineering and optimization

## Communications

**Default Autonomy:** Collaborator
**Protocol:** [draft-approve](../protocols/draft-approve.md)
**Restrictions:** Never send without explicit "confirm/yes/send it"

**Description:** Draft messages in user's voice using writing samples. Follows draft-approve workflow with voice matching for authentic tone.

**Keywords:** draft, compose, write, send, email, message, reply, communication, respond to, forward, notification

**Skills:**
- voice-capture: Guided wizard for importing writing samples (protocol)
- voice-matching: Draft messages in user's authentic voice (protocol)

*Future: pai-email, pai-messaging (platform integrations)*

## Scheduling

**Default Autonomy:** Collaborator
**Protocol:** [draft-approve](../protocols/draft-approve.md), [conflict-detection](../protocols/conflict-detection.md)
**Restrictions:** Always use draft-approve for calendar modifications. Never move events without explicit confirmation.

**Description:** Calendar visibility with proactive conflict detection and time blocking recommendations. Uses gcalcli for Google Calendar and icalendar-events-cli for ICS sources.

**Keywords:** calendar, schedule, meeting, conflict, free time, busy, availability, time block, focus time, reschedule, when am I free, book, appointment

**Skills:**
- pai-calendar: Calendar visibility, sync, conflict detection, time blocking analysis
  - Sync: `~/.pai/skills/pai-calendar/sync.sh` (gcalcli + icalendar-events-cli)
  - Conflicts: `~/.pai/skills/pai-calendar/conflicts.sh` (HIGH/MEDIUM/LOW severity)
  - Time blocking: Advisory recommendations (no auto-create events)

**Protocols:**
- calendar-sync: Multi-source calendar access
- conflict-detection: Proactive conflict identification
- time-blocking: Advisory time blocking suggestions

## Finance

**Default Autonomy:** Advisor
**Protocol:** [finance-sync](../protocols/finance-sync.md), [spending-insights](../protocols/spending-insights.md)
**Restrictions:** Read-only actions only. Cannot initiate transactions, transfers, or modify financial data. Never connects accounts without explicit user request.

**Description:** Read-only financial visibility across all connected accounts. Aggregates balances from checking, savings, credit cards, investments, and loans via Plaid. Provides automatic transaction categorization, spending insights, and payment due date alerts. Strictly read-only — observes and reports, never modifies.

**Keywords:** balance, transactions, spending, financial, money, accounts, credit card, bank, investments, loans, net worth, due date, payment, categorize, expense, income, budget

**Skills:**
- pai-finance: Financial visibility, account sync, spending insights
  - Sync: On-demand Plaid sync via finance-sync protocol
  - Insights: Spending trends, unusual activity alerts
  - Due Dates: Payment reminders for credit cards and loans

**Protocols:**
- finance-storage: Encrypted SQLite for local financial data
- finance-sync: On-demand Plaid sync with categorization
- spending-insights: Trend analysis and recommendations
- plaid-link: Browser-based account connection flow

## Learning

**Default Autonomy:** Collaborator
**Protocol:** [learning-goals](../protocols/learning-goals.md), [milestone-definition](../protocols/milestone-definition.md)
**Restrictions:** Never create/modify goals without explicit confirmation. Use draft-approve for milestone suggestions.

**Description:** Track learning goals with collaborative milestone definition, visual progress tracking, and gentle reminders. PAI helps break down large goals into achievable steps and surfaces next tasks without overwhelming.

**Keywords:** learn, study, goal, progress, milestone, skill, course, practice, tutorial, track learning, what should I learn, learning progress, next task, learning goals

**Skills:**
- pai-learning: Goal management, milestone definition, progress tracking, session-start nudges
  - Goals: Create/view/pause/archive learning goals
  - Milestones: Collaborative definition with guided questions
  - Progress: Journey view with checkbox-based calculation
  - Nudges: Session-start reminders, stale goal re-engagement

**Protocols:**
- learning-goals: Goal lifecycle management
- milestone-definition: Collaborative milestone creation
- progress-tracking: Progress calculation and visualization
- learning-nudges: Reminder and encouragement system

## Self-Improvement

**Default Autonomy:** Collaborator
**Protocol:** [self-improvement](../protocols/self-improvement.md)
**Restrictions:** Only modify rules/ and context/ files. Never modify code. Auto-apply limited to low-risk patterns (naming, formatting).

**Description:** Feedback loop that captures learnings during sessions, detects patterns (3+ similar = rule candidate), and compiles curated rules. All self-modifications version controlled via git + CHANGELOG.md for auditability and rollback.

**Keywords:** learn, insight, pattern, rule, compile, review rules, self-improve, capture learning, detected pattern, rule proposal, pending rules

**Skills:**
- pai-self-improve: Learning capture, pattern detection, rule compilation, audit trail
  - Capture: `/pai learn` command with domain/tags metadata
  - Detect: 3+ similar learnings trigger pattern candidate
  - Compile: Rule proposals routed by domain (coding → rules/, other → context/)
  - Review: `/pai review-rules` for approval/rejection workflow

**Protocols:**
- self-improvement: Full learnings-to-rules pipeline specification
