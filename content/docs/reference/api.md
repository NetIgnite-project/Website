---
title: "REST API"
description: "The NetIgnite server's HTTP API: authentication with logins and API keys, the response envelope, the OpenAPI reference and the most important endpoints."
navigation:
  title: REST API
---

# REST API

The dashboard is built on the server's JSON API, and you can call the same endpoints from scripts
and automations. The API lives under `/api/v1` on your server, for example
`https://netignite.example.com/api/v1/devices`.

::tip
Every server includes a complete, interactive **OpenAPI reference** at `/api/docs/v1` (the
dashboard links it as **API Reference**), with all request and response schemas. The OpenAPI
document itself is at `/api/docs/v1/openapi`. Admins can turn both off with
`NETIGNITE_API_DISABLE_DOCS=true`. This page covers the basics and the most important endpoints.
::

## Authentication

Requests authenticate with a bearer token:

```http
Authorization: Bearer <token>
```

| Token | Looks like | Get it | Valid |
| --- | --- | --- | --- |
| **API key** | `netignite_apikey_…` | **Settings → API Keys** in the dashboard | Until it expires or is deleted |
| **Login (session)** | `netignite_sess_…` | `POST /api/v1/auth/login` | 7 days, or until logout |

Use an API key for scripts. It works for agents, devices, firmware and (for admins) the admin
endpoints. The endpoints under `/account` (your profile, password and API keys) and
`/auth/session` and `/auth/logout` need a login token.

```bash [Terminal]
curl -H "Authorization: Bearer netignite_apikey_…" \
  https://netignite.example.com/api/v1/devices

curl -X POST -H "Authorization: Bearer netignite_apikey_…" \
  https://netignite.example.com/api/v1/devices/4/power-on
```

To get a login token instead:

```bash [Terminal]
curl -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<password>"}' \
  https://netignite.example.com/api/v1/auth/login
```

The answer's `data.token` is the login token. After 5 failed logins for a username from one address
(15 from all addresses), the server answers `429` for 5 minutes.

## Responses

Every response uses the same envelope:

```json
{
	"success": true,
	"code": 200,
	"message": "Devices retrieved",
	"data": []
}
```

| Field | Description |
| --- | --- |
| `success` | `true` or `false`. |
| `code` | The HTTP status code. |
| `message` | Human-readable result. The dashboard shows error messages as they are. |
| `data` | The result; `null` if there is none. Missing on errors. |

| Status | Meaning |
| --- | --- |
| `200`, `201`, `202` | Success. `202`: a firmware update was started or queued. |
| `400` | Invalid input. |
| `401` | No or an invalid token, or the endpoint needs a login token. |
| `403` | Not allowed, for example your role on a shared device or a non-admin calling an admin endpoint. |
| `404` | Not found, or not yours. |
| `409` | Conflict, for example a duplicate username, or a device without an agent or method for the action. |
| `429` | Rate limit. |
| `502` | The agent reported an error. |
| `503` | The agent is offline. |
| `504` | The agent didn't answer in time. |

Timestamps are Unix times in milliseconds.

## Devices

All endpoints return the devices you own and the devices shared with you; your role on each is in
`access_role`.

| Method and path | Description |
| --- | --- |
| `GET /devices` | List devices. |
| `POST /devices` | Create a device. |
| `GET /devices/<id>` | Get a device. |
| `PUT /devices/<id>` | Change a device (owner, manager; agents: owner only). All fields optional. |
| `DELETE /devices/<id>` | Delete a device (owner). |
| `POST /devices/<id>/power-on` | Send Wake-on-LAN (owner, manager, operator). |
| `POST /devices/<id>/shutdown` | Shut down through the Linux agent on the device or SSH (owner, manager, operator). |
| `POST /devices/<id>/reboot` | Reboot, like shutdown. |
| `POST /devices/<id>/status` | Check the status now and return it (at most every 5 seconds per device). |
| `PUT /devices/<id>/favorite` | Add to your favorites. `DELETE` removes it. |

```json [Device]
{
	"id": 4,
	"name": "Gaming PC",
	"type": "desktop",
	"description": "",
	"mac_address": "AA:BB:CC:DD:EE:FF",
	"wol_port": 9,
	"agent_id": 3,
	"status_method": "ipv4",
	"status_address": "192.168.1.20",
	"status_tcp_port": 3389,
	"host_agent_id": null,
	"created_at": 1792351800000,
	"access_role": "owner",
	"owner": { "id": 1, "username": "admin", "display_name": "Admin" },
	"agent": { "id": 3, "name": "Office ESP32", "kind": "esp32", "state": "online" },
	"host_agent": null,
	"favorite": true,
	"status": { "state": "online", "checked_at": 1792351812000 },
	"actions": { "power_on": true, "shutdown": false, "reboot": false }
}
```

| Field | Description |
| --- | --- |
| `type` | `server`, `desktop`, `laptop`, `printer`, `nas` or `other`. |
| `mac_address` | `AA:BB:CC:DD:EE:FF` or `AA-BB-CC-DD-EE-FF` in requests; stored with colons in uppercase. |
| `wol_port` | `1`–`65535`, default `9`. |
| `agent_id` | The agent that wakes and checks the device, or `null`. |
| `status_method` | `none` (default), `link_local`, `ipv4`, `ipv6`, `ssh` or `host_agent`. See [Status checks](/docs/guides/devices#status-checks). |
| `status_address` | Required for `ipv4` (IPv4 address), `ipv6` (IPv6 address) and `ssh` (IP address or host name). |
| `status_tcp_port` | Optional extra TCP probe; the port for `ssh` (default `22`). |
| `host_agent_id` | The Linux agent running on the device, or `null`. |
| `access_role` | `owner`, `manager`, `operator` or `viewer`. |
| `status` | `state` (`online`, `offline`, `unknown`), `checked_at` and, for `unknown`, a `reason`. |
| `actions` | Which power actions are possible right now for you. |

Required when creating: `name`, `type` and `mac_address`. Agents must be your own;
`host_agent_id` must be a Linux agent.

### Sharing

Owner only, except leaving a device.

| Method and path | Description |
| --- | --- |
| `GET /devices/<id>/shares` | List the shares: `user`, `role`, `created_at`. |
| `POST /devices/<id>/shares` | Share: `{ "user": "<username or email>", "role": "viewer" \| "operator" \| "manager" }`. |
| `PUT /devices/<id>/shares/<user-id>` | Change the role: `{ "role": "manager" }`. |
| `DELETE /devices/<id>/shares/<user-id>` | Remove a share. With your own user ID, you leave a shared device. |

### SSH login

Owner only. The password or private key is never returned. See [SSH](/docs/guides/ssh).

| Method and path | Description |
| --- | --- |
| `GET /devices/<id>/ssh` | The login without its secret, with `authorized_keys` and `sudoers` lines. |
| `PUT /devices/<id>/ssh` | Set the login: `host` (or `null` for the status address), `port`, `username`, `os` (`posix`, `windows`), `sudo`, and `auth`: `{ "type": "generate_key" }`, `{ "type": "password", "password": "…" }` or `{ "type": "keep" }`. |
| `DELETE /devices/<id>/ssh` | Remove the login. |
| `POST /devices/<id>/ssh/test` | Let the device's agent log in and report the host key: `online`, `authenticated`, `host_key`, `trusted`, `error`. |
| `POST /devices/<id>/ssh/trust` | Trust a host key: `{ "host_key": "SHA256:…" }`. |

## Agents

Agents are never shared: these endpoints only see your own.

| Method and path | Description |
| --- | --- |
| `GET /agents` | List agents. |
| `POST /agents` | Create an agent: `{ "name": "…", "description": "…", "kind": "esp32" \| "linux" }`. |
| `GET /agents/<id>` | Get an agent. |
| `PUT /agents/<id>` | Change `name` and `description`. |
| `DELETE /agents/<id>` | Delete and disconnect. Its devices keep their settings without an agent. |
| `POST /agents/<id>/enrollments` | Create a single-use enrollment token (15 minutes): `{ "token", "expires_at" }`. |
| `POST /agents/<id>/revoke` | Revoke the credential and disconnect. |
| `POST /agents/<id>/flash-image` | ESP32: the NVS image for the web installer: `{ "version": "…", "server_url"?: "…" }` → `{ "image" (base64), "offset", "server_url", "expires_at" }`. Contains a new enrollment token. |
| `POST /agents/<id>/update` | ESP32: start a firmware update: `{ "version"?: "…" }` (default: the recommended release). |
| `POST /agents/bulk-update` | ESP32: update several agents one after another: `{ "agent_ids": [3, 5], "version"?: "…" }` → `{ "version", "queued", "skipped" }`. |
| `GET /agents/<id>/logs` | The agent's stored log lines and log level. |
| `GET /agents/<id>/info` | Ask the agent for current diagnostics. |
| `PUT /agents/<id>/device-config` | Change settings on the agent: `server_url`, `name`, `log_level`, `ip`. |
| `POST /agents/<id>/reboot` | Restart the agent. |
| `POST /agents/<id>/factory-reset` | Erase the agent's settings and revoke its credential. |
| `POST /agents/enroll` | Used by agents, without user authentication. See [Agent Protocol](/docs/agents/protocol#enrollment). |

```json [Agent]
{
	"id": 3,
	"name": "Office ESP32",
	"description": "",
	"kind": "esp32",
	"state": "online",
	"version": "2.0.0",
	"capabilities": ["wake", "status.link_local", "status.ip", "status.host", "status.tcp", "ota", "logs", "config", "device.reboot", "device.reset", "ssh"],
	"info": { "name": "Office-ESP32", "ipv4": "192.168.1.50", "rssi_dbm": -58 },
	"last_seen_at": 1792351812000,
	"enrolled_at": 1792350000000,
	"created_at": 1792349000000,
	"update": null,
	"update_available": null
}
```

`state` is `online`, `offline` or `unenrolled` (*Not set up*). `update` is the current or last
firmware update (`version`, `from_version`, `state`: `queued`, `starting`, `downloading`,
`restarting`, `done` or `failed`, `percent`, `error`), kept in memory for 24 hours.
`update_available` is a newer release of the admin's channel, if the agent can be updated.

## Firmware

| Method and path | Description |
| --- | --- |
| `GET /firmware` | The synced ESP32 releases: `{ "channel", "recommended", "releases": [...] }`, each with its flash parts, offsets and SHA-256s. |
| `GET /firmware/<version>/files/<file>` | Download a firmware file. ESP32 agents also use it with their agent credential for updates. |

## Account and authentication

| Method and path | Description |
| --- | --- |
| `POST /auth/login` | `{ "username", "password" }` → a login token in `data.token`. |
| `GET /auth/session` | The current login (login token only). |
| `POST /auth/logout` | End the current login. |
| `GET /auth/registration` | `{ "enabled": true \| false }`: whether public sign-up is on. |
| `POST /auth/signup` | Create an account while public sign-up is on: `{ "username", "email", "password", "display_name"? }`. |
| `POST /auth/reset-password/request` | Send a reset link to `{ "email" }` (needs email to be configured). |
| `POST /auth/reset-password` | `{ "reset_token", "new_password" }`. |
| `GET /account`, `PUT /account` | Your profile; changes need `current_password`. |
| `PUT /account/password` | `{ "current_password", "new_password" }`. Ends all your logins. |
| `DELETE /account` | Delete your account with its agents and devices. |
| `GET /account/apikeys`, `POST /account/apikeys` | List or create API keys: `{ "description", "expires_at": "7d" \| "30d" \| "90d" \| "180d" \| "365d" \| null }` → `{ "id", "token" }`. |
| `DELETE /account/apikeys/<id>` | Delete an API key. |

## Admin

Admins only, with a login token or an admin's API key.

| Method and path | Description |
| --- | --- |
| `GET /admin/users`, `POST /admin/users` | List users (`?role=`, `?search=`) or create one: `{ "username", "display_name", "email", "password", "role" }`. |
| `GET`, `PUT`, `DELETE /admin/users/<id>` | Get, change (`display_name`, `email`, `role`, …) or delete a user. |
| `PUT /admin/users/<id>/password` | Set a user's password and end their logins. |
| `GET /admin/settings`, `PUT /admin/settings` | `{ "registration_enabled": false, "firmware_channel": "stable" \| "prerelease" }`. |
| `GET /admin/firmware` | The firmware sync state. |
| `POST /admin/firmware/sync` | Sync firmware releases from GitHub now. |

## Other endpoints

| Path | Description |
| --- | --- |
| `GET /api/health` | `200` while the server runs. Used by Docker's health check. |
| `GET /api/docs/v1` | The OpenAPI reference. `/api` redirects there. |
| `/ws/agent` | The agent WebSocket. See [Agent Protocol](/docs/agents/protocol). |
| `/ws/console` | The live log of an agent, for the dashboard. See [below](#the-console-websocket). |
| `GET /install/linux.sh` | The Linux agent's install script. See [Linux Agent](/docs/agents/linux#install). |

### The console WebSocket

`/ws/console` streams an agent's log to a browser. The connection must come from a page on
`NETIGNITE_APP_URL` (other `Origin` headers get `403`). The first message authenticates within 10
seconds; only the agent's owner may watch it:

```json
{ "type": "auth", "token": "<login token or API key>", "agent_id": 3 }
```

The server then sends `{ "type": "ready", "online": true }`, the stored lines as
`{ "type": "lines", "lines": [...], "reset": true, "level": "info" }`, new lines as
`{ "type": "lines", "lines": [...], "reset": false }`, `{ "type": "state", "online": false }` when the
agent disconnects, and `{ "type": "error", "message": "…" }` before closing (close codes `4401`
not authenticated, `4404` agent not found, `1008` invalid message). The token is checked again
every minute.
