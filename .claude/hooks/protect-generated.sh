#!/bin/bash
# Blocks edits to generated copies of the website. Edit src/ instead.
path=$(python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))')
case "$path" in
  */off-the-block/www/*|*/ios/App/App/public/*)
    echo "Blocked: $path is a generated copy. Edit the same file in src/ and run npm run sync." >&2
    exit 2 ;;
esac
exit 0
