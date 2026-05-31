const path = require('node:path')
const preset = require('./preset.js')

// Site-flavored preset: role layer + the JetBrains-Mono fontFamily override
// every site needs (next/font writes the actual font into the
// --font-jetbrains-mono CSS var from app/layout.tsx).
const pkgRoot = path.resolve(__dirname, '..')

const fontFamily = {
  sans: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular'],
  mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular'],
}

module.exports = {
  ...preset,
  content: [`${pkgRoot}/ui/src/**/*.{ts,tsx}`],
  theme: {
    ...preset.theme,
    extend: {
      ...preset.theme?.extend,
      fontFamily,
    },
  },
}

// Helper for sites to spread their own content globs without redeclaring
// the pivoshenko.ui source glob. Usage:
//   content: withUiContent(['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'])
module.exports.withUiContent = function withUiContent(siteGlobs) {
  return [...siteGlobs, `${pkgRoot}/ui/src/**/*.{ts,tsx}`]
}
