#!/bin/bash
# Stops a session from ending with work that isn't saved to GitHub.
input=$(cat)
active=$(echo "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("stop_hook_active", False))')
[ "$active" = "True" ] && exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0
dirty=$(git status --porcelain 2>/dev/null)
ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo 0)
if [ -n "$dirty" ] || [ "$ahead" != "0" ]; then
  echo '{"decision":"block","reason":"There is unsaved work in Off The Block. If it is a finished, working change: run npm run check, then save it to GitHub (commit with a plain-English message and push). If it is half-done on purpose, tell Myra in one line what is unsaved and why."}'
fi
exit 0
