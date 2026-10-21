---
title: "Development"
description: "NetIgnite's repositories and branches, how to run each one locally, the tests, and how to contribute."
navigation:
  title: Development
---

# Development

NetIgnite is developed in the open on GitHub under the
[NetIgnite-project](https://github.com/NetIgnite-project) organization. All repositories are
licensed under the [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html).

| Repository | Stack |
| --- | --- |
| [Server](https://github.com/NetIgnite-project/Server) | Nuxt 4, Nuxt UI, Hono with Zod and OpenAPI, Drizzle ORM on `bun:sqlite`, Bun |
| [Agent-ESP32](https://github.com/NetIgnite-project/Agent-ESP32) | C++17, Arduino-ESP32 3.3 on ESP-IDF 5.5 (pioarduino), PlatformIO |
| [Agent-Linux](https://github.com/NetIgnite-project/Agent-Linux) | TypeScript, Bun, compiled into single binaries |
| [Website](https://github.com/NetIgnite-project/Website) | Nuxt 4, Nuxt UI, Nuxt Content, Tailwind CSS, static generation |

## Branches and releases

`main` holds the released version of each repository. Until NetIgnite v2 has its stable release,
v2 is developed on the `v2` branches of Server and Agent-ESP32, and their `main` branches hold v1.

| Repository | Release |
| --- | --- |
| Server | The manual GitHub Actions workflow **Create Release** builds, tests, creates the GitHub release and publishes the Docker image. Stable releases (which move the image's `latest` tag) only run from `main`; pre-releases such as `2.0.0-beta.1` from any branch. |
| Agent-ESP32 | Pushing a tag `v<version>` builds, tests and publishes a release with the flash images and `release.json`. Versions with a suffix become pre-releases. |
| Agent-Linux | Pushing a tag `v<version>` that matches `package.json` builds the three binaries and `SHA256SUMS`. Versions with a suffix become pre-releases. |
| Website | Every push to `main` is deployed to netignite.dev. Docs for unreleased versions live on a separate branch until the release. |

The agents and the server talk over the [agent protocol v2](/docs/agents/protocol); its source of
truth is the server (`server/lib/agents/protocol.ts`). Change the ESP32's NVS keys
(`src/Config.h`) only together with the server's web installer
(`server/lib/firmware/provisioning.ts`).

## Server

```bash [Terminal]
git clone https://github.com/NetIgnite-project/Server.git
cd Server
bun install
cp example.env .env
bun run dev
```

The dev server runs on `http://localhost:18232` with the dashboard, the API, the agent gateway and
the OpenAPI reference at `/api/docs/v1`. It stores its data in `./data/` and `./config/`; on the
first start it prints the link for the `admin` password. `example.env` contains sample SMTP
settings; remove them if you don't have a mail server.

| Command | What it does |
| --- | --- |
| `bun test` | Runs the tests: API routes and permissions, the agent gateway with a simulated agent, the v1 import, the firmware catalog against a fake GitHub, the NVS image against Espressif's generator, OTA, console and SSH. |
| `bun run check` | Biome lint and format check. |
| `bun run typecheck` | `nuxt typecheck` and `tsc` for `server/`. |
| `bun run api-client:generate` | Regenerates the dashboard's typed API client after API changes. |
| `bun run db:generate` | Creates a Drizzle migration after schema changes. |
| `bun run build` | Production build in `.output/`, including `.output/import-v1.mjs`. |

To test agents without hardware, run the [Linux agent](#linux-agent) or the
[example agent](/docs/agents/protocol#example-agent) against the dev server.

## ESP32 agent

You need [PlatformIO](https://platformio.org/) Core 6.2 or newer. Building, flashing and the serial
console are described on the [ESP32 Agent](/docs/agents/esp32#build-from-source) page. A board
flashed from PlatformIO is set up over the serial console:
`setup http://<your computer's IP>:18232 <token>`.

| Command | What it does |
| --- | --- |
| `pio run -e esp32dev` | Builds the firmware. |
| `pio test -e native` | Unit tests of the parsers and encoders on your computer (needs `gcc`). |
| `python scripts/check_size.py` | Fails if the firmware takes more than 85 % of a firmware slot. |
| `pio run -e esp32dev-qemu` | The firmware without Wi-Fi, for Espressif's QEMU. |

`test/emulator/` boots the QEMU build and tests Improv, the console commands and OTA updates
(signature checks, probation, rollback) with Bun; its README has the commands. QEMU has no Wi-Fi,
so networking needs a real board. The code is formatted with the included `.clang-format`.

## Linux agent

```bash [Terminal]
git clone https://github.com/NetIgnite-project/Agent-Linux.git
cd Agent-Linux
bun install
bun run dev version
```

| Command | What it does |
| --- | --- |
| `bun run dev <command>` | Runs the agent from source with file watching, for example `bun run dev run --config ./agent.json`. |
| `bun test` | Unit and integration tests against a fake server and an SSH server. |
| `bun run typecheck` | TypeScript check. |
| `bun run check` | Biome. |
| `bun run compile all --no-version-tag` | Builds `build/bin/netignite-agent-linux-{x64,x64-baseline,arm64}`. |

Pair a development agent with a config outside `/etc`:
`bun run dev pair http://localhost:18232 <token> --config ./agent.json`. `install` only works from
a compiled binary.

## Website

This website, including the docs, is a static site built with the
[LeiCraftMC Style Guide](https://github.com/LeiCraftMC/Style-Guides) static-site-with-docs
template.

```bash [Terminal]
git clone https://github.com/NetIgnite-project/Website.git
cd Website
bun install
bun run dev
```

The dev server runs on `http://localhost:12531`. `bun run generate` writes the static site to
`.output/public/`; `bun test` and `bun run check` run the tests and Biome.

Docs pages are Markdown files in `content/docs/`. To add one:

1. Create the `.md` file with `title`, `description` and `navigation.title` frontmatter.
2. Register it in `app/data/docs.ts` so it appears in the sidebar and the previous/next links.
3. Add it to `public/static/utils/sitemap.xml`.

Label code blocks with a file name or an extension from `app/data/code-icons.ts`, or a label without
a dot such as `[Terminal]`; a test checks this. Every page has an **Edit this page** link that
opens the file on GitHub.

## Contributing

Bug reports and pull requests are welcome in the matching repository. Use
[Conventional Commits](https://www.conventionalcommits.org/) for commit messages, for example
`fix: reconnect after Wi-Fi loss`.
