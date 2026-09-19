# Changelog

All notable changes to this project will be documented in this file.

## [0.12.1] - 2026-09-19

### Bug fixes

- **pixels**: Clear the field where a hero's copy sits

### Miscellaneous

- Reformat the package manifest after the release bump

## [0.12.0] - 2026-09-19

### Features

- **field**: Add a pixel field and make the band field a site choice

### Miscellaneous

- Reformat the package manifest after the release bump

### Release

- V0.12.0

## [0.11.1] - 2026-09-19

### Bug fixes

- **catalog**: Keep the own block when there is nothing external

### Release

- V0.11.1

## [0.11.0] - 2026-09-19

### Build

- **tsconfig**: Add a root config so editors resolve ui sources

### Features

- **catalog**: Bucket entries by a group they name

## [0.10.0] - 2026-09-19

### Bug fixes

- **flow-map**: Re-measure when the node set changes
- **next**: Render the mark in a real extrabold face
- **card**: Ellipsise an eyebrow that does not fit

### Build

- Update dependencies
- Update dependencies
- **deps**: Bump baseline-browser-mapping to 2.11.13

### CI/CD

- Drop label sync in favor of terraform
- **release**: Bump pnpm and node actions off the Node 20 runtime

### Design

- **list**: Let a row act as a button and centre its lead
- **chrome**: Tie the accent stubs to the content edge
- **next**: Add the display face and a per-site accent
- **components**: Port the pivoshenko design system into react
- **tokens**: Vendor the popil palette and the design-system scales

### Documentation

- Describe the design system and its token vocabulary
- Correct the vendor recipe name in generated headers
- Rewrite CLAUDE.md from scratch
- Regenerate CLAUDE.md and add AGENTS.md
- Add pull request template
- Regenerate CLAUDE.md
- Drop references to the removed workspace root

### Features

- **catalog**: Offer a card layout alongside rows
- **exports**: Publish the composite layer from the barrel
- **list**: Let a row link through a caller's element
- **bands**: Add the hero, highlight and feature page bands
- **flow-map**: Add a column-and-link node graph
- **catalog**: Add a filterable catalog to the shared package

### Miscellaneous

- **release**: 0.10.0
- Repository housekeeping
- Symlink AGENTS.md to CLAUDE.md
- Remove local pull request template
- **deps**: Update locked dependencies

### Refactor

- **page-shell**: Give a page its own full-bleed bands
- **justfile**: Standardize recipe names and ordering

## [0.9.4] - 2026-08-09

### Bug fixes

- **justfile**: Stop vendor-preset from truncating preset.js

### Build

- **deps**: Override sharp to >=0.35.0 for libvips advisory
- **deps**: Update dependencies
- **deps**: Update dependencies

### Documentation

- Humanize prose and strip unnecessary comments

### Miscellaneous

- **release**: 0.9.4
- **deps**: Update dependencies via pnpm update -r
- **deps**: Update dependencies via pnpm update -r
- Add editorconfig

## [0.9.3] - 2026-07-05

### Build

- **deps**: Allow @vercel/analytics v2 as peer

## [0.9.2] - 2026-06-20

### CI/CD

- Drop hashFiles guard; move .no-tests sentinel handling into justfile
- Flatten to one job per language
- Bump action versions to latest major
- Standardize workflow to per-language parallel pipelines on ubuntu-24.04-arm

### Documentation

- Note lucide-react is a runtime dep (not a peer)
- Collapse duplicate ui/ block in structure tree
- Refresh CLAUDE.md — sources/ paths, palette.ts edge-runtime scope

### Features

- **config**: Add security headers to baseNextConfig

## [0.9.1] - 2026-06-04

### Bug fixes

- **ui**: Favicon — light fill, dark glyph, 4px radius, JetBrains Mono

## [0.9.0] - 2026-06-04

### Features

- **ui**: Brand-compliance pass — accent, radius, lucide, alert washes

## [0.8.3] - 2026-05-31

### Features

- **css**: Style bare links with accent-secondary (yellow)

## [0.8.2] - 2026-05-31

### Bug fixes

- **css**: Move tokens import above @tailwind directives

## [0.8.1] - 2026-05-31

### Bug fixes

- Add types for tailwind-preset/site subpath

## [0.8.0] - 2026-05-31

### Build

- Pin postcss>=8.5.10 to patch GHSA-qx2v-qp2m-jg93
- **justfile**: Add audit recipe

### CI/CD

- **release**: Bump checkout action to v6
- Add CI, labels sync workflows, and PR template

### Documentation

- **ci**: Document required secrets at top of workflow files
- **claude**: Document audit recipe, workspace yaml, and postcss override

### Features

- Switch to flavor-agnostic role-layer preset; drop theme toggle

### Miscellaneous

- Regenerate lockfile + apply biome formatting
- **gitignore**: Expand to cover next.js, vercel, and editor noise
- **editorconfig**: Drop markdown trim-whitespace override
- Relicense as MIT

## [0.6.5] - 2026-05-25

### Bug fixes

- **tailwind-preset**: Re-vendor morok background ramp from theme
- Correct vendor-preset path to themes/dist; fix CLAUDE.md drift

### Build

- Update dev dependencies

### Miscellaneous

- Standardize just recipes

## [0.6.4] - 2026-05-17

### Bug fixes

- **section-header**: Wrap // in braces to satisfy biome noCommentText

### Documentation

- **license**: Switch from MIT to All Rights Reserved

### Features

- **footer**: Add website link to baseline footer links

## [0.6.3] - 2026-05-15

### Style

- **section-header**: Use // prefix instead of em-dash

## [0.6.2] - 2026-05-15

### Features

- **section-header**: Add shared SectionHeader

## [0.6.1] - 2026-05-15

### Refactor

- **scroll-to-top**: Use IconButton with fade animation

## [0.6.0] - 2026-05-15

### Features

- **scroll-to-top**: Add shared ScrollToTop, auto-include in PageShell

## [0.5.0] - 2026-05-15

### Features

- **nav**: Add Logo monogram next to brand

## [0.4.4] - 2026-05-15

### Bug fixes

- **SearchInput**: Default to magnifying-glass leading icon

## [0.4.3] - 2026-05-15

### Features

- **exports**: Expose ./package.json subpath

## [0.4.2] - 2026-05-15

### Bug fixes

- **tailwind-preset**: Use absolute path for content glob

## [0.4.1] - 2026-05-15

### Bug fixes

- **tailwind-preset**: Add content glob for package source

## [0.4.0] - 2026-05-15

### Features

- Add full design system component library (v0.4.0)

## [0.3.0] - 2026-05-15

### Features

- Add v0.3.0 components (Footer, Nav, ThemeToggle, PageShell) + globals.css

## [0.2.1] - 2026-05-14

### Features

- **tailwind-preset**: Add TypeScript declarations

## [0.2.0] - 2026-05-14

### Refactor

- Flatten to single-package layout

## [0.1.1] - 2026-05-14

### CI/CD

- Add manual release workflow

## [0.1.0] - 2026-05-14

### Features

- Initial pivoshenko.ui scaffold

