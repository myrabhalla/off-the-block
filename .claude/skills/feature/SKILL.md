---
name: feature
description: Build a new feature or change for Off The Block end to end — plan, build, review, safety/privacy checks, show Myra, save. Use when Myra says "build…", "add…", "change…" or runs /feature.
---

# Feature workflow

1. **Understand.** Restate what Myra wants in one plain sentence. Ask only if it's genuinely ambiguous.
2. **Plan.** List the files to touch and how you'll know it works. Small change: just do it.
   Bigger change: tell Myra the plan in two or three lines first.
3. **Build.** Hire the `builder` agent with a precise brief (goal, files, house style, acceptance checks).
4. **Review.** Hire `reviewer` on the result. Add `content-safety` if health wording changed, and
   `privacy-guard` if data or analytics changed. Fix everything flagged, then re-review if the fixes were big.
5. **Show.** Open the changed page for Myra (`open src/<page>.html`) and explain the change in two lines, ELI5.
6. **Record.** Add a CHANGELOG "Unreleased" line, a `docs/build-diary.md` entry, a `docs/decisions.md` entry if a real
   choice was made, and tick the progress bar if a step finished.
7. **Save.** `npm run check`, then save to GitHub with a plain-English message. Tell Myra "saved".
