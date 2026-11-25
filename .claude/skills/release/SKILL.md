---
name: release
description: Ship a new version of the Off The Block app. Use when Myra says "release", "ship it", "new version" or runs /release.
---

# Release workflow

1. Hire the `release-manager` agent. It runs the full checklist in `.claude/agents/release-manager.md`.
2. If anything about data, analytics or permissions changed since the last release, hire `privacy-guard` too.
3. Read its report. If it's all green, save to GitHub and tag the version.
4. Open Xcode for Myra (`npm run ios`) and give her the test checklist **one item at a time**.
5. Only after she says it looks right, and with her explicit go-ahead, walk her through uploading to the store.
6. Log it in `docs/build-diary.md`, tick the progress bar, and tell Myra what version just shipped, in one line.
