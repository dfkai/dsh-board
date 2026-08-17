// Sync the freshly built client bundle into an installed dsh-board copy.
//
// The dev loop: edit src → pnpm build → pnpm sync:webtest → the host's HMR
// stat-poll sees the changed bundle and hot-reloads the browser (no restart,
// no tarball re-install). Only manifest changes need a re-install.
//
// Usage:
//   node scripts/sync.mjs <profile-dir>   e.g. node scripts/sync.mjs ~/.dsh/profiles/webtest

import { copyFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'

const args = process.argv.slice(2).filter(arg => arg !== '--')
const profileDir = resolve(args[0] ?? '')
if (profileDir === '' || !existsSync(profileDir)) {
  console.error('usage: node scripts/sync.mjs <profile-dir>')
  process.exit(2)
}

const requireFromProfile = createRequire(join(profileDir, 'package.json'))
const packageJson = requireFromProfile.resolve('dsh-board/package.json')
const installedDir = dirname(packageJson)
const repoDir = dirname(new URL('../package.json', import.meta.url).pathname)

for (const file of ['index.js', 'client.js', 'client.js.map']) {
  const src = join(repoDir, 'lib', file)
  if (!existsSync(src)) continue
  copyFileSync(src, join(installedDir, 'lib', file))
  console.log(`synced lib/${file} → ${join(installedDir, 'lib', file)}`)
}
