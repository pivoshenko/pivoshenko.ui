default:
    @just --list

install:
    pnpm install

format:
    pnpm format

lint:
    pnpm lint

# No build step — source TS is transpiled by consuming sites. Gate == lint
check: lint

update:
    pnpm update -r

audit:
    pnpm audit

# Vendor latest Tailwind preset from pivoshenko.theme (local sibling repo)
vendor-preset:
    cp ../pivoshenko.theme/themes/dist/tailwind/morok.js tailwind-preset/morok.js

release version:
    git tag {{ version }}
    git push --tags
