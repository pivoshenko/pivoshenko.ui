const path = require('node:path')
const system = require('./system.js')

// Site-flavored preset: the design system plus the two font overrides every
// site needs. next/font writes the actual faces into --font-jetbrains-mono and
// --font-martian-mono from app/layout.tsx, via SiteLayout
const pkgRoot = path.resolve(__dirname, '..')

const fontFamily = {
  sans: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular'],
  mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular'],
  display: [
    'var(--font-martian-mono)',
    'var(--font-jetbrains-mono)',
    'ui-monospace',
    'SFMono-Regular',
  ],
}

module.exports = {
  ...system,
  content: [`${pkgRoot}/ui/src/**/*.{ts,tsx}`],
  theme: {
    ...system.theme,
    extend: {
      ...system.theme.extend,
      fontFamily,
    },
  },
}

// Lets sites spread their own content globs without redeclaring the
// pivoshenko.ui source glob:
//   content: withUiContent(['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'])
module.exports.withUiContent = function withUiContent(siteGlobs) {
  return [...siteGlobs, `${pkgRoot}/ui/src/**/*.{ts,tsx}`]
}
