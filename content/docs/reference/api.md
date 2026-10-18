---
title: "REST API"
description: "Reference for the NetIgnite server's HTTP API: authentication, accounts, agents, devices and Wake-on-LAN."
navigation:
  title: REST API
---

# REST API

The dashboard is built on the server's JSON API, and you can call the same endpoints from scripts
and automations. All paths are relative to your server, for example
`https://netignite.example.com/api/devices`.

## Basics

### Authentication

The API uses the same session cookie as the dashboard. Log in with
[`POST /api/auth/login`](#log-in) and send the returned `session` cookie with every request.
API keys aren't available yet.

```bash [Terminal]
# Log in and store the session cookie
curl -c cookies.txt -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<password>"}' \
  https://netignite.example.com/api/auth/login

# Use the cookie
curl -b cookies.txt https://netignite.example.com/api/devices
curl -b cookies.txt -X POST https://netignite.example.com/api/devices/1/wakeup
```

Every endpoint except those under `/api/auth/` requires a session. Without one, the server answers
`401` with `No session found` or `Invalid session`. Sessions last 30 days and end when the server
restarts.

### Responses

Responses share one envelope:

```json
{
	"status": "OK",
	"message": "Devices retrieved successfully.",
	"data": []
}
```

| Field | Description |
| --- | --- |
| `status` | `"OK"` on success, `"ERROR"` on failure. |
| `message` | Human-readable result. Missing on the status endpoints. |
| `data` | The result, if any. |

Errors use the matching HTTP status code: `400` for invalid input, `401` without a valid session,
`404` for agents or devices that don't exist or belong to another user, `409` for conflicts,
`503` when an agent is offline, and `500` for server errors. Updates answer `201`.

### Objects

```json [Agent]
{
	"id": 3,
	"name": "Office ESP32",
	"type": "microcontroller",
	"description": "Under the desk",
	"secret": "9f86d081884c7d65",
	"ownerID": 1
}
```

| Agent field | Type | Description |
| --- | --- | --- |
| `id` | number | Agent ID, also the Connection ID. |
| `name` | string | Display name. |
| `type` | `"server"` \| `"microcontroller"` | Agent type. |
| `description` | string | Free text; may be empty. |
| `secret` | string | Connection Secret. Must not contain `:`. |
| `ownerID` | number | ID of the owning user. |

```json [Device]
{
	"id": 1,
	"name": "Gaming PC",
	"type": "desktop",
	"description": null,
	"macAddress": "AA:BB:CC:DD:EE:FF",
	"port": 9,
	"agentID": 3,
	"ownerID": 1
}
```

| Device field | Type | Description |
| --- | --- | --- |
| `id` | number | Device ID. |
| `name` | string | Display name. |
| `type` | `"server"` \| `"desktop"` \| `"laptop"` \| `"printer"` \| `"nas"` | Device type. |
| `description` | string \| null | Free text. |
| `macAddress` | string | MAC address, `AA:BB:CC:DD:EE:FF` or `AA-BB-CC-DD-EE-FF`. |
| `port` | number | Wake-on-LAN UDP port, `0`–`65535` (usually `9`). |
| `agentID` | number | ID of the agent that wakes this device. |
| `ownerID` | number | ID of the owning user. |

`id` and `ownerID` are set by the server. Leave them out of request bodies.

## Authentication

### Log in

`POST /api/auth/login`

| Body field | Type | Required |
| --- | --- | --- |
| `username` | string | yes |
| `password` | string | yes |

Sets the `session` cookie and answers `200` with `Login successful`. Wrong credentials return
`401` with `No matching credentials found`.

### Log out

`POST /api/auth/logout`

Ends the session and clears the cookie. Always answers `200`.

### Get the session

`GET /api/auth/session`

Returns the logged-in user, or `401` if there is no valid session.

```json
{
	"status": "OK",
	"message": "Session valid",
	"data": {
		"userID": 1,
		"username": "admin",
		"role": "admin",
		"favorites": [],
		"expirationTimestamp": 1792351800000
	}
}
```

## Account

### Update an account

`PUT /api/account/<userID>`

Updates the username and password of the logged-in user.

| Body field | Type | Required | Description |
| --- | --- | --- | --- |
| `username` | string | yes | New or current username. Must be unique (`409` otherwise). |
| `favorites` | number[] | yes | IDs of favorite devices. Send the current list (`[]` if none). |
| `password` | string | no | New password. Omit it or send an empty string to keep the current one. |
| `role` | `"user"` \| `"admin"` | no | See below. |

Answers `201` with `User Account updated successfully`.

**Admin mode.** Admins can add `?adminMode=true` to update the user given in the path instead of
themselves. The first user (ID `1`) can also change other users' `role`, and must send `role` when
editing someone else.

## Agents

### List agents

`GET /api/agents` returns all of your agents as an array of [agent objects](#objects), including
their secrets.

### Create an agent

`POST /api/agents`

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `type` | `"server"` \| `"microcontroller"` | yes |
| `description` | string | yes (may be empty) |
| `secret` | string | yes |

Answers `201`; `data` is the new agent's ID. The agent can connect right away.

### Get agent statuses

`GET /api/agents/status?ids=1,2`

Returns the connection status of your agents as a map from agent ID to `"online"`, `"offline"`
or `"unknown"`. Without `ids`, all of your agents are included.

```json
{ "status": "OK", "data": { "1": "online", "2": "offline" } }
```

### Get an agent

`GET /api/agents/<id>` returns one [agent object](#objects), or `404`.

### Update an agent

`PUT /api/agents/<id>` takes the same body as [Create an agent](#create-an-agent) and answers
`201`. If the secret changes, the agent is disconnected and has to reconnect with the new secret.

### Delete an agent

`DELETE /api/agents/<id>` answers `200`, or `404` if the agent doesn't exist. Devices assigned to
the agent are not deleted; reassign them first.

## Devices

### List devices

`GET /api/devices` returns all of your devices as an array of [device objects](#objects). Add
`?onlyFavorites=true` to return only the devices in your favorites list.

### Create a device

`POST /api/devices`

| Body field | Type | Required |
| --- | --- | --- |
| `name` | string | yes |
| `type` | `"server"` \| `"desktop"` \| `"laptop"` \| `"printer"` \| `"nas"` | yes |
| `description` | string | no |
| `macAddress` | string | yes |
| `port` | number (`0`–`65535`) | yes |
| `agentID` | number | yes |

Answers `201`; `data` is the new device's ID. A non-existent `agentID` returns `400` with
`No matching agent found for the given AgentID`.

### Get device statuses

`GET /api/devices/status?ids=1,2`

Asks each device's agent whether the device is online and returns a map from device ID to
`"online"`, `"offline"` or `"unknown"`. Without `ids`, all of your devices are checked. The
devices are checked one after another, and each check can take up to 5 seconds, so filter with
`ids` when you only need a few.

```json
{ "status": "OK", "data": { "1": "online", "4": "unknown" } }
```

### Get a device

`GET /api/devices/<id>` returns one [device object](#objects), or `404`.

### Update a device

`PUT /api/devices/<id>` takes the same body as [Create a device](#create-a-device) and answers
`201`.

### Delete a device

`DELETE /api/devices/<id>` answers `200`, or `404` if the device doesn't exist.

### Wake a device

`POST /api/devices/<id>/wakeup` (no body)

Sends a Wake-on-LAN command through the device's agent.

| Status | Message | Meaning |
| --- | --- | --- |
| `200` | `Wakeup command sent` | The agent sent the magic packet. |
| `404` | `Device not found or inaccessible by user` / `Agent not found` | Unknown device, or its agent no longer exists. |
| `503` | `Agent is offline` | The agent isn't connected. |
| `500` | `Failed to send wakeup command` | The agent didn't answer within 5 seconds. |
| `500` | `Wakeup command failed: …` | The agent rejected the command, for example because of an invalid MAC address. |

## Agent WebSocket

`/api/agent-control-service` is the WebSocket endpoint for agents, not a REST endpoint. See
[Agent Protocol](/docs/agents/protocol).
