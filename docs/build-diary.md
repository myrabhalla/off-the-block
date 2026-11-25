# Build Diary

A plain-English record of what we built and why. Newest at the top.

## 25 Nov 2026: The agentic system
Myra "hired" a Chief of Staff for the project. We added:
- **CLAUDE.md**, the project brain, read at the start of every session.
- **Five specialist agents:** builder, reviewer, content-safety, privacy-guard and release-manager.
- **Five workflows:** build a feature, release, what's next, retro, and log a learning.
- **Guardrails:** automatic checks (`npm run check`), checks on GitHub, a block on editing generated copies,
  a block on ending a session with unsaved work, and extra "never do this" rules.
- **These diaries.**
Agentic score went from 2/10 to about 8.5/10.

## 25 Nov 2026: Progress bars
Added always-visible progress bars in Claude Code for the app launch, the PP report and MoreThanSport.

## 21 Oct 2026: The website becomes an app
Wrapped the website as an iPhone app with Capacitor (the "picture frame"). Moved the website into `src/`,
and a GitHub robot now publishes it live on every save.

## Jul–Aug 2026: The website
Built the six-page website (home, training, competition, nutrients, log, community) with hand-painted
illustrations, as the digital twin of the book. It was delivered for the Personal Project deadline.
