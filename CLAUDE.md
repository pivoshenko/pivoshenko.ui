# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Single npm-style package consumed as a **git dependency** by the four `pivoshenko.*` Next.js sites. No npm publish — sites pin a git tag in `package.json`.

## Structure

```
pivoshenko.ui/
  package.json              # name: "pivoshenko.ui" — single package, subpath exports
  biome.json                # repo-level lint/format (self-linting)
  justfile                  # install / format / lint / check / update / vendor-preset / release
  config/
    biome.json              # exported as 'pivoshenko.ui/biome.json'
    tsconfig.base.json      # exported as 'pivoshenko.ui/tsconfig.base.json'
  tailwind-preset/
    preset.js               # vendored role-layer preset (flavor-agnostic — references CSS vars only)
    index.js                # base preset; exported as 'pivoshenko.ui/tailwind-preset'
    site.js                 # preset + JetBrains-Mono fontFamily + withUiContent helper; 'pivoshenko.ui/tailwind-preset/site'
  postcss.config.mjs        # shared PostCSS config; 'pivoshenko.ui/postcss.config.mjs'
  ui/
    tokens.css              # CSS vars scoped to :root — the vendored palette IS the active palette
    palette.ts              # same palette as raw hex; used by OG image + Next themeColor (CSS vars don't reach edge runtime)
    globals.css             # @imports tokens.css; exposes role-based helper classes
    next/
      icon.tsx              # shared favicon ImageResponse; 'pivoshenko.ui/next/icon'
      opengraph-image.tsx   # createOgImage({brand,title,subtitle,domain}); 'pivoshenko.ui/next/opengraph-image'
      config.ts             # baseNextConfig; 'pivoshenko.ui/next/config'
      site-layout.tsx       # <SiteLayout> + siteMetadata() + siteViewport; 'pivoshenko.ui/next/site-layout'
  ui/
    src/index.ts            # React components — exported as 'pivoshenko.ui' (main)
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

The preset is **flavor-agnostic** — it references CSS variables (`rgb(var(--bg-canvas) / <alpha-value>)` etc.) emitted by `ui/tokens.css`, which is `@import`ed from `pivoshenko.ui/globals.css`. The vendored tokens.css scopes its `--*` definitions to `:root`, so whichever flavor was vendored is the active one — no `data-flavor` attribute needed on consumers. Switching flavor: re-run `just vendor-preset <flavor>` (and update `ui/palette.ts` to match) — sites don't change at all.

```json
// biome.json — must use a relative path; Biome 1.x doesn't resolve npm-style names
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
just check          # full gate (alias for lint — no build step)
just update         # pnpm update -r
just audit          # pnpm audit (gate against transitive CVEs)
just vendor-preset  # copy fresh Tailwind preset from sibling pivoshenko.theme
just release vX.Y.Z # local fallback; prefer the GitHub Actions release workflow
```

## Stack

- Single-package repo (NO pnpm workspace — that pattern doesn't work for git-dep monorepos because pnpm symlinks the whole repo as one package). `pnpm-workspace.yaml` exists only to hold pnpm-10 settings (`ignoredBuiltDependencies`, `overrides`); it does NOT declare a `packages:` workspace.
- Biome 1.9.4. Self-lints via root `biome.json`.
- Node `>=22`.

## Key conventions

- **One package, one version.** When anything ships, bump `package.json` version and cut a new tag.
- **Tags are immutable.** Never force-push. Cut a new tag for every meaningful change.
- **Releases go through `.github/workflows/release.yml`** (manual `workflow_dispatch`). Validates the version format, ensures the tag is fresh, runs lint, pushes the tag, and creates a GitHub Release with auto-generated notes. `just release` is the local fallback — skips lint.
- **Tailwind preset + tokens are vendored.** `tailwind-preset/preset.js` (role layer, flavor-agnostic), `ui/tokens.css` (CSS vars at `:root`), and `ui/palette.ts` (same values as raw hex for off-DOM rendering) are the source-of-truth artifacts consumers see. To refresh: `cd ../pivoshenko.theme && just render`, then `just vendor-preset [flavor]` here (defaults to `popil`). Then update `ui/palette.ts` to match, bump version, tag.
- **React components export source TS** (not built JS). Consuming sites build them via Next's transpilation. Add `pivoshenko.ui` to a site's `transpilePackages` in `next.config.ts` once components ship.
- **Peer deps, not deps.** React, Next, Tailwind are peers — sites bring their own versions. All marked optional so config-only consumers don't trip on missing React.
- **Transitive CVE overrides live in `pnpm-workspace.yaml` `overrides:`** (pnpm 10 moved them out of `package.json`). Current pin: `postcss@<8.5.10 → >=8.5.10` to patch GHSA-qx2v-qp2m-jg93 leaking via `next`'s bundled postcss. Re-evaluate (and drop) when the bundled version moves past the floor.

## When editing the repo

- Bump `package.json` version when shipping a change. Match the git tag exactly (no `v` prefix in `package.json`, `v` prefix in the tag).
- When new shared artifacts land, bump the `pivoshenko.ui` tag in all four consumer sites.

## Cross-cutting context

See `me/CLAUDE.md` for the four-site layout and the shared-UI pipeline rationale.
