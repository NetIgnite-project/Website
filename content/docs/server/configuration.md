---
title: "Configuration"
description: "Configure the NetIgnite server with NETIGNITE_* environment variables: public URL, data paths, secrets, firmware sync, the Linux agent installer and email."
navigation:
  title: Configuration
---

# Configuration

The NetIgnite server is configured with environment variables prefixed `NETIGNITE_`. They're read
once at startup; restart the server after changing them. Agents, devices, users and the settings
under **Server Settings** live in the database and are managed in the dashboard.

```yaml [docker-compose.yml]
services:
  netignite-server:
    image: ghcr.io/netignite-project/server:latest
    environment:
      NETIGNITE_APP_URL: https://netignite.example.com
      NETIGNITE_LOG_LEVEL: info
```

Running from source, put the variables into a `.env` file in the working directory; Bun loads it on
start. The repository's `example.env` lists all of them.

::note
Booleans must be exactly `true` or `false`. An invalid value, or a missing `NETIGNITE_APP_URL`,
stops the server at startup with `Failed to read the environment variable <NAME>`.
::

## Variables

The *Default* column is what the server uses when the variable isn't set. The Docker image sets some
of them to paths inside the container (*Docker image* column).

### General

| Variable | Default | Docker image | Description |
| --- | --- | --- | --- |
| `NETIGNITE_APP_URL` | *required* | | The public URL of the dashboard, for example `https://netignite.example.com`, without a path. See [below](#the-public-url). |
| `NETIGNITE_LOG_LEVEL` | `info` | | `debug`, `info`, `warn`, `error` or `critical`. |
| `NETIGNITE_API_DISABLE_DOCS` | `false` | | `true` turns off the OpenAPI reference at `/api/docs/v1` and its spec. |
| `NETIGNITE_SECRETS_KEY` | *generated* | | Key that encrypts stored SSH passwords and private keys. Without it, the server generates one in `<config dir>/secrets.key`. Any string; use a long random one, for example from `openssl rand -hex 32`. Changing it later makes stored SSH logins unreadable. |

### Paths and database

| Variable | Default | Docker image | Description |
| --- | --- | --- | --- |
| `NETIGNITE_DB_PATH` | `./data/netignite.sqlite` | `/opt/netignite/data/netignite.sqlite` | The SQLite database. |
| `NETIGNITE_DB_AUTO_MIGRATE` | `true` | `true` | Apply database migrations at startup. |
| `NETIGNITE_DB_MIGRATION_DIR` | `./drizzle/migrations` | `/opt/netignite/app/drizzle/migrations` | Where the migrations are. |
| `NETIGNITE_CONFIG_BASE_DIR` | `./config` | `/opt/netignite/config` | Directory for `secrets.key` and `initial_admin_password_reset_token.txt`. |
| `NETIGNITE_LOG_DIR` | `./data/logs` | `/opt/netignite/data/logs` | Log files of background tasks. The server's own log goes to stdout. |

### ESP32 firmware

| Variable | Default | Docker image | Description |
| --- | --- | --- | --- |
| `NETIGNITE_FIRMWARE_SYNC` | `true` | | Download new firmware releases from GitHub at startup and every 6 hours. `false` for servers without internet access; admins can still click **Sync now**. |
| `NETIGNITE_FIRMWARE_REPO` | `NetIgnite-project/Agent-ESP32` | | The GitHub repository (`owner/name`) whose releases are synced, for example a fork. |
| `NETIGNITE_FIRMWARE_DIR` | `./data/firmware` | `/opt/netignite/data/firmware` | Where synced releases are stored. |
| `NETIGNITE_FIRMWARE_PUBLIC_KEY` | — | | Path to a PEM file with an ECDSA P-256 public key. When set, only releases with a valid `firmware.sig` are synced. If the file can't be read, every sync fails with the reason (shown in Server Settings) and no firmware is accepted. |
| `NETIGNITE_GITHUB_TOKEN` | — | | A GitHub token for the release sync; raises GitHub's API rate limit. |

### Linux agent installer

| Variable | Default | Docker image | Description |
| --- | --- | --- | --- |
| `NETIGNITE_LINUX_AGENT_REPO` | `NetIgnite-project/Agent-Linux` | | GitHub repository that `/install/linux.sh` downloads the agent from. |
| `NETIGNITE_LINUX_AGENT_VERSION` | — | | A release tag such as `v1.0.0`. Without it, the script installs the newest stable release, or the newest pre-release while there is no stable one. |

### Email

Email is used for password-reset links (**Forgot password** on the login page). Without
`NETIGNITE_SMTP_HOST`, email is off; admins then reset passwords under **Admin → Users**.

| Variable | Default | Docker image | Description |
| --- | --- | --- | --- |
| `NETIGNITE_SMTP_HOST` | — | | SMTP server. Setting it turns email on. |
| `NETIGNITE_SMTP_PORT` | `587` | | SMTP port. |
| `NETIGNITE_SMTP_SECURE` | `false` | | `true` for implicit TLS (usually port `465`). |
| `NETIGNITE_SMTP_USERNAME` | — | | SMTP user; without it the server doesn't log in. |
| `NETIGNITE_SMTP_PASSWORD` | — | | SMTP password. |
| `NETIGNITE_SMTP_FROM` | `"NetIgnite" <noreply@netignite.dev>` | | Sender address. |

### Runtime

These aren't NetIgnite settings but are read by the runtime:

| Variable | Default | Docker image | Description |
| --- | --- | --- | --- |
| `NITRO_PORT` (or `PORT`) | `3000` | `18232` | HTTP port. `bun run start` sets `PORT=18232`. |
| `NITRO_HOST` (or `HOST`) | all interfaces | `::` | Address the server binds to. |
| `NUXT_PUBLIC_APP_URL` | `NETIGNITE_APP_URL` | | Overrides the URL the dashboard in the browser uses. You normally don't need it. |

To use another port with Docker, change the published port instead, for example `"8080:18232"`.

## The public URL

`NETIGNITE_APP_URL` must be the address users type into the browser, because:

- the dashboard sends its API requests to `<NETIGNITE_APP_URL>/api/v1`,
- the API only allows cross-origin requests from it, and the agent console (`/ws/console`) only
  accepts connections from a page on it,
- password-reset links and the first admin's link point to it,
- the ESP32 web installer and the Linux agent's setup command use it as the server address for
  agents (you can change the address the ESP32 uses in the installer).

If users open NetIgnite under another address, the dashboard can't reach its API. Use one public
host name, at the root of the host (no sub-path), with HTTPS.

## Server settings in the dashboard

Admins find these under **Admin → Server Settings**. They're stored in the database.

| Setting | Default | Description |
| --- | --- | --- |
| **Public sign-up** | off | Anyone who can open the server can create an account at `/auth/signup`. See [Users & Accounts](/docs/server/users#public-sign-up). |
| **Default channel** | Stable releases | Which ESP32 firmware release is recommended in the installer and offered as an update: *Stable releases* or *Include pre-releases*. Users can still pick any synced release. |

The same page shows the firmware sync state, the synced releases and the **Sync now** button.

## Firmware sync

The server offers ESP32 firmware for the [web installer](/docs/agents/esp32#install-from-the-browser)
and for [updates over the network](/docs/guides/agents#firmware-updates). Firmware only comes from
the GitHub releases of `NETIGNITE_FIRMWARE_REPO`; there are no uploads.

A sync reads the repository's releases and keeps the 5 newest ones plus the newest stable release
in `NETIGNITE_FIRMWARE_DIR`. A release is used if:

- its tag is a version like `v2.0.0` or `v2.1.0-beta.1`,
- it has a `release.json` for the agent protocol 2 and all files it lists,
- every file matches the size and SHA-256 in `release.json` (files up to 4 MB),
- with `NETIGNITE_FIRMWARE_PUBLIC_KEY` set: its `firmware.sig` is a valid signature of the app image.

Skipped releases appear in the server log and in the toast after **Sync now**. Releases that drop
out of the newest ones are deleted. See [Release signing](/docs/agents/esp32#release-signing) for
how releases are signed.

## Data paths and backup

| Path (Docker) | Content |
| --- | --- |
| `/opt/netignite/data/netignite.sqlite` | Database: users, sessions, API keys, agents, devices, shares, favorites, SSH logins, firmware list, settings. |
| `/opt/netignite/data/firmware/` | Synced firmware. Can be deleted; the next sync downloads it again. |
| `/opt/netignite/config/secrets.key` | Encrypts SSH passwords and private keys. Back it up with the database. |
| `/opt/netignite/config/initial_admin_password_reset_token.txt` | The first admin's password link. Delete it after use. |

To back up the server, stop it and copy the `data/` and `config/` directories.

## Logging

The server logs to stdout and stderr. With Docker, read the log with
`docker logs netignite-server`. Lines look like this:

```text [Server log]
[2026-10-21T09:12:03.512Z] [INFO] Agent 3 online (esp32 2.0.0)
```

| Level | Used for |
| --- | --- |
| `debug` | Detailed diagnostics |
| `info` | Startup steps, agents connecting and disconnecting, enrollments, firmware syncs and updates |
| `warn` | Recoverable problems, skipped firmware releases, unresponsive agents |
| `error` | Failed operations |
| `critical` | Errors that stop the server |

::note
The first admin's password link is logged at level `info`. With `NETIGNITE_LOG_LEVEL` set to `warn`
or higher, it's only in `initial_admin_password_reset_token.txt`.
::
