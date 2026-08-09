const path = require('node:path')
const preset = require('./preset.js')

// Re-export the role-layer preset with a content glob pointing at this
// package's component sources. Without it, Tailwind's content scanner only
// sees the consuming site's files and prunes every class used inside
// `pivoshenko.ui` components.
//
// The path is absolute and derived from this file, so the glob resolves no
// matter where the site's tailwind.config.ts lives or how the package was
// installed (pnpm symlinks via the .pnpm store)
const pkgRoot = path.resolve(__dirname, '..')

module.exports = {
  ...preset,
  content: [`${pkgRoot}/ui/src/**/*.{ts,tsx}`],
}
