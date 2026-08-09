default:
    @just --list

install:
    pnpm install

format:
    pnpm format

lint:
    pnpm lint

# No build step: source TS is transpiled by consuming sites, so the gate is lint
check: lint

update:
    pnpm update -r

audit:
    pnpm audit

test:
    @[ -f .no-tests ] && echo "skipping (.no-tests sentinel)" || { echo "no test command: add tests or restore .no-tests" >&2; exit 1; }

# Vendor the role-layer Tailwind preset and tokens CSS from pivoshenko.theme.
# The vendored palette IS the active palette; pass a flavor name to swap.
# Rewrites the tokens.css selector from [data-flavor="<flavor>"] to :root so
# pivoshenko.ui stays flavor-agnostic at the consumer surface
vendor-preset flavor="popil":
    # Tailwind preset: strip the upstream's flavor-named comment block and
    # prepend a neutral header so pivoshenko.ui doesn't leak the flavor
    printf '/**\n * Flavor-agnostic Tailwind preset (role layer).\n *\n * Consumes the CSS variables defined in `pivoshenko.ui/ui/tokens.css`,\n * scoped to `:root`, so whichever palette was vendored is active. The\n * output of this preset is identical for every palette; only the\n * variable values change.\n *\n * Vendored from pivoshenko.theme via `just vendor-preset [flavor]`.\n */\n' > tailwind-preset/preset.js
    awk 'skip {if (/\*\//) skip=0; next} NR==1 && /^\/\*/ {skip=1; next} {print}' ../pivoshenko.theme/themes/dist/tailwind-tokens/{{ flavor }}.js >> tailwind-preset/preset.js
    # tokens.css: prepend the same neutral header, then rewrite the
    # [data-flavor="<flavor>"] scope to :root. Upstream ships no header, so
    # without this the file loses its provenance on every vendor
    printf '/* Semantic design tokens (role layer).\n * Values are space-separated R G B triples for use with\n * rgb(var(--token) / <alpha-value>) in Tailwind / shadcn-style configs.\n * Scoped to `:root`, so the vendored palette IS the active palette.\n * Regenerate via `just vendor-preset` in pivoshenko.ui.\n */\n' > ui/tokens.css
    sed 's/\[data-flavor="{{ flavor }}"\]/:root/' ../pivoshenko.theme/themes/dist/tokens/{{ flavor }}.css >> ui/tokens.css
    @echo "Vendored {{ flavor }} -> tailwind-preset/preset.js + ui/tokens.css"
    @echo "Remember to also update ui/palette.ts to match (raw hex values used by OG image + themeColor)."

release version:
    git tag {{ version }}
    git push --tags
