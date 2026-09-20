# pivoshenko.ui

<p align="left">
  <a href="https://stand-with-ukraine.pp.ua/">
    <img alt="StandWithUkraine" src="https://img.shields.io/badge/Support-Ukraine-FFC93C?style=flat-square&labelColor=07689F">
  </a>
</p>

## Overview

Shared frontend artifacts (Biome config, TypeScript base, Tailwind preset, React components) for the `pivoshenko.*` sites: `pivoshenko.dev`, `pivoshenko.startpage`, `pivoshenko.wallpapers`, `pivoshenko.ai/site`. Consumed as a single git dependency pinned by tag. Nothing is published to npm.

## Subpaths

| Import path                            | What it is                                                          |
| -------------------------------------- | ------------------------------------------------------------------- |
| `pivoshenko.ui`                        | React components (Nav, Footer, PageShell, Hero, Contours, Pixels, Chunks, Card, ...) |
| `pivoshenko.ui/biome.json`             | Shared Biome config                                                  |
| `pivoshenko.ui/tsconfig.base.json`     | Shared TypeScript base                                               |
| `pivoshenko.ui/postcss.config.mjs`     | Shared PostCSS config                                                |
| `pivoshenko.ui/tailwind-preset`        | Tailwind preset (role layer plus the design-system scales)           |
| `pivoshenko.ui/tailwind-preset/site`   | Preset plus the two `next/font` families and the `withUiContent` helper |
| `pivoshenko.ui/globals.css`            | Token CSS vars and the role-based helper classes                     |
| `pivoshenko.ui/next/site-layout`       | `SiteLayout`, `siteMetadata()`, `siteViewport`                       |
| `pivoshenko.ui/next/config`            | `baseNextConfig`                                                     |
| `pivoshenko.ui/next/icon`              | Shared favicon `ImageResponse`                                       |
| `pivoshenko.ui/next/opengraph-image`   | `createOgImage({ brand, title, subtitle, domain, accent })`          |

## Design System

The components are a native React + Tailwind implementation of the `Pivoshenko` design system: a warm
off-black surface ramp from [`pivoshenko.theme`](https://github.com/pivoshenko/pivoshenko.theme), JetBrains
Mono for text and Martian Mono for display, lucide icons throughout (never a text glyph), and an animated
field behind the hero and the footer - topographic contours by default, a quantized pixel mosaic, a
carved mosaic of chunks, a dot-matrix grid of ASCII glyphs thickening with the field under them, or a
dense stack of travelling wave crests beating into moire bands.

Every `accent` utility resolves through one live CSS variable, so a site picks its accent in one place and
every component follows. The field is the same kind of one-place choice:

```tsx
<SiteLayout brand="pivoshenko.ai" accent="peach" field="pixels">
```

Any named palette slot works - `peach`, `blue`, `teal`, `mauve`, and the rest of the 14. A subtree can
override it with a plain `data-accent` attribute.

`CLAUDE.md` documents the full token and helper-class vocabulary; point at it rather than copying the list.

## Consumption

```jsonc
// site's package.json
"dependencies": {
  "pivoshenko.ui": "github:pivoshenko/pivoshenko.ui#v0.11.0"
}
```

```ts
// tailwind.config.ts
import preset from 'pivoshenko.ui/tailwind-preset'

export default { presets: [preset], content: [...] }
```

```json
// tsconfig.json
{ "extends": "pivoshenko.ui/tsconfig.base.json" }
```

```json
// biome.json: Biome 1.x doesn't resolve npm names, so use a relative node_modules path
{ "extends": ["./node_modules/pivoshenko.ui/config/biome.json"] }
```

### Local Development Override

Point a site at your local clone via `pnpm.overrides` (do not commit):

```jsonc
"pnpm": {
  "overrides": {
    "pivoshenko.ui": "link:../pivoshenko.ui"
  }
}
```

The link puts the package outside the site's own directory, which Turbopack will not resolve across -
`next build` fails on `Can't resolve 'pivoshenko.ui/postcss.config.mjs'`. Widen the root for as long as
the override is in place (also not committed):

```ts
// site's next.config.ts
export default { ...baseNextConfig, turbopack: { root: join(process.cwd(), '..', '..') } }
```
