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
| `0.1.3`, `0.1.2`, … | A specific release (see the [release list](https://github.com/NetIgnite-project/Server/releases)) |

Images are built for `linux/amd64` and signed with [cosign](https://github.com/sigstore/cosign)
(keyless).

## Docker Compose (recommended)

```yaml [docker-compose.yml]
services:
  netignite-server:
    image: ghcr.io/netignite-project/server:latest
    container_name: netignite-server
    restart: unless-stopped
    ports:
      - "18232:18232"
    volumes:
      - /opt/netignite/data:/opt/netignite/data
      - /opt/netignite/config:/opt/netignite/config
```

```bash [Terminal]
docker compose up -d
docker compose logs -f netignite-server
```

The upstream [compose file](https://github.com/NetIgnite-project/Server/blob/main/docker/docker-compose.yml)
also mounts `/opt/netignite/logs`. The current release logs to stdout only (use `docker logs`),
so that mount is optional.

## docker run

```bash [Terminal]
docker run -d \
  --name netignite-server \
  --restart unless-stopped \
  -p 18232:18232 \
  -v /opt/netignite/data:/opt/netignite/data \
  -v /opt/netignite/config:/opt/netignite/config \
  ghcr.io/netignite-project/server:latest
```

## What's in the container

| Path | Content |
| --- | --- |
| `/opt/netignite/data/db.sqlite` | The SQLite database (users, agents, devices) |
| `/opt/netignite/data/initial_admin_credentials` | The generated admin password from the first start |
| `/opt/netignite/config/config.json` | Server settings; created from a sample on first start (see [Configuration](/docs/server/configuration)) |

The container listens on port `18232` (`NITRO_PORT`) on all interfaces. The dashboard, the REST
API and the agent WebSocket (`/api/agent-control-service`) all share this port.

## First start

On first start, the server:

1. creates `config/config.json` from the bundled sample (an empty `{}`) if it doesn't exist,
2. creates the database tables,
3. creates the user `admin` with a random 64-character password, writes it to
   `data/initial_admin_credentials` and prints it to the log,
4. loads the agents from the database and starts accepting agent connections.

```bash [Terminal]
sudo cat /opt/netignite/data/initial_admin_credentials
```

::warning
Log in and change the admin password right away, then delete `initial_admin_credentials`. The
server never removes the file itself.
::

Production builds only accept the session cookie over HTTPS (or on `localhost`). Before you use
the dashboard from another machine, set up [HTTPS & a reverse proxy](/docs/server/reverse-proxy).

## Updating

Pull the new image and recreate the container. The database and config live in the mounted
volumes and are kept.

```bash [Terminal]
docker compose pull
docker compose up -d
```

::note
Login sessions are held in memory, so everyone has to log in again after a restart or update.
::

## From source

The server requires [Bun](https://bun.sh). Node.js is not supported: the build uses Nitro's `bun`
preset and the startup code uses Bun APIs.

```bash [Terminal]
git clone https://github.com/NetIgnite-project/Server.git
cd Server
bun install
bun run build
bun run .output/server/index.mjs
```

Run the last command from the repository root: `config/` and `data/` are resolved relative to the
working directory, and the config file is created from `config/config.sample.json`. Without
`NITRO_PORT` the server listens on port `3000`; set `NITRO_PORT=18232` to match the Docker image.

To build the image yourself, use the repository root as the build context:

```bash [Terminal]
docker build -f docker/Dockerfile -t netignite-server .
```

For a development server with hot reload, see [Development](/docs/reference/development).
