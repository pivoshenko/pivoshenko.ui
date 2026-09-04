# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

`pivoshenko.ui` is the shared frontend package for the four `pivoshenko.*` Next.js sites (`pivoshenko.dev`, `pivoshenko.startpage`, `pivoshenko.wallpapers`, `pivoshenko.ai/site`). It ships a Biome config, a TypeScript base, a PostCSS config, a Tailwind preset, design tokens, and React components.

**Nothing is published to npm.** Sites consume it as a git dependency pinned to a tag:

```jsonc
"dependencies": { "pivoshenko.ui": "github:pivoshenko/pivoshenko.ui#v0.9.4" }
```

**Nothing is built here.** `ui/src/*.tsx` ships as source TypeScript; the consuming site transpiles it (`transpilePackages: ['pivoshenko.ui']`, already set in `baseNextConfig`). There is no `tsconfig.json` in this repo and no typecheck gate — the only code gate is Biome.

## Commands

```bash
just install         # pnpm install
just lint            # biome check .        (CI gate)
just format          # biome check --write .
just check           # alias for lint; there is no build step
just audit           # pnpm audit           (CI gate, blocks on transitive CVEs)
just test            # no-op while the .no-tests sentinel file exists (CI gate)
just update          # pnpm update -r
just vendor-preset [flavor]   # re-vendor tokens + preset from ../pivoshenko.theme (default: popil)
just release vX.Y.Z  # local fallback (git tag + push --tags); prefer the release workflow
```

There are no tests and no test runner — `just test` passes only because the `.no-tests` sentinel exists. Delete that file only when adding a real test command.

CI (`.github/workflows/ci.yaml`) runs `just install → lint → audit → test` on Node 22 with pnpm. Releases go through `.github/workflows/release.yml` (`workflow_dispatch` with a `vX.Y.Z` input): it validates the tag format, refuses an existing tag, runs `pnpm lint`, pushes the tag, and creates a GitHub Release with generated notes.

## Export Surface

Every consumer entry point is a subpath in `package.json#exports`. Adding a new shared artifact means adding an export there **and** making sure its directory is listed in `files`.

| Subpath | File / exports |
| --- | --- |
| `pivoshenko.ui` | `ui/src/index.ts` (React components) |
| `pivoshenko.ui/biome.json` | `config/biome.json` |
| `pivoshenko.ui/tsconfig.base.json` | `config/tsconfig.base.json` |
| `pivoshenko.ui/postcss.config.mjs` | `postcss.config.mjs` |
| `pivoshenko.ui/tailwind-preset` | `tailwind-preset/index.js` |
| `pivoshenko.ui/tailwind-preset/site` | `tailwind-preset/site.js` (+ `withUiContent`) |
| `pivoshenko.ui/globals.css` | `ui/globals.css` |
| `pivoshenko.ui/next/site-layout` | `SiteLayout`, `siteMetadata()`, `siteViewport` |
| `pivoshenko.ui/next/config` | `baseNextConfig` (strict mode, transpile, security headers) |
| `pivoshenko.ui/next/icon` | favicon `ImageResponse` (edge runtime) |
| `pivoshenko.ui/next/opengraph-image` | `createOgImage({brand,title,subtitle,domain})`, `ogSize`, `ogContentType`, `ogRuntime` |

Biome 1.x does not resolve npm-style names in `extends`, so sites must use the relative path: `{ "extends": ["./node_modules/pivoshenko.ui/config/biome.json"] }`.

## Theming Architecture

Three files carry the palette and **must move together**:

- `ui/tokens.css` — CSS vars at `:root` as space-separated `R G B` triples. Vendored.
- `tailwind-preset/preset.js` — maps those vars to Tailwind colors via `rgb(var(--token) / <alpha-value>)`. Vendored; excluded from Biome via the root `biome.json` ignore list.
- `ui/palette.ts` — the same values as raw hex, hand-maintained. Needed because CSS vars don't reach the edge runtime: the favicon, the OG image, and Next's `themeColor` all read from it.

The preset is deliberately **flavor-agnostic** — it only references variable names, so its output is identical for every palette. Because `tokens.css` scopes to `:root` (the justfile rewrites the upstream `[data-flavor="<flavor>"]` selector), the vendored flavor *is* the active flavor and consumers need no `data-flavor` attribute.

To switch or refresh a flavor:

1. render the theme upstream in `../pivoshenko.theme` (its dist outputs feed the vendor step)
2. `just vendor-preset [flavor]` here
3. update `ui/palette.ts` by hand to match the new `ui/tokens.css`
4. bump version, tag

Sites require no changes for a palette swap.

`tailwind-preset/index.js` and `site.js` both inject an absolute content glob at `<pkgRoot>/ui/src/**/*.{ts,tsx}` — without it Tailwind prunes every class used inside these components. `site.js` additionally layers the JetBrains-Mono `fontFamily` (fed by `--font-jetbrains-mono`, which `SiteLayout` sets via `next/font`) and exports `withUiContent(siteGlobs)` so sites can append their own globs without redeclaring the ui glob.

## Component Conventions

`ui/src/` components follow a consistent shape; match it when adding one:

- Props type is a local `type XProps = HTMLAttributes<T> & { ... }`, destructured with `className = ''` and `...rest`, and `className` is appended last so callers can override.
- Styling uses the role-based helper classes from `ui/globals.css` (`fg-primary`, `fg-muted`, `hover-secondary`, `border-ui`, `border-faint`, `type-label`, `type-meta`, ...) plus preset color scales (`bg-bg-surface`, `text-accent-primary`). Do not hardcode hex.
- Server components by default. Only `nav.tsx` and `scroll-to-top.tsx` carry `'use client'` — keep it that way unless a component genuinely needs hooks or `usePathname`.
- Every export must be re-exported from `ui/src/index.ts` (alphabetized, types exported inline as `type X`).

`PageShell` composes `Nav` + `main` + `Footer` + `ScrollToTop`; `SiteLayout` wraps `PageShell` with `<html>`/`<body>`, the JetBrains-Mono font variable, and `<Analytics />` (Vercel).

## Dependencies

- Single package, **no pnpm workspace**. `pnpm-workspace.yaml` exists only to hold pnpm-10 settings (`ignoredBuiltDependencies`, `overrides`) — it intentionally declares no `packages:`, because pnpm symlinks the whole repo as one package for git deps.
- `react`, `react-dom`, `next`, `tailwindcss`, `@vercel/analytics` are **optional** peer deps, so config-only consumers don't trip on missing React.
- `lucide-react` is the one real runtime dependency (icons in `footer`, `inputs`, `scroll-to-top`).
- Transitive CVE overrides live in `pnpm-workspace.yaml` under `overrides:` (pnpm 10 moved them out of `package.json`). Current pins: `postcss@<8.5.10 → >=8.5.10` and `sharp@<0.35.0 → >=0.35.0`. Drop them once the bundled versions clear the floor.

## Release Discipline

- One package, one version. Every shipped change bumps `package.json#version` and cuts a tag.
- `package.json` has no `v` prefix; the git tag does (`0.9.4` ↔ `v0.9.4`).
- Tags are immutable — never force-push a tag; cut a new one.
- After tagging, bump the `pivoshenko.ui` ref in all four consumer sites (the version also appears in the README consumption snippet).

For local iteration against a site without tagging, use a non-committed override in the site's `package.json`:

```jsonc
"pnpm": { "overrides": { "pivoshenko.ui": "link:../pivoshenko.ui" } }
```
