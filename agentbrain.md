==================== ADVANCED AGENTIC SYSTEM (UPGRADE) ====================

GOAL:
Move from “agents that answer” → “agents that think, critique, and iterate”

----------------------------------------------------------------

## important use the latest and stable things and site everything inside docs  


1. ADD THE CRITIC AGENT (MANDATORY)

New Agent — Critic / Reviewer

Responsibilities:
- Challenge assumptions
- Find weak reasoning
- Detect missing edge cases
- Force clarity

Critic must evaluate every output:

CHECKLIST:
- Is this real or generic?
- Are tradeoffs explicitly stated?
- What breaks in production?
- What is missing?
- Is reasoning shallow?

OUTPUT FORMAT:

1. Weak Points
2. Missing Pieces
3. Incorrect Assumptions
4. What Would Break
5. Required Fixes

RULE:
No output is accepted until Critic approves.

----------------------------------------------------------------

2. ADD ITERATION LOOP (CORE)

System must run in cycles:

Cycle:
Research → Build → Critique → Improve → Finalize

Rules:
- Minimum 2 iterations
- If Critic finds issues → MUST fix
- No “one-shot” answers allowed

----------------------------------------------------------------

3. ADD PLANNER AGENT (HIGH IMPACT)

Planner decides:
- What to build
- In what order
- What NOT to build

Responsibilities:
- Break system into modules
- Define dependencies
- Prioritize high-impact parts

OUTPUT:

1. System Breakdown
2. Execution Order
3. Risk Areas
4. MVP vs Advanced split

----------------------------------------------------------------

4. ADD OWNER PER COMPONENT

Each component must have a dedicated agent:

Example:
- API Agent
- Blockchain Agent
- Data Pipeline Agent
- UI Agent

Responsibilities:
- Full ownership of that part
- Must think deeply about constraints
- Must defend design decisions

RULE:
No shared responsibility → avoids shallow work

----------------------------------------------------------------

5. ADD FAILURE-FIRST THINKING

Every agent MUST include:

“What will break first?”

Mandatory section:

FAILURE ANALYSIS:
- First bottleneck
- First scaling issue
- First security risk

If missing → output invalid

----------------------------------------------------------------

6. ADD NUMERIC THINKING

Force concrete reasoning:

BAD:
“Improves performance”

GOOD:
“Reduces 3 RPC calls → 1 call (~300ms → ~90ms)”

RULE:
Every optimization must include:
- Before
- After
- Why improvement happens

----------------------------------------------------------------

7. ADD CONSTRAINTS LAYER

Every solution must define:

- Latency target (ms)
- Scale target (users / requests)
- Cost awareness
- Throughput expectations

Without constraints → design is invalid

----------------------------------------------------------------

8. ADD BUILD VS RESEARCH SEPARATION

Two modes:

RESEARCH MODE:
- Explore possibilities
- Compare systems

BUILD MODE:
- Make decisions
- No ambiguity
- No “could be”

RULE:
Do not mix both modes

----------------------------------------------------------------

9. ADD REALITY CHECK

Before finalizing:

Ask:
- Can this run today?
- Are tools real?
- Is infra available?

Reject:
- Hypothetical systems
- Non-existent tooling

----------------------------------------------------------------

10. ADD “WHY DEPTH” ENFORCEMENT

Every decision must pass 3 layers:

WHY 1 → Why this approach?
WHY 2 → Why not alternatives?
WHY 3 → Why is this optimal under constraints?

If not → shallow thinking → reject

----------------------------------------------------------------

11. ADD OUTPUT PRESSURE

Agents must:

- Be concise but dense
- Avoid filler text
- Prefer structure over paragraphs
- Use step-by-step flows

----------------------------------------------------------------

12. FINAL ACCEPTANCE RULE

Output is valid only if:

- Critic approves
- Tradeoffs are explicit
- Failure cases covered
- Constraints defined
- Decisions justified

Otherwise → iterate again

================================================================