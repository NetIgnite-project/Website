# AGENTS.md — operating manual for AI coding agents

You are working in the NetIgnite website: a LeiCraftMC static site with docs. Follow the
LeiCraftMC Style Guides: https://github.com/LeiCraftMC/Style-Guides.

## Must read

- [docs/00-overview.md](https://github.com/LeiCraftMC/Style-Guides/blob/main/docs/00-overview.md)
- [docs/06-frontend-nuxt.md](https://github.com/LeiCraftMC/Style-Guides/blob/main/docs/06-frontend-nuxt.md)

## Non-negotiable

- Nuxt 4 `app/` srcDir.
- Tailwind v4 CSS-first; no `tailwind.config.js`. Dark-only (no toggle).
- `nitro: { preset: "static" }`.
- No `useAPI` / `api-client/` / `auth.global.ts` / `AbstractStore` — this shape has no backend.
- Use the `usePageSeo` composable for per-page SEO (+ JSON-LD), not inlined `useSeoMeta`.
- `@tailwindcss/typography` for prose content; static data in `app/data/`.
- Lucide icons only (`i-lucide-*`).
- Format with Biome before finishing.
- Conventional Commits.

## Branding

NetIgnite keeps its own look on top of the template:

- `primary` is the custom `netignite` palette (brand blue `#0087ff` at 500), defined in
  `app/assets/css/main.css`; the dark-mode `--ui-primary` uses the 500 shade.
- Backgrounds: `bg-night` (`#0b0c1b`, the page / `.main-bg-color`) and `bg-surface` (`#1a1b2e`,
  header, footer, alternating sections and cards). Nuxt UI's `--ui-bg*` variables point at them.
- The logo is `app/components/img/AppLogo.vue` (official SVG paths — don't redraw it).
- Feature icon colors come from the static class map in `app/components/FeatureCard.vue`.

## Docs

- Add new docs as `.md` files in `content/docs/`.
- Update `app/data/docs.ts` when adding or removing docs pages (sidebar + prev/next), and
  `public/static/utils/sitemap.xml`.
- Label code blocks with a file name or extension from `app/data/code-icons.ts`, or a plain label
  without a dot (`[Terminal]`); `tests/code-icons.test.ts` fails otherwise. Add new highlight
  languages to `content.build.markdown.highlight.langs` in `nuxt.config.ts`.
- The docs describe https://github.com/NetIgnite-project/Server,
  https://github.com/NetIgnite-project/Agent-ESP32 and
  https://github.com/NetIgnite-project/Agent-Linux. Verify behavior against their code, not
  their READMEs.
