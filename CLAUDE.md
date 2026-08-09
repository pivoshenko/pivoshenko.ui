# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Single npm-style package consumed as a **git dependency** by the four `pivoshenko.*` Next.js sites. Nothing is published to npm; sites pin a git tag in `package.json`.

## Structure

```
pivoshenko.ui/
  package.json              # name: "pivoshenko.ui"; single package, subpath exports
  biome.json                # repo-level lint/format (self-linting)
  justfile                  # install / format / lint / check / update / vendor-preset / release
  config/
    biome.json              # exported as 'pivoshenko.ui/biome.json'
    tsconfig.base.json      # exported as 'pivoshenko.ui/tsconfig.base.json'
  tailwind-preset/
    preset.js               # vendored role-layer preset (flavor-agnostic; references CSS vars only)
    index.js                # base preset; exported as 'pivoshenko.ui/tailwind-preset'
    site.js                 # preset + JetBrains-Mono fontFamily + withUiContent helper; 'pivoshenko.ui/tailwind-preset/site'
  postcss.config.mjs        # shared PostCSS config; 'pivoshenko.ui/postcss.config.mjs'
  ui/
    tokens.css              # CSS vars scoped to :root; the vendored palette IS the active palette
    palette.ts              # same palette as raw hex; used by edge-runtime renderers: favicon (next/icon), OG image (next/opengraph-image), Next themeColor (CSS vars don't reach edge runtime)
    globals.css             # @imports tokens.css; exposes role-based helper classes
    src/index.ts            # React components; exported as 'pivoshenko.ui' (main)
    next/
      icon.tsx              # shared favicon ImageResponse; 'pivoshenko.ui/next/icon'
      opengraph-image.tsx   # createOgImage({brand,title,subtitle,domain}); 'pivoshenko.ui/next/opengraph-image'
      config.ts             # baseNextConfig; 'pivoshenko.ui/next/config'
      site-layout.tsx       # <SiteLayout> + siteMetadata() + siteViewport; 'pivoshenko.ui/next/site-layout'
```

## Consumption

```jsonc
// site's package.json
"dependencies": {
  "pivoshenko.ui": "github:pivoshenko/pivoshenko.ui#vX.Y.Z"
}
```

```ts
// tailwind.config.ts
import preset from 'pivoshenko.ui/tailwind-preset'
```

The preset is **flavor-agnostic**: it references CSS variables (`rgb(var(--bg-canvas) / <alpha-value>)` etc.) emitted by `ui/tokens.css`, which is `@import`ed from `pivoshenko.ui/globals.css`. The vendored tokens.css scopes its `--*` definitions to `:root`, so whichever flavor was vendored is the active one, and consumers need no `data-flavor` attribute. To switch flavor, re-run `just vendor-preset <flavor>` and update `ui/palette.ts` to match. Sites don't change at all.

```json
// biome.json: must use a relative path, Biome 1.x doesn't resolve npm-style names
{ "extends": ["./node_modules/pivoshenko.ui/config/biome.json"] }
```

```json
// tsconfig.json
{ "extends": "pivoshenko.ui/tsconfig.base.json" }
```

## Commands

```bash
just install        # pnpm install
just format         # biome write
just lint           # biome check
just check          # full gate (alias for lint, no build step)
just update         # pnpm update -r
just audit          # pnpm audit (gate against transitive CVEs)
just vendor-preset  # copy fresh Tailwind preset from sibling pivoshenko.theme
just release vX.Y.Z # local fallback; prefer the GitHub Actions release workflow
```

## Stack

- Single-package repo (NO pnpm workspace, because that pattern doesn't work for git-dep monorepos: pnpm symlinks the whole repo as one package). `pnpm-workspace.yaml` exists only to hold pnpm-10 settings (`ignoredBuiltDependencies`, `overrides`); it does NOT declare a `packages:` workspace.
- Biome 1.9.4. Self-lints via root `biome.json`.
- Node `>=22`.

## Key Conventions

- One package, one version. When anything ships, bump the `package.json` version and cut a new tag.
- Tags are immutable. Never force-push. Cut a new tag for every meaningful change.
- Releases go through `.github/workflows/release.yml` (manual `workflow_dispatch`). It validates the version format, ensures the tag is fresh, runs lint, pushes the tag, and creates a GitHub Release with auto-generated notes. `just release` is the local fallback and skips lint.
- The Tailwind preset and tokens are vendored. `tailwind-preset/preset.js` (role layer, flavor-agnostic), `ui/tokens.css` (CSS vars at `:root`), and `ui/palette.ts` (same values as raw hex for off-DOM rendering) are the source-of-truth artifacts consumers see. To refresh: `cd ../pivoshenko.theme && just render`, then `just vendor-preset [flavor]` here (defaults to `popil`). Then update `ui/palette.ts` to match, bump version, tag.
- React components export source TS, not built JS. Consuming sites build them via Next's transpilation. Add `pivoshenko.ui` to a site's `transpilePackages` in `next.config.ts` once components ship.
- React, Next, `@vercel/analytics`, and Tailwind are optional peer deps, so sites bring their own versions and config-only consumers don't trip on missing React. The one runtime dependency is `lucide-react` (icons used by `inputs`/`footer`/`scroll-to-top`), pulled transitively into sites with no consumer install needed.
- Transitive CVE overrides live in `pnpm-workspace.yaml` under `overrides:` (pnpm 10 moved them out of `package.json`). Current pin: `postcss@<8.5.10 -> >=8.5.10` to patch GHSA-qx2v-qp2m-jg93 leaking via `next`'s bundled postcss. Re-evaluate (and drop) when the bundled version moves past the floor.

## When Editing the Repo

- Bump `package.json` version when shipping a change. Match the git tag exactly (no `v` prefix in `package.json`, `v` prefix in the tag).
- When new shared artifacts land, bump the `pivoshenko.ui` tag in all four consumer sites.
