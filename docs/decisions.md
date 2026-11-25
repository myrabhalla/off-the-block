# Decisions

The big choices, what else we considered, and why. Newest at the top.

## 25 Nov 2026: One Chief of Staff plus specialist agents
- **Chose:** a single main assistant Myra talks to, which hires specialist agents.
- **Instead of:** Myra directing every task herself.
- **Why:** she wants to learn agentic workflows and spend her time on ideas and feedback, not process.

## 25 Nov 2026: Automatic checks before every save
- **Chose:** a small home-made check script, also run on GitHub.
- **Instead of:** heavy testing tools.
- **Why:** the site is plain HTML. Broken links, missing images and leaked secrets are the real risks.

## 21 Oct 2026: Capacitor to make the app
- **Chose:** Capacitor, which wraps the existing website as an app.
- **Instead of:** rebuilding in Swift or Flutter.
- **Why:** one website feeds the web, iPhone and Android, so every website change becomes an app update.

## 21 Oct 2026: Firebase Analytics at launch
- **Chose:** Firebase Analytics with ad-ID collection off and minimal events.
- **Why:** Myra needs to see what people use, and the users are minors, so we collect only the minimum.

## Jul 2026: No server (yet)
- **Chose:** a static site, with the log and community stored on each device.
- **Why:** it's free and simple, with nothing to break or secure. Revisit if people need to see each other's posts.
