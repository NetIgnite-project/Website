---
title: "Development"
description: "NetIgnite's repositories, how to run each one locally, and how to contribute."
navigation:
  title: Development
---

# Development

NetIgnite is developed in the open on GitHub under the
[NetIgnite-project](https://github.com/NetIgnite-project) organization. All repositories are
licensed under the [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html).

| Repository | Stack |
| --- | --- |
| [Server](https://github.com/NetIgnite-project/Server) | Nuxt 3, Nitro (Bun preset) with WebSockets, SQLite via libsql, Bootstrap |
| [Agent-ESP32](https://github.com/NetIgnite-project/Agent-ESP32) | C++17, Arduino framework, PlatformIO |
| [Website](https://github.com/NetIgnite-project/Website) | Nuxt 4, Nuxt UI, Nuxt Content, Tailwind CSS, static generation |

## Server

```bash [Terminal]
git clone https://github.com/NetIgnite-project/Server.git
cd Server
bun install
bun run dev
```

The dev server runs on `http://localhost:3000` and stores its database in `./data/`. The admin
password is printed on first start. Run the tests with `bun test`.

Helper scripts in `devutils/` write directly to `./data/db.sqlite`:

- `bun run devutils/createAgent.ts` creates a test agent (secret `123456`) for user `1`. Restart
  the dev server afterwards so it loads the agent.
- `bun run devutils/createTestUser.ts` creates an `admin` user with the password `123456`. It
  fails if `admin` already exists, so run it before the server's first start.

Releases are created with the manual GitHub Actions workflows **Create Release** (builds, tests
and attaches `app.tar.gz`) and **Publish Docker Images** (pushes to
`ghcr.io/netignite-project/server`).

## ESP32 Agent

Open the repository in VS Code with the PlatformIO extension, or use PlatformIO Core. Setup,
build and flashing are described on the [ESP32 Agent](/docs/agents/esp32) page. The code is
formatted with the included `.clang-format`.

To test protocol changes without hardware, use the [example agent](/docs/agents/protocol#example-agent).

## Website

This website, including the docs, is a static site built with the
[LeiCraftMC Style Guide](https://git.leicraftmc.de/LeiCraftMC/Style-Guides) static-site-with-docs
template.

```bash [Terminal]
git clone https://github.com/NetIgnite-project/Website.git
cd Website
bun install
bun run dev
```

The dev server runs on `http://localhost:12531`. `bun run generate` writes the static site to
`.output/public/`.

Docs pages are Markdown files in `content/docs/`. To add one:

1. Create the `.md` file with `title`, `description` and `navigation.title` frontmatter.
2. Register it in `app/data/docs.ts` so it appears in the sidebar and the previous/next links.
3. Add it to `public/static/utils/sitemap.xml`.

Every page has an **Edit this page** link that opens the file on GitHub.

## Contributing

Bug reports and pull requests are welcome in the matching repository. Use
[Conventional Commits](https://www.conventionalcommits.org/) for commit messages, for example
`fix: reconnect after WiFi loss`.
