# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Shared frontend packages for the four `pivoshenko.*` Next.js sites. Distributed via git tags, never npm. Each site pins a tag in its `package.json`.

## Structure

```
pivoshenko.ui/
  pnpm-workspace.yaml       # packages/*
  package.json              # private workspace root
  biome.json                # repo-level lint/format
  justfile                  # format / lint / install / update / vendor-preset / release
  packages/
    config/                 # @pivoshenko/config — biome.json + tsconfig.base.json
    tailwind-preset/        # @pivoshenko/tailwind-preset — morok.js (vendored) + index.js re-export
    ui/                     # @pivoshenko/ui — React components + globals.css
```

## Commands

```bash
just install        # pnpm install at workspace root
just format         # biome write
just lint           # biome check (lint + format check)
just vendor-preset  # copy fresh Tailwind preset from sibling pivoshenko.theme
just release vX.Y.Z # tag + push
```

## Stack

- pnpm workspaces (internal only — sites do NOT join this workspace).
- Biome 1.9.4 — single quotes, no semis, trailing commas, 2-space, 80-col.
- `tsconfig.base.json` for sites to extend; no build step here.
- Node `>=22`.

## Key conventions

- **No npm publish.** Distribution is exclusively via git dependency: `github:pivoshenko/pivoshenko.ui#vX.Y.Z`.
- **Tags are immutable.** Never force-push. Cut a new tag for every meaningful change.
- **Tailwind preset is vendored.** `packages/tailwind-preset/morok.js` is the source-of-truth artifact consumers see. To refresh: `cd ../pivoshenko.theme && just render`, then `just vendor-preset` here. Then bump `packages/tailwind-preset/package.json` and tag.
- **`@pivoshenko/ui` exports source TS** (not built JS). Consuming sites build it via Next's transpilation. Add new packages to the site's `transpilePackages` in `next.config.ts` if needed.
- **Peer deps, not dependencies.** React, Next, `next-themes`, Tailwind are peers — sites bring their own versions.
- **biome.json files coexist.** The root `biome.json` lints this repo. `packages/config/biome.json` is the artifact sites extend. Keep them aligned manually for now.

## When editing packages

- Bump the affected `packages/<name>/package.json` version when shipping a change. Match the git tag exactly (no `v` prefix in `package.json`, `v` prefix in the tag).
- Update the consumer migration in [`me/openspec/changes/shared-frontend-foundation/tasks.md`](../openspec/changes/shared-frontend-foundation/tasks.md) if new packages or behaviors land.

## Cross-cutting context

See `me/CLAUDE.md` for the four-site layout and [the shared-frontend-foundation OpenSpec change](../openspec/changes/shared-frontend-foundation/) for the full pipeline rationale.
