default:
    @just --list

install:
    pnpm install

format:
    pnpm format

lint:
    pnpm lint

test:
    @[ -f .no-tests ] && echo "skipping (.no-tests sentinel)" || { echo "no test command, add tests or restore .no-tests" >&2; exit 1; }

check: lint test

update:
    pnpm update -r

generate-changelog:
    git-cliff --output CHANGELOG.md

tag-release VERSION:
    git tag {{ VERSION }}
    git push --tags

vendor-theme-preset FLAVOR="popil":
    printf '/**\n * Flavor-agnostic Tailwind preset (role layer).\n *\n * Consumes the CSS variables defined in `pivoshenko.ui/ui/tokens.css`,\n * scoped to `:root`, so whichever palette was vendored is active. The\n * output of this preset is identical for every palette; only the\n * variable values change.\n *\n * Vendored from pivoshenko.theme via `just vendor-theme-preset [flavor]`.\n */\n' > tailwind-preset/preset.js
    awk 'skip {if (/\*\//) skip=0; next} NR==1 && /^\/\*/ {skip=1; next} {print}' ../pivoshenko.theme/themes/dist/tailwind-tokens/{{ FLAVOR }}.js >> tailwind-preset/preset.js
    printf '/* Semantic design tokens (role layer).\n * Values are space-separated R G B triples for use with\n * rgb(var(--token) / <alpha-value>) in Tailwind / shadcn-style configs.\n * Scoped to `:root`, so the vendored palette IS the active palette.\n * Regenerate via `just vendor-theme-preset` in pivoshenko.ui.\n */\n' > ui/tokens.css
    sed 's/\[data-flavor="{{ FLAVOR }}"\]/:root/' ../pivoshenko.theme/themes/dist/tokens/{{ FLAVOR }}.css >> ui/tokens.css
    @echo "Vendored {{ FLAVOR }} -> tailwind-preset/preset.js + ui/tokens.css"
    @echo "Remember to also update ui/palette.ts to match (raw hex values used by OG image + themeColor)."
