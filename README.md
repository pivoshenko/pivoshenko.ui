# pivoshenko.ui

<p align="left">
  <a href="https://stand-with-ukraine.pp.ua/">
    <img alt="StandWithUkraine" src="https://img.shields.io/badge/Support-Ukraine-FFC93C?style=flat-square&labelColor=07689F">
  </a>
</p>

## Overview

Shared frontend artifacts (Biome config, TypeScript base, Tailwind preset, React components) for the `pivoshenko.*` sites (`pivoshenko.dev`, `pivoshenko.startpage`, `pivoshenko.wallpapers`, `pivoshenko.ai/site`). Consumed as a single git dependency pinned by tag — no npm publish.

## Subpaths

| Import path                              | What it is                                        |
| ---------------------------------------- | ------------------------------------------------- |
| `pivoshenko.ui/biome.json`               | Shared Biome config                               |
| `pivoshenko.ui/tsconfig.base.json`       | Shared TypeScript base                            |
| `pivoshenko.ui/tailwind-preset`          | Tailwind preset (morok palette + dark mode class) |
| `pivoshenko.ui`                          | React components (Footer, Nav, ThemeToggle, …)    |

## Consumption

```jsonc
// site's package.json
"dependencies": {
  "pivoshenko.ui": "github:pivoshenko/pivoshenko.ui#v0.2.0"
}
```

```ts
// tailwind.config.ts
import morok from 'pivoshenko.ui/tailwind-preset'

export default { presets: [morok], content: [...] }
```

```json
// tsconfig.json
{ "extends": "pivoshenko.ui/tsconfig.base.json" }
```

```json
// biome.json — Biome 1.x doesn't resolve npm names; use relative node_modules path
{ "extends": ["./node_modules/pivoshenko.ui/config/biome.json"] }
```

### Local development override

Point a site at your local clone via `pnpm.overrides` (do not commit):

```jsonc
"pnpm": {
  "overrides": {
    "pivoshenko.ui": "link:../pivoshenko.ui"
  }
}
```
