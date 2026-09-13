# CLAUDE.md

`pivoshenko.ui` is the shared frontend layer for the `pivoshenko.*` sites: tool config (Biome, TypeScript base, PostCSS), a Tailwind preset carrying the design-token role layer, a React component library, and Next.js glue - all behind one package name. `README.md` has the subpath table and the consumption snippets; `CONTRIBUTING.md` has the command table, branch naming, and the commit type table (`cliff.toml` adds a non-standard `design` type for visual and layout changes).

`AGENTS.md` is a symlink to this file. If `CLAUDE.md` is missing, `just lint` reports a broken-symlink warning.

## Invariants

- **Never published to npm.** Sites consume it as a git dependency pinned by tag, so a change here is not live until it is tagged **and** each site's `package.json` git ref is bumped
- **No build step.** The `.` export points at `./ui/src/index.ts` - raw TSX, compiled by the consuming site, which is why `baseNextConfig` sets `transpilePackages: ['pivoshenko.ui']`. Do not add a bundler, a `dist/`, or emit-producing `tsc`; `config/tsconfig.base.json` sets `noEmit: true` deliberately
- **No typecheck and no tests.** `just lint` is Biome only - formatting plus lint rules, not type checking. A type error in `ui/**` is caught nowhere in this repo; it surfaces when a consuming site builds
- do not delete `.no-tests` without adding a real test command - `just test` fails hard when the sentinel is gone
- do not add runtime dependencies. `lucide-react` is the only one; anything framework-level goes in `peerDependencies` plus `peerDependenciesMeta.<dep>.optional`, because a consumer pulling only `tsconfig.base.json` must not be forced to install React

### Verifying a Change

No tsconfig here includes `ui/**` (`tsc -p config/tsconfig.base.json` fails with TS18003), so a type check is a one-off invocation:

```bash
./node_modules/.bin/tsc --noEmit --strict --jsx react-jsx --module esnext \
  --moduleResolution bundler --target ES2022 --lib dom,dom.iterable,esnext \
  --esModuleInterop --skipLibCheck ui/src/index.ts
```

The authoritative check is still a consuming site's build: add the `pnpm.overrides` link to the *site's* `package.json` (README, "Local Development Override" - do not commit it) and run `just build` there.

## Generated Files

`just vendor-theme-preset [FLAVOR]` regenerates `tailwind-preset/preset.js` and `ui/tokens.css` from a sibling `../pivoshenko.theme` checkout. Flavors: `popil` (the default), `morok`, `vatra`. Both outputs are generated - hand edits are erased by the next vendor run, and `preset.js` sits in Biome's ignore list for exactly that reason.

The recipe does **not** touch `ui/palette.ts`; it only prints a reminder. A token or flavor change moves these together in one commit:

1. `tailwind-preset/preset.js` and `ui/tokens.css` - via the recipe
2. `ui/palette.ts` - by hand. It is a parallel representation of the same palette in raw hex, for contexts CSS variables cannot reach: edge-runtime `ImageResponse` rendering in `ui/next/icon.tsx` and `ui/next/opengraph-image.tsx`, and the Next `themeColor` meta tag
3. any new role class in `ui/globals.css`

Skip `palette.ts` and OG images plus the browser theme color silently drift from the in-DOM look.

## Exports and Gating

- every public entry point is listed in `package.json` `exports`. A file under `ui/next/` does nothing until it gets an `exports` entry
- a file under `ui/src/` does nothing until it is re-exported from `ui/src/index.ts`, which is alphabetized
- `files` in `package.json` (`config`, `tailwind-preset`, `ui`, `postcss.config.mjs`) controls what a git-dependency install actually delivers. A new top-level directory must be added there too
- `ui/next/` is deliberately outside the barrel - it imports `next/*` and `@vercel/analytics`, both optional peers, so pulling it into `index.ts` would break any consumer that only wants the components

## Design Tokens

This package is the authoritative home for the token and utility vocabulary. Consuming sites should point here instead of copying the list into their own docs.

Colors originate in `../pivoshenko.theme`, land in `ui/tokens.css` as space-separated `R G B` triples on `:root` (not hex, so Tailwind can compose them with `<alpha-value>`), and `tailwind-preset/preset.js` maps each one to a Tailwind color name:

| Group | Tokens | Utilities |
| --- | --- | --- |
| `bg` | `canvas`, `surface`, `raised`, `sunken`, `overlay` | `bg-bg-canvas`, `bg-bg-raised`, ... |
| `fg` | `default`, `muted`, `subtle`, `faint` | `text-fg-muted`, `text-fg-faint`, ... |
| `border` | `subtle`, `default`, `strong` | `border-border-strong`, ... |
| `accent` | `primary`, `secondary`, `success`, `warning`, `danger`, `info` | `text-accent-success`, `bg-accent-danger/15`, ... |

`fg`, `border`, and `accent` also carry a `DEFAULT`, aliasing `fg-default`, `border-default`, and `accent-primary` respectively. The preset is flavor-agnostic: its output is byte-identical for every flavor, only the variable values differ.

`ui/globals.css` layers semantic helper classes on top, and **components should reach for these** rather than the raw token utilities, so a role remapping stays a one-line change:

- type: `type-heading`, `type-body`, `type-ui`, `type-label`, `type-meta`, `type-logo`
- foreground: `fg-title`, `fg-primary`, `fg-secondary` (all three map to `text-fg-default`), `fg-body` (`fg-muted`), `fg-subtle` (`fg-subtle`), `fg-muted` (`fg-faint`)
- hover foreground: `hover-primary`, `hover-secondary`
- background: `bg-tag`, `bg-tag-active`
- border: `border-ui` (`border-default`), `border-faint` (`border-subtle`)
- underline decoration: `deco-subtle`

The helper names are deliberately **not** the token names - `.fg-muted` maps to `text-fg-faint`, not `text-fg-muted`. Raw token utilities are fine where no helper class exists, accent tones in particular.

## Tailwind Preset

`tailwind-preset` is the bare role layer; `tailwind-preset/site` adds the JetBrains Mono `fontFamily` (both `sans` and `mono` map to `var(--font-jetbrains-mono)`, which `SiteLayout` populates via `next/font/google`) plus `withUiContent`. Sites use `/site`.

Both entry points prepend an absolute `<pkgRoot>/ui/src/**/*.{ts,tsx}` glob derived from `__dirname`, so Tailwind's content scanner does not prune the classes used inside this package and the path survives pnpm's `.pnpm` store symlinks. Sites that need their own globs wrap them in `withUiContent` rather than redeclaring ours. The entry points must stay CommonJS `.js` with hand-written `.d.ts` siblings - Tailwind 3 loads presets through `require`.

## Component Conventions

Read any file in `ui/src/` for the pattern; it is uniform. In short:

- **named `function` exports only** - no default exports, no `forwardRef`, no `React.FC`, no `memo`
- **`type` aliases, never `interface`**, declared directly above the component they belong to
- pass-through props extend the DOM attribute type: `type CardProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode }`
- **`className = ''` defaults to empty string and is interpolated last** in the template literal, so a caller can always override. `...rest` is spread onto the element *before* `className` so the internal classes win
- multi-variant styling is a `Record<Variant, string>` lookup table at module scope above the component, not conditionals inline in JSX. A plain two-state toggle stays an inline ternary
- **`'use client'` only where a hook genuinely demands it.** Everything else is a server component; keep it that way
- icons: `lucide-react` at `w-4 h-4` / `size={14}`, `strokeWidth={2}`, `aria-hidden="true"`. Brand marks that lucide lacks (GitHub, LinkedIn, RSS) are inline `<svg role="img" viewBox="0 0 24 24">` components local to the file that uses them
- new components go in `ui/src/`, one file per family, and **must** be added to `ui/src/index.ts`

## Formatting

Biome, not Prettier or ESLint. Run `just format` before committing rather than hand-matching its settings.

`config/biome.json` is the copy sites extend; the root `biome.json` is this repo's own. They are near-identical but separate - a rule change usually belongs in both.

## Release

Releases are manual: the **Release** workflow via `workflow_dispatch` (see `CONTRIBUTING.md`), with `just tag-release VERSION` for tagging by hand. Because consumers pin by tag, cutting a release is only half the job - each site's git ref has to be bumped to see the change.
