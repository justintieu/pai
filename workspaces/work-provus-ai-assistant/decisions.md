# Architectural Decisions

## 2024-01 Document Insights Persistence

**Status:** DEFERRED

**Context:**
Document Insights are currently extracted on-the-fly from `agent_actions.result` JSONB. No dedicated table exists.

**Decision:**
Wait for document analysis integration to stabilize before materializing insights to dedicated table.

**Rationale:**
- Document analysis output format may change
- Materializing now risks schema churn
- Overlay table was considered but full table preferred for cleaner architecture

**Two Insight Systems Identified:**
1. Document Insights - extracted from doc analysis (RFPs, contracts)
2. Deal Insights - agent-generated strategic thoughts about quotes (has dedicated table)

**Future approach:** Create `document_insights` table with:
- Original extracted data
- is_hidden flag (instead of delete)
- override_text (edit preserves original)
- User tracking (hidden_by, edited_by)
