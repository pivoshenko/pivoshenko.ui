# CLAUDE.md

`pivoshenko.ui` is the shared frontend layer for the `pivoshenko.*` sites: tool config (Biome, TypeScript base, PostCSS), a Tailwind preset carrying the design-token role layer, a React component library, and Next.js glue - all behind one package name. `README.md` has the subpath table and the consumption snippets; `CONTRIBUTING.md` has the command table, branch naming, and the commit type table (`cliff.toml` adds a non-standard `design` type for visual and layout changes).

`AGENTS.md` is a symlink to this file. If `CLAUDE.md` is missing, `just lint` reports a broken-symlink warning.

## Invariants

- **Never published to npm.** Sites consume it as a git dependency pinned by tag, so a change here is not live until it is tagged **and** each site's `package.json` git ref is bumped
- **No build step.** The `.` export points at `./ui/src/index.ts` - raw TSX, compiled by the consuming site, which is why `baseNextConfig` sets `transpilePackages: ['pivoshenko.ui']`. Do not add a bundler, a `dist/`, or emit-producing `tsc`; `config/tsconfig.base.json` sets `noEmit: true` deliberately
- **No tests.** `just lint` is Biome only; `just typecheck` is the TypeScript pass, and `just check` runs both. Neither runs in CI, so a type error still surfaces first in a consuming site's build
- do not delete `.no-tests` without adding a real test command - `just test` fails hard when the sentinel is gone
- do not add runtime dependencies. `lucide-react` is the only one; anything framework-level goes in `peerDependencies` plus `peerDependenciesMeta.<dep>.optional`, because a consumer pulling only `tsconfig.base.json` must not be forced to install React

### Verifying a Change

`tsconfig.json` at the root includes `ui/**`, which is what an editor's language server picks up - without it TypeScript falls back to its defaults and every `.tsx` reports "Cannot use JSX unless the --jsx flag is provided". `just typecheck` runs the same config, and `just check` runs it after Biome.

That is still not CI: the authoritative check is a consuming site's build. Add the `pnpm.overrides` link to the *site's* `package.json` (README, "Local Development Override" - do not commit it) and run `just build` there.

## Generated Files

`just vendor-theme-preset [FLAVOR]` regenerates **three** files from a sibling `../pivoshenko.theme` checkout. Flavors: `popil` (the default), `morok`, `vatra`.

1. `tailwind-preset/preset.js` - the role-colour Tailwind layer, copied out of the theme's `tailwind-tokens/`
2. `ui/tokens.css` - the 26 named palette slots plus the role layer, as `R G B` triples, written by `scripts/vendor-tokens.mjs`
3. `ui/palette.ts` - the same palette in raw hex, written by the same script

All three are generated. Hand edits are erased by the next vendor run, and `preset.js` sits in Biome's ignore list for exactly that reason. `palette.ts` used to be hand-maintained and drifted; it is generated now precisely so the OG images and the browser theme colour cannot fall behind the in-DOM look.

`scripts/` is dev-only and deliberately outside `files` in `package.json`, so it never ships to a consuming site.

`tailwind-preset/system.js` is **not** generated. It is the hand-written design-system layer sitting on top of `preset.js`: the named palette colours, the live `--accent` indirection, radii, shadows, motion and the display face. It is flavor-agnostic, so a vendor run never touches it.

## Visual Source of Truth

The components are a port of a vendored plain-CSS build of the same design system, which lives in the sibling `pivoshenko.ai` repository at `plugins/herdr/agents.fleet/public/vendor/` (`bundle.css` for every rule by class name, `bundle.js` for the markup each component emits). When a component's geometry, state or motion is in question, that bundle answers it. Deliberate divergences so far:

- section headings are **larger** than the bundle's, which renders them at body size. The colour stays on the `//` prefix alone - the words are `fg-title`, and prose `h3` and card titles likewise
- `Card` holds still. The bundle lifts it and blooms a cursor-tracked gradient under it; on a page of sixty cards that reads as noise, so the only hover affordance is the border
- every text glyph is a lucide icon

## Exports and Gating

- every public entry point is listed in `package.json` `exports`. A file under `ui/next/` does nothing until it gets an `exports` entry
- a file under `ui/src/` does nothing until it is re-exported from `ui/src/index.ts`, which is alphabetized
- `files` in `package.json` (`config`, `tailwind-preset`, `ui`, `postcss.config.mjs`) controls what a git-dependency install actually delivers. A new top-level directory must be added there too
- `ui/next/` is deliberately outside the barrel - it imports `next/*` and `@vercel/analytics`, both optional peers, so pulling it into `index.ts` would break any consumer that only wants the components

## Design Tokens

This package is the authoritative home for the token and utility vocabulary. Consuming sites should point here instead of copying the list into their own docs.

Colors originate in `../pivoshenko.theme`, land in `ui/tokens.css` as space-separated `R G B` triples on `:root` (not hex, so Tailwind can compose them with `<alpha-value>`), and the preset maps each one to a Tailwind color name:

| Group | Tokens | Utilities |
| --- | --- | --- |
| `bg` | `canvas`, `surface`, `raised`, `sunken`, `overlay` | `bg-bg-canvas`, `bg-bg-raised`, ... |
| `fg` | `default`, `muted`, `subtle`, `faint` | `text-fg-muted`, `text-fg-faint`, ... |
| `border` | `subtle`, `default`, `strong` | `border-border-strong`, ... |
| `accent` | `primary`, `secondary`, `success`, `warning`, `danger`, `info` | `text-accent-success`, `bg-accent-danger/15`, ... |

`fg` and `border` also carry a `DEFAULT`, aliasing `fg-default` and `border-default`. The preset is flavor-agnostic: its output is byte-identical for every flavor, only the variable values differ.

`accent`'s `DEFAULT` is the one that moves. It resolves `--accent`, which `:root` points at `accent-primary` and **any subtree retargets with `data-accent`**:

```html
<html data-accent="peach">
```

`SiteLayout` stamps that attribute from its `accent` prop, defaulting to `peach`. So `text-accent`, `bg-accent`, `border-accent` follow the site's choice while `accent-primary`, `accent-success` and the rest stay pinned to their semantic role. A component that wants the site accent uses `accent`; one that means "this is an error" uses `accent-danger`.

`system.js` also registers the 14 chromatic palette slots (`peach`, `blue`, `mauve`, ...) plus `crust`, `overlay1` and `overlay2`, for the places a role token has no name, and these non-colour scales:

| Scale | Values |
| --- | --- |
| `rounded-*` | `sm` 4px, `DEFAULT`/`md` 6px, `lg` 10px |
| `shadow-*` | `chip`, `rest`, `lift`, `float`, plus `lifted` and `raised` - two Tailwind shadow utilities overwrite each other rather than stacking, so the composed pairs are theme keys |
| `duration-*` | `fast` 120ms, `base` 220ms, `slow` 600ms |
| `ease-*` | `out`, `in-out` - the system's curves, not Tailwind's |
| `font-*` | `mono` (JetBrains Mono), `display` (Martian Mono) |
| `animate-*` | `rise`, `menu-in` |

Spacing needs no override: the system's `--space-N` are plain 4px steps, so Tailwind's default scale already matches.

`ui/globals.css` layers semantic helper classes on top, and **components should reach for these** rather than the raw token utilities, so a role remapping stays a one-line change:

- type: `type-display`, `type-heading`, `type-body`, `type-ui`, `type-label`, `type-meta`, `type-logo`
- foreground: `fg-title`, `fg-primary`, `fg-secondary` (all three map to `text-fg-default`), `fg-body` (`fg-muted`), `fg-subtle` (`fg-subtle`), `fg-muted` (`fg-faint`)
- hover foreground: `hover-primary`, `hover-secondary`
- background: `bg-tag`, `bg-tag-active`
- border: `border-ui` (`border-default`), `border-faint` (`border-subtle`), `border-card` (translucent `overlay0/60`)
- surface: `surface-card`, `surface-sunken`
- focus: `focus-ring` - never hand-roll an outline
- underline decoration: `deco-subtle`
- patterns Tailwind cannot express: `rule-dashed`, `mask-radial`, `mask-bottom`

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
- **no text glyphs.** A caret, check, arrow, prompt or status mark is a lucide icon, never a literal character. The one exception is the `//` prefixing a section heading or a table-of-contents title, which is wordmark rather than iconography
- prefer a real `<span aria-hidden="true">` over a `::before`/`::after` pseudo-element - the accent stub under the header, the dot before a footer link, the traffic lights on a terminal
- prefer a Tailwind state variant over a data attribute where one exists: `aria-pressed:`, `aria-current:`, `group-hover:`, `motion-reduce:`. Every transform-based transition is `motion-reduce:` guarded
- new components go in `ui/src/`, one file per family, and **must** be added to `ui/src/index.ts`

## Formatting

Biome, not Prettier or ESLint. Run `just format` before committing rather than hand-matching its settings.

`config/biome.json` is the copy sites extend; the root `biome.json` is this repository's own. They are near-identical but separate - a rule change usually belongs in both.

## Release

Releases are manual: the **Release** workflow via `workflow_dispatch` (see `CONTRIBUTING.md`), with `just tag-release VERSION` for tagging by hand. Because consumers pin by tag, cutting a release is only half the job - each site's git ref has to be bumped to see the change.
