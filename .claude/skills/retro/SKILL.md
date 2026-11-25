---
name: retro
description: Look back on recent work and improve how the system runs. Use when Myra says "let's review", "retro", "how are we doing", or after a release or every couple of weeks.
---

# Retro: getting better over time

1. Read `docs/build-diary.md` since the last retro, `git log` since then, and any feedback Myra gave.
2. Write a short entry in `docs/build-diary.md` under "Retro — <date>" with three parts: **Went well**,
   **Went badly / slowed us down**, and **Changing**.
3. For each "Changing" item, actually change the system: edit `CLAUDE.md` (Lessons, guardrails, workflows),
   an agent file in `.claude/agents/`, a workflow in `.claude/skills/`, or `scripts/check.mjs`.
4. Tell Myra in three or four lines what you improved. Ask her one question: "Anything that annoyed you?"
5. Save to GitHub.
