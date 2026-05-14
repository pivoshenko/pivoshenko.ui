# pivoshenko.ui

<p align="left">
  <a href="https://stand-with-ukraine.pp.ua/">
    <img alt="StandWithUkraine" src="https://img.shields.io/badge/Support-Ukraine-FFC93C?style=flat-square&labelColor=07689F">
  </a>
</p>

## Overview

Shared frontend packages for the `pivoshenko.*` sites (`pivoshenko.dev`, `pivoshenko.startpage`, `pivoshenko.wallpapers`, `pivoshenko.ai/site`). Consumed as git dependencies pinned by tag — no npm publish.

## Packages

- [`@pivoshenko/config`](./packages/config) — `biome.json`, `tsconfig.base.json`.
- [`@pivoshenko/tailwind-preset`](./packages/tailwind-preset) — Tailwind preset vendored from [`pivoshenko.theme`](https://github.com/pivoshenko/pivoshenko.theme)'s `morok/dist/tailwind/morok.js`.
- [`@pivoshenko/ui`](./packages/ui) — React components (`Footer`, `Nav`, `ThemeToggle`, `RootLayoutShell`) and shared `globals.css`.

## Consumption

```jsonc
// site's package.json
"dependencies": {
  "@pivoshenko/ui":              "github:pivoshenko/pivoshenko.ui#v0.1.0",
  "@pivoshenko/config":          "github:pivoshenko/pivoshenko.ui#v0.1.0",
  "@pivoshenko/tailwind-preset": "github:pivoshenko/pivoshenko.ui#v0.1.0"
}
```

### Local development override

Point a site at your local clone via `pnpm.overrides` (do not commit):

```jsonc
"pnpm": {
  "overrides": {
    "@pivoshenko/ui":              "link:../pivoshenko.ui/packages/ui",
    "@pivoshenko/config":          "link:../pivoshenko.ui/packages/config",
    "@pivoshenko/tailwind-preset": "link:../pivoshenko.ui/packages/tailwind-preset"
  }
}
```

## Releases

```bash
git tag vX.Y.Z
git push --tags
```

Tags are immutable. Bump pins in each consuming site's `package.json` after a release.

## Workflow

```bash
just install
just format
just lint
```
