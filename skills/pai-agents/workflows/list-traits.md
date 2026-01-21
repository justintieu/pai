# List Traits Workflow

Display available traits for composing custom agents across three categories.

## Configuration

- **Agents:** 0 (informational only)
- **Time:** Instant

## Trigger Recognition

Use when user asks:
- "list traits"
- "what traits are available"
- "show me trait options"
- "what can I compose agents with"

## Output

Present the 28 available traits organized by category:

```markdown
## Available Traits for Agent Composition

Custom agents are composed by combining traits from three dimensions:

---

### Expertise Domains (10)

| Trait | Focus Area |
|-------|------------|
| **security** | Vulnerabilities, threat modeling, attack surfaces |
| **legal** | Compliance, contracts, liability, regulations |
| **finance** | Costs, ROI, budgets, financial risk |
| **medical** | Health, safety, clinical considerations |
| **technical** | Implementation, architecture, engineering |
| **research** | Data, evidence, precedent, studies |
| **creative** | Design, aesthetics, innovation |
| **business** | Strategy, market, competitive analysis |
| **data** | Analytics, metrics, patterns |
| **communications** | Messaging, clarity, audience |

---

### Personality Styles (10)

| Trait | Reasoning Style |
|-------|-----------------|
| **skeptical** | Questions assumptions, demands proof |
| **enthusiastic** | Energetic, sees opportunities |
| **cautious** | Risk-aware, conservative |
| **bold** | Willing to take chances, ambitious |
| **analytical** | Data-driven, logical |
| **creative** | Lateral thinking, unconventional |
| **empathetic** | User-focused, considers human factors |
| **contrarian** | Challenges consensus, devil's advocate |
| **pragmatic** | Practical, focused on what works |
| **meticulous** | Detail-oriented, thorough |

---

### Work Approaches (8)

| Trait | Working Style |
|-------|---------------|
| **thorough** | Comprehensive, leaves nothing unchecked |
| **rapid** | Fast, prioritizes speed |
| **systematic** | Methodical, structured process |
| **exploratory** | Open-ended, discovery-driven |
| **comparative** | Benchmarks against alternatives |
| **synthesizing** | Integrates multiple sources |
| **adversarial** | Red team, assumes hostile actors |
| **consultative** | Collaborative, seeks input |

---

## Preset Combinations

| Preset | Composition | Good For |
|--------|-------------|----------|
| Security Audit | security + skeptical + adversarial | Vulnerability review |
| Code Review | technical + meticulous + systematic | Quality assurance |
| Market Analysis | business + analytical + comparative | Competitive research |
| Creative Brief | creative + enthusiastic + exploratory | Ideation |
| Risk Assessment | finance + cautious + thorough | Due diligence |
| Red Team | security + contrarian + adversarial | Penetration testing mindset |
| UX Review | creative + empathetic + consultative | User experience |
| Legal Review | legal + meticulous + systematic | Compliance checking |

---

## Usage

Specify traits naturally when requesting custom agents:

- "Create a skeptical security analyst using adversarial approach"
- "I need agents that are analytical and thorough"
- "Give me one cautious finance perspective and one bold business perspective"

The system will compose agents matching your trait descriptions.
```

## Notes

- Users don't need to use exact trait names - natural language works
- Recommend varying at least 2 of 3 dimensions between agents
- Presets are starting points, not requirements
