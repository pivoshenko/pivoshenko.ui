# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Single npm-style package consumed as a **git dependency** by the four `pivoshenko.*` Next.js sites. No npm publish — sites pin a git tag in `package.json`.

## Structure

```
pivoshenko.ui/
  package.json              # name: "pivoshenko.ui" — single package, subpath exports
  biome.json                # repo-level lint/format (self-linting)
  justfile                  # format / lint / install / update / vendor-preset / release
  config/
    biome.json              # exported as 'pivoshenko.ui/biome.json'
    tsconfig.base.json      # exported as 'pivoshenko.ui/tsconfig.base.json'
  tailwind-preset/
    morok.js                # vendored from pivoshenko.theme/morok/dist/tailwind/morok.js
    index.js                # re-export; exported as 'pivoshenko.ui/tailwind-preset'
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
import morok from 'pivoshenko.ui/tailwind-preset'
```

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
just vendor-preset  # copy fresh Tailwind preset from sibling pivoshenko.theme
just release vX.Y.Z # local fallback; prefer the GitHub Actions release workflow
```

## Stack

- Single-package repo (NO pnpm workspace — that pattern doesn't work for git-dep monorepos because pnpm symlinks the whole repo as one package).
- Biome 1.9.4. Self-lints via root `biome.json`.
- Node `>=22`.

## Key conventions

- **One package, one version.** When anything ships, bump `package.json` version and cut a new tag.
- **Tags are immutable.** Never force-push. Cut a new tag for every meaningful change.
- **Releases go through `.github/workflows/release.yml`** (manual `workflow_dispatch`). Validates the version format, ensures the tag is fresh, runs lint, pushes the tag, and creates a GitHub Release with auto-generated notes. `just release` is the local fallback — skips lint.
- **Tailwind preset is vendored.** `tailwind-preset/morok.js` is the source-of-truth artifact consumers see. To refresh: `cd ../pivoshenko.theme && just render`, then `just vendor-preset` here. Then bump version and tag.
- **React components export source TS** (not built JS). Consuming sites build them via Next's transpilation. Add `pivoshenko.ui` to a site's `transpilePackages` in `next.config.ts` once components ship.
- **Peer deps, not deps.** React, Next, `next-themes`, Tailwind are peers — sites bring their own versions. All marked optional so config-only consumers don't trip on missing React.

## When editing the repo

- Bump `package.json` version when shipping a change. Match the git tag exactly (no `v` prefix in `package.json`, `v` prefix in the tag).
- Update the consumer migration in [`me/openspec/changes/shared-frontend-foundation/tasks.md`](../openspec/changes/shared-frontend-foundation/tasks.md) when new artifacts land.

## Cross-cutting context

See `me/CLAUDE.md` for the four-site layout and [the shared-frontend-foundation OpenSpec change](../openspec/changes/shared-frontend-foundation/) for the full pipeline rationale.
