---
title: "Installation"
description: "Run the NetIgnite server with Docker Compose, docker run, or from source with Bun."
navigation:
  title: Installation
---

# Installation

The NetIgnite server ships as a Docker image on the GitHub Container Registry:

```text
ghcr.io/netignite-project/server
```

| Tag | Content |
| --- | --- |
| `latest` | The latest stable release |
| `2.0.0`, … | A specific release (see the [release list](https://github.com/NetIgnite-project/Server/releases)) |
| `2.1.0-beta.1`, … | Pre-releases. They never move `latest`. |

Images are built for `linux/amd64` and signed with [cosign](https://github.com/sigstore/cosign)
(keyless). On other platforms, [run the server from source](#from-source).

## Docker Compose (recommended)

```yaml [docker-compose.yml]
services:
  netignite-server:
    image: ghcr.io/netignite-project/server:latest
    container_name: netignite-server
    restart: unless-stopped
    ports:
      - "18232:18232"
    environment:
      NETIGNITE_APP_URL: https://netignite.example.com
    volumes:
      - /opt/netignite/data:/opt/netignite/data
      - /opt/netignite/config:/opt/netignite/config
```

```bash [Terminal]
docker compose up -d
docker compose logs -f netignite-server
```

`NETIGNITE_APP_URL` is required: it's the address users open the dashboard at, and the server
stops at startup without it. All other settings have defaults; see
[Configuration](/docs/server/configuration).

## docker run

```bash [Terminal]
docker run -d \
  --name netignite-server \
  --restart unless-stopped \
  -p 18232:18232 \
  -e NETIGNITE_APP_URL=https://netignite.example.com \
  -v /opt/netignite/data:/opt/netignite/data \
  -v /opt/netignite/config:/opt/netignite/config \
  ghcr.io/netignite-project/server:latest
```

## What's in the container

| Path | Content |
| --- | --- |
| `/opt/netignite/data/netignite.sqlite` | The SQLite database |
| `/opt/netignite/data/firmware/` | ESP32 firmware releases downloaded from GitHub |
| `/opt/netignite/data/logs/` | Log files of background tasks |
| `/opt/netignite/config/secrets.key` | Key that encrypts stored SSH passwords and private keys, created on first use |
| `/opt/netignite/config/initial_admin_password_reset_token.txt` | The password link for the first admin |
| `/opt/netignite/app/` | The application (part of the image, not a volume) |

The container listens on port `18232` on all interfaces (IPv4 and IPv6). The dashboard, the REST
API, the OpenAPI reference (`/api/docs/v1`) and the WebSockets `/ws/agent` and `/ws/console` all
share this port. Docker checks the container's health with `GET /api/health`.

Back up both volumes. Without `secrets.key`, stored SSH logins can't be decrypted.

## First start

On first start, the server:

1. creates the database and applies the migrations,
2. creates the user `admin` with a random password, and writes a link for setting its password to
   `config/initial_admin_password_reset_token.txt` (and to the log),
3. starts the API and accepts agent connections,
4. downloads the newest ESP32 firmware releases from GitHub in the background (again every 6
   hours).

```bash [Terminal]
sudo cat /opt/netignite/config/initial_admin_password_reset_token.txt
```

The link is valid for 7 days. Open it, set a password and log in as `admin`. See
[Users & Accounts](/docs/server/users#the-initial-admin).

The server needs outbound HTTPS to `api.github.com` and GitHub's download servers for the firmware
sync. Without it, the ESP32 web installer has no firmware to offer; see
[Configuration](/docs/server/configuration#firmware-sync).

::warning
Logging in and the ESP32 web installer need HTTPS: the browser only keeps the login cookie and
only allows USB access on HTTPS pages (or on `localhost`). Before you use the dashboard from another
machine, set up [HTTPS & a reverse proxy](/docs/server/reverse-proxy).
::

## Updating

Pull the new image and recreate the container. The database and the config live in the mounted
volumes and are kept; database migrations run automatically on startup.

```bash [Terminal]
docker compose pull
docker compose up -d
```

Logins are stored in the database, so users stay logged in. Agents reconnect on their own within a
minute.

Upgrading from NetIgnite v1 (`0.1.x`)? Follow [Upgrading from v1](/docs/server/upgrading).

## From source

The server requires [Bun](https://bun.sh); it uses Bun's runtime APIs and doesn't run on Node.js.

```bash [Terminal]
git clone https://github.com/NetIgnite-project/Server.git
cd Server
bun install
bun run build
```

Create a `.env` file in the repository root. Bun loads it when it starts the server:

```bash [.env]
NETIGNITE_APP_URL=https://netignite.example.com
```

Then start the server from the repository root:

```bash [Terminal]
bun run start
```

`bun run start` listens on port `18232` (it sets `PORT=18232`). The data paths (`./data`,
`./config`) and the database migrations (`./drizzle/migrations`) are resolved relative to the
working directory. `bun run build` also writes `.output/import-v1.mjs`, the
[v1 import](/docs/server/upgrading).

To build the Docker image yourself, build the app first, then the image with the repository root as
the build context:

```bash [Terminal]
bun run build
docker build -f docker/Dockerfile -t netignite-server .
```

For a development server with hot reload, see [Development](/docs/reference/development).
