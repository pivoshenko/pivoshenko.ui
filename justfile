default:
    @just --list

install:
    pnpm install

format:
    pnpm format

lint:
    pnpm lint

# No build step — source TS is transpiled by consuming sites. Gate == lint.
check: lint

update:
    pnpm update -r

# Vendor latest Tailwind preset from pivoshenko.theme (local sibling repo)
vendor-preset:
    cp ../pivoshenko.theme/themes/dist/tailwind/morok.js tailwind-preset/morok.js

# Cut a release tag (usage: just release v0.2.0)
release version:
    git tag {{version}}
    git push --tags
