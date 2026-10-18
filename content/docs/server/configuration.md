---
title: "Configuration"
description: "Configure the NetIgnite server: config.json, environment variables, data paths and log levels."
navigation:
  title: Configuration
---

# Configuration

The NetIgnite server is configured with a JSON file and a few environment variables. Agents and
devices are not part of the configuration. They live in the database and are managed in the
dashboard.

## config.json

The server reads `config/config.json` relative to its working directory (in Docker:
`/opt/netignite/config/config.json`). If the file is missing, the server copies the sample config
there on startup. The sample is an empty object, so all settings use their defaults.

```json [config.json]
{
	"logLevel": "info"
}
```

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `logLevel` | `"debug"` \| `"info"` \| `"warn"` \| `"error"` \| `"critical"` | `"info"` | Minimum level of log messages written to the console. |

The file is read once at startup; restart the server after changing it. Invalid JSON or an unknown
log level stops the server.

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `NITRO_PORT` | `3000` (`18232` in Docker) | Port of the dashboard, API and agent WebSocket. `PORT` works as well. |
| `NITRO_HOST` | all interfaces (`0.0.0.0` in Docker) | Address the server binds to. `HOST` works as well. |
| `CONFIG_FILE_PATH` | `./config/config.json` | Location of the config file. |
| `NETIGNITE_SAMPLE_CONFIG_PATH` | `./config/config.sample.json` (`/etc/netignite/config.sample.json` in Docker) | File copied to `CONFIG_FILE_PATH` when no config exists. |

To change the port of the Docker image, change the published port instead:
`"8080:18232"`.

## Data paths

All paths are relative to the working directory of the server process (`/opt/netignite` in
Docker).

| Path | Content |
| --- | --- |
| `data/db.sqlite` | SQLite database with users, agents and devices. Back this file up. |
| `data/initial_admin_credentials` | Admin password generated on first start. Delete it after logging in. |
| `config/config.json` | The config file above. |

The database schema is created automatically on startup. To back up the server, stop it and copy
the `data/` directory.

## Logging

The server logs to stdout/stderr only. With Docker, read the logs with
`docker logs netignite-server`.

| Level | Used for |
| --- | --- |
| `debug` | Detailed diagnostics |
| `info` | Startup steps, agent connects and disconnects |
| `warn` | Recoverable problems |
| `error` | Failed operations, WebSocket errors |
| `critical` | Errors that stop the server |

::note
The initial admin password is logged at level `info`. With `logLevel` set to `warn` or higher,
it is only written to `data/initial_admin_credentials`.
::
