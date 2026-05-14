format:
    pnpm format

check:
    pnpm lint

lint:
    pnpm lint

install:
    pnpm install

update:
    pnpm update -r

# Vendor latest Tailwind preset from pivoshenko.theme (local sibling repo)
vendor-preset:
    cp ../pivoshenko.theme/morok/dist/tailwind/morok.js tailwind-preset/morok.js

# Cut a release tag (usage: just release v0.2.0)
release version:
    git tag {{version}}
    git push --tags
