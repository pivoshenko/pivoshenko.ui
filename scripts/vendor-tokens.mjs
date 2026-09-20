// Generates ui/tokens.css and ui/palette.ts from a sibling ../pivoshenko.theme
// checkout.
//
// Two of the theme's outputs are merged: `css-vars/<flavor>.css` carries the 26
// named palette colors as hex, `tokens/<flavor>.css` carries the semantic role
// layer as R G B triples. Everything is emitted as triples so Tailwind can
// compose it with <alpha-value>.
//
// palette.ts is the same palette in raw hex, for the contexts CSS variables
// cannot reach: edge-runtime ImageResponse rendering and the themeColor meta
// tag. It is generated from the same inputs so the two cannot drift.
//
// Usage: node scripts/vendor-tokens.mjs <flavor> [themeRoot]

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const [flavor = 'popil', themeRoot = '../pivoshenko.theme'] =
  process.argv.slice(2)

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(pkgRoot, themeRoot, 'themes/dist')

const triple = (hex) => {
  const v = hex.replace('#', '')
  return [0, 2, 4].map((i) => Number.parseInt(v.slice(i, i + 2), 16)).join(' ')
}

// Named palette: --popil-peach: #e48d66 -> --peach: 228 141 102
const named = [
  ...readFileSync(join(dist, 'css-vars', `${flavor}.css`), 'utf8').matchAll(
    new RegExp(`--${flavor}-([a-z0-9]+):\\s*(#[0-9a-f]{6});`, 'g'),
  ),
].map(([, name, hex]) => [name, triple(hex)])

// Role layer: reuse the theme's own triples and comment headings verbatim,
// dropping only the [data-flavor] wrapper
const roles = readFileSync(join(dist, 'tokens', `${flavor}.css`), 'utf8')
  .replace(/^[^{]*\{\n/, '')
  .replace(/\}\s*$/, '')
  .trimEnd()

// Any named color can drive --accent on a subtree, the way the agents.fleet
// page does: <html data-accent="peach">. --accent-info is retargeted the same
// way, so a site can pick the secondary colour its sub-headings, info tags,
// badges and callouts take without a local CSS override
const hexTriple = (slot) => Object.fromEntries(named)[slot]

const accents = named
  .map(([name]) => name)
  .filter((n) => !/^(text|subtext|overlay|surface|base|mantle|crust)/.test(n))

const out = `/* Semantic design tokens (role layer) plus the named palette behind it.
 * Values are space-separated R G B triples for use with
 * rgb(var(--token) / <alpha-value>) in Tailwind / shadcn-style configs.
 * Scoped to \`:root\`, so the vendored palette IS the active palette.
 * Regenerate via \`just vendor-theme-preset\` in pivoshenko.ui.
 */
:root {
  /* Palette */
${named.map(([name, rgb]) => `  --${name}: ${rgb};`).join('\n')}

${roles}

  /* Active accent. Any subtree can retarget it with data-accent */
  --accent: var(--accent-primary);

  /* Readable foreground on an accent fill */
  --on-accent: ${hexTriple('base')};

  /* Translucent, so it cannot be a triple Tailwind composes an alpha onto */
  --scrim: rgb(${hexTriple('crust')} / 0.72);
}

${accents.map((n) => `[data-accent='${n}'] {\n  --accent: var(--${n});\n}`).join('\n\n')}

${accents.map((n) => `[data-sub-accent='${n}'] {\n  --accent-info: var(--${n});\n}`).join('\n\n')}
`

writeFileSync(join(pkgRoot, 'ui/tokens.css'), out)

const hex = Object.fromEntries(
  [
    ...readFileSync(join(dist, 'css-vars', `${flavor}.css`), 'utf8').matchAll(
      new RegExp(`--${flavor}-([a-z0-9]+):\\s*(#[0-9a-f]{6});`, 'g'),
    ),
  ].map(([, name, value]) => [name, value]),
)

// The role layer names a palette slot per role; resolve those names to hex
const rolesJson = JSON.parse(
  readFileSync(
    resolve(pkgRoot, themeRoot, 'themes/palettes', `${flavor}.json`),
    'utf8',
  ),
).roles

const group = (name) =>
  Object.entries(rolesJson[name])
    .map(([role, slot]) => `    ${role}: '${hex[slot]}',`)
    .join('\n')

const palette = `// Active palette in raw hex. The source of truth is \`ui/tokens.css\` (CSS
// variables consumed by the Tailwind preset); this module mirrors those values
// for contexts CSS variables don't reach, such as edge-runtime OG images
// (rendered to PNG via @vercel/og) and the Next \`themeColor\` meta tag.
//
// Generated alongside \`ui/tokens.css\` by \`just vendor-theme-preset\`. Hand
// edits are erased by the next vendor run.
export const palette = {
${['bg', 'fg', 'border', 'accent'].map((g) => `  ${g}: {\n${group(g)}\n  },`).join('\n')}

  // The named slots behind the roles, for picking a site accent
  named: {
${Object.entries(hex)
  .map(([name, value]) => `    ${name}: '${value}',`)
  .join('\n')}
  },
} as const

// Exactly the slots \`ui/tokens.css\` emits a \`[data-accent]\` rule for, so a
// site cannot name an accent the stylesheet will not honour. The neutrals in
// \`palette.named\` are deliberately absent: \`data-accent=\"text\"\` matched no
// rule and silently left \`--accent\` on its \`accent-primary\` default
export const accentNames = [
${accents.map((n) => `  '${n}',`).join('\n')}
] as const

export type AccentName = (typeof accentNames)[number]
`

writeFileSync(join(pkgRoot, 'ui/palette.ts'), palette)
console.log(`Vendored ${flavor} palette -> ui/tokens.css + ui/palette.ts`)
