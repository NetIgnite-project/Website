# NetIgnite Website

Landing page and documentation for [NetIgnite](https://netignite.dev): power on devices from
anywhere. Built from the LeiCraftMC static-site-with-docs template.

## Stack

- Nuxt 4 (`app/` srcDir)
- NuxtUI v4 + Tailwind v4 (CSS-first)
- `@nuxt/content` for markdown-based docs
- `nuxt generate` for static output
- Biome formatter/linter
- AGPL-3.0

## Setup

```bash
bun install
bun run dev
```

Dev server runs on port **12531** (set in `package.json`).

## Generate and deploy

```bash
bun run generate   # → .output/public/
```

On pushes to `main`, GitHub Actions (`.github/workflows/ci.yml`) runs Biome, the typecheck and
the tests, then generates the site and rsyncs `.output/public/` to the web host via
`.gitlab/ci/deploy.sh`. Set the repository secrets `DEPLOY_REMOTE_USER`, `DEPLOY_REMOTE_PASSWORD`,
`DEPLOY_REMOTE_HOST` and `DEPLOY_REMOTE_DIR`. `public/.htaccess` configures Apache (clean URLs,
trailing slashes, 404 page).

## Scripts

- `bun run dev` — dev server
- `bun run generate` — static generation
- `bun run typecheck` — TypeScript check
- `bun run check` — Biome check
- `bun run format` — format with Biome
- `bun test` — tests

## Docs

Docs live in `content/docs/` as markdown files. Navigation is declared in `app/data/docs.ts`. Add a
new page by creating a `.md` file, adding it to the sidebar data and to
`public/static/utils/sitemap.xml`.

The docs describe the [Server](https://github.com/NetIgnite-project/Server), the
[ESP32 agent](https://github.com/NetIgnite-project/Agent-ESP32) and the
[Linux agent](https://github.com/NetIgnite-project/Agent-Linux). Keep them in sync with those
repositories when behavior changes.

## Structure

See the LeiCraftMC style guide:

- [docs/01-project-structure.md](https://github.com/LeiCraftMC/Style-Guides/blob/main/docs/01-project-structure.md)
- [docs/06-frontend-nuxt.md](https://github.com/LeiCraftMC/Style-Guides/blob/main/docs/06-frontend-nuxt.md)

## License

AGPL-3.0
