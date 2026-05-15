const path = require('node:path')
const morok = require('./morok.js')

// Re-export the morok palette preset, augmented with a content glob pointing
// at this package's component sources. Without this, Tailwind's content
// scanner only sees the consuming site's files and prunes every class used
// inside `pivoshenko.ui` components (Footer, Nav, PageShell, Tag, Card, ...).
//
// Use an absolute path derived from this file so the glob resolves correctly
// regardless of where the consuming site's tailwind.config.ts lives or how
// the package is installed (pnpm symlinks via .pnpm store).
const pkgRoot = path.resolve(__dirname, '..')

module.exports = {
  ...morok,
  content: [`${pkgRoot}/ui/src/**/*.{ts,tsx}`],
}
