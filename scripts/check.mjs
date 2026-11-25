// Guardrail checks for Off The Block. Run with: npm run check
// Catches broken links/images, invalid JSON, and leaked secrets before anything is saved.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const problems = []

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.git', 'www', 'build', 'Pods', 'DerivedData', 'public'].includes(name)) continue
    const p = join(dir, name)
    statSync(p).isDirectory() ? walk(p, out) : out.push(p)
  }
  return out
}
const files = walk(root)
const rel = p => relative(root, p)

// 1. Every local link, image and script in src/*.html must exist.
for (const f of files.filter(f => f.startsWith(join(root, 'src')) && f.endsWith('.html'))) {
  const html = readFileSync(f, 'utf8')
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(url)) continue
    const target = resolve(dirname(f), url.split(/[?#]/)[0])
    if (!existsSync(target)) problems.push(`${rel(f)}: broken link or file "${url}"`)
  }
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${rel(f)}: missing <title>`)
  for (const [img] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(img)) problems.push(`${rel(f)}: image without alt text: ${img.slice(0, 60)}`)
  }
}

// 2. JSON files must parse.
for (const f of files.filter(f => f.endsWith('.json'))) {
  try { JSON.parse(readFileSync(f, 'utf8')) } catch (e) { problems.push(`${rel(f)}: invalid JSON (${e.message})`) }
}

// 3. No secrets.
const secretPatterns = [
  [/-----BEGIN (RSA |EC )?PRIVATE KEY-----/, 'private key'],
  [/"type":\s*"service_account"/, 'Google service-account key'],
  [/sk-[A-Za-z0-9]{20,}/, 'secret API key'],
  [/ghp_[A-Za-z0-9]{30,}/, 'GitHub token'],
]
for (const f of files.filter(f => /\.(js|mjs|json|html|css|md|plist|xml|txt|env|yml)$/.test(f) || f.endsWith('.env'))) {
  const text = readFileSync(f, 'utf8')
  for (const [re, what] of secretPatterns) if (re.test(text)) problems.push(`${rel(f)}: looks like a ${what}`)
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) found:\n` + problems.map(p => '  - ' + p).join('\n'))
  process.exit(1)
}
console.log(`✓ All checks passed (${files.length} files looked at).`)
