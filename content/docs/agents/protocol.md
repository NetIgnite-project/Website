---
title: "Agent Protocol v2"
description: "The WebSocket protocol between the NetIgnite server and its agents: enrollment, frames, HELLO, capabilities, every command and event, close codes and an example agent."
navigation:
  title: Agent Protocol
---

# Agent Protocol v2

Agents talk to the NetIgnite server over one WebSocket that the agent opens. Messages are JSON, and
the server only sends an agent the commands it said it supports, so you can write a small agent for
any platform. The server's source of truth is
[`server/lib/agents/protocol.ts`](https://github.com/NetIgnite-project/Server/blob/main/server/lib/agents/protocol.ts).

::note
Protocol v2 replaces the v1 protocol (`/api/agent-control-service`, `COMMAND:ID:JSON` text frames,
HTTP Basic authentication). v1 agents can't connect to a v2 server.
::

## Overview

1. The agent **enrolls** once with a single-use token and a secret it generated, and gets a token
   ID.
2. It **connects** to `/ws/agent` with its credential and sends `HELLO` with its capabilities.
3. The server sends **requests**; the agent answers each one. The agent can send **events** at any
   time after `HELLO`.

## Enrollment

The owner creates an enrollment token in the dashboard (**Create setup command** on the agent's
page, or `POST /api/v1/agents/<id>/enrollments`). It looks like `netignite_enroll_<id>:<base>`,
works once and expires after 15 minutes.

The agent generates a secret of 32 to 128 characters from `A-Z a-z 0-9 _ -` (the official agents
use 32 random bytes as 64 hex characters) and sends it with the token:

```http
POST /api/v1/agents/enroll HTTP/1.1
Host: netignite.example.com
Content-Type: application/json

{ "enrollment_token": "netignite_enroll_…", "secret": "<the agent's secret>", "kind": "linux" }
```

`kind` (`esp32` or `linux`) is optional. With it, the server refuses a token that belongs to an
agent of another kind before using it up.

```json
{
	"success": true,
	"code": 200,
	"message": "Agent enrolled",
	"data": { "agent_id": 3, "kind": "linux", "token_id": "9f2c…" }
}
```

| Status | Meaning |
| --- | --- |
| `200` | Enrolled. The agent's credential is `netignite_agent_<token_id>:<secret>`. |
| `400` | Invalid body or secret. |
| `401` | Unknown, used or expired token. Get a new one. |
| `409` | The token is for another kind of agent. It stays valid. |
| `429` | More than 20 attempts from one address in 5 minutes. |

The server stores only a hash of the secret. Enrolling again replaces the agent's credential and
disconnects a connection that uses the old one (close code `4003`).

## Connecting

| Setting | Value |
| --- | --- |
| **URL** | `wss://<server>/ws/agent` (`ws://` for an `http://` server) |
| **Authentication** | `Authorization: Bearer netignite_agent_<token_id>:<secret>` on the upgrade request |
| **Subprotocol** | None |
| **Frames** | UTF-8 text frames with one JSON object each, at most 64 KiB from the agent |

```http
GET /ws/agent HTTP/1.1
Host: netignite.example.com
Upgrade: websocket
Connection: Upgrade
Authorization: Bearer netignite_agent_9f2c…:3a7d…
```

- Without a valid credential, the server answers the upgrade with HTTP `401`.
- Each agent has one connection. When it connects again, the server closes the older connection
  with `4000`.
- Browsers can't set the `Authorization` header on WebSockets, so agents can't run in a browser.

## Frames

```json
{ "t": "req", "id": 7, "cmd": "WAKE", "p": { "mac": "AA:BB:CC:DD:EE:FF", "port": 9 } }
{ "t": "res", "id": 7, "ok": true, "p": {} }
{ "t": "res", "id": 7, "ok": false, "err": "The agent has no network connection" }
{ "t": "evt", "cmd": "HELLO", "p": { … } }
```

| Field | Description |
| --- | --- |
| `t` | `req`: a request from the server. `res`: the agent's answer. `evt`: an event from the agent, without an answer. |
| `id` | `req`/`res`: a number from `0` to `4294967295`. The answer carries the request's `id`. |
| `cmd` | `req`/`evt`: the command or event name, for example `WAKE`. Case-sensitive. |
| `p` | The payload object. Optional in `res`; defaults to `{}`. |
| `ok`, `err` | `res`: whether the request succeeded, and an error message of up to 1024 characters. The dashboard shows `err` to the user. |

Several requests can be in flight; answer them in any order. The server drops frames that aren't
valid JSON or don't match this shape, answers requests from the agent with
`{ "ok": false, "err": "Unknown command …" }`, and ignores answers to unknown IDs.

## HELLO

The first frame the agent sends. It must arrive within 10 seconds of connecting.

```json
{
	"t": "evt",
	"cmd": "HELLO",
	"p": {
		"protocol": 2,
		"kind": "linux",
		"version": "1.0.0",
		"capabilities": ["host.status", "host.control"],
		"info": { "hostname": "nas", "uptime_s": 86400 }
	}
}
```

| Field | Description |
| --- | --- |
| `protocol` | `2`. |
| `kind` | `esp32` or `linux`; must match the agent's kind in the dashboard. |
| `version` | The agent's version, 1–64 characters. Shown in the dashboard and compared for firmware updates. |
| `capabilities` | What the agent supports, up to 64 strings. Unknown ones are kept, so newer agents work with older servers. |
| `info` | Optional diagnostics, shown as key/value pairs on the agent's page. |

An invalid `HELLO` closes the connection with `4001`. Events other than `HELLO` before it are
ignored. A later `HELLO` updates the stored capabilities, version and info.

## Capabilities

| Capability | Enables | ESP32 | Linux, host mode | Linux, Wake-on-LAN mode |
| --- | --- | --- | --- | --- |
| `wake` | `WAKE` | ✓ | | ✓ |
| `status.link_local` | `STATUS` with a `link_local` target | ✓ | | ✓ |
| `status.ip` | `STATUS` with an `ip` target | ✓ | | ✓ |
| `status.host` | `STATUS` with a `host` target | ✓ | | ✓ |
| `status.tcp` | `STATUS` with a `tcp_port` | ✓ | | ✓ |
| `host.status` | The agent runs on the device it reports (`HOST_STATUS` events) | | ✓ | ✓ |
| `host.control` | `HOST_CONTROL` | | ✓ | ✓ |
| `ota` | `OTA_BEGIN` and `OTA_PROGRESS` (ESP32 agents only) | ✓ | | |
| `logs` | `GET_LOGS`, `LOG_SUBSCRIBE` and `LOG` | ✓ | | |
| `config` | `GET_INFO`, `CONFIG_SET` | ✓ | | |
| `device.reboot` | `REBOOT` | ✓ | | |
| `device.reset` | `FACTORY_RESET` | ✓ | | |
| `ssh` | `SSH_CHECK`, `SSH_EXEC` | ✓ | | ✓ |

`PING` needs no capability. A command without its capability fails on the server with
*… doesn't support …* and is never sent.

## Requests

The server waits for each answer; after the timeout the request fails (*The agent didn't answer in
time*).

| Request | Timeout |
| --- | --- |
| `WAKE`, `GET_LOGS`, `GET_INFO`, `CONFIG_SET`, `REBOOT`, `FACTORY_RESET` | 5 s |
| `STATUS` | 6 s |
| `PING`, `HOST_CONTROL`, `OTA_BEGIN`, `LOG_SUBSCRIBE`, `SSH_CHECK` | 10 s |
| `SSH_EXEC` | 15 s |

### PING

Keep-alive. The server sends it every 30 seconds after `HELLO`.

| Request | Answer |
| --- | --- |
| `{}` | `{}` |

### WAKE

Send a Wake-on-LAN magic packet: 6 bytes `0xFF`, then the 6-byte MAC address 16 times, as a UDP
broadcast to the local network.

| Request field | Type | Description |
| --- | --- | --- |
| `mac` | string | Target MAC address, `AA:BB:CC:DD:EE:FF` (uppercase, colons). |
| `port` | number | UDP port, `1`–`65535`, usually `9`. |

Answer `{}` once the packet was sent, or `ok: false` with the reason.

### STATUS

Check whether a device is online. Online means *any* requested probe answered.

| Request field | Type | Description |
| --- | --- | --- |
| `target` | object | `{ "type": "link_local", "mac": "AA:BB:CC:DD:EE:FF" }`: the IPv6 link-local (EUI-64) address derived from the MAC. `{ "type": "ip", "address": "192.168.1.20" }`: an IPv4 or IPv6 address, possibly with a zone (`fe80::1%eth0`). `{ "type": "host", "host": "nas.local" }`: a host name. |
| `icmp` | boolean | Ping the target. `false` for the *SSH port* check. |
| `tcp_port` | number | Optional: also try a TCP connection to this port. |

| Answer field | Type | Description |
| --- | --- | --- |
| `online` | boolean | Whether the device answered. |

Answer within the 6-second timeout; the official agents give up after 4.5 seconds. `ok: false`
(for example an unresolvable host name) shows as *Unknown* with the error as the reason.

### HOST_CONTROL

Shut down or reboot the machine the agent runs on.

| Request field | Type | Description |
| --- | --- | --- |
| `action` | `"shutdown"` \| `"reboot"` | What to do. |

Answer `{}` first, then act: once the machine goes down, the answer can't be sent anymore.

### OTA_BEGIN

Install a firmware update (ESP32 agents).

| Request field | Type | Description |
| --- | --- | --- |
| `version` | string | The new version. |
| `path` | string | Where to download the image on the agent's server, for example `/api/v1/firmware/2.1.0/files/firmware.bin`. Download it with the agent's own `Authorization` header. |
| `size` | number | Image size in bytes. |
| `sha256` | string | SHA-256 of the image, 64 hex characters. |
| `signature` | string | Optional: the ECDSA P-256 signature (DER, hex) of the image. |

Answer `{}` when the download has started. Report progress with `OTA_PROGRESS` events, restart into
the new firmware and send a `HELLO` with the new version. If the new firmware fails and the agent
went back to the old one, its `HELLO` `info` contains `"ota_failed_version": "<version>"`. The
server counts an update as failed after 15 minutes.

### GET_LOGS

| Request | Answer |
| --- | --- |
| `{}` | `{ "lines": ["…"], "level": "info" }`: the stored log lines, oldest first, and the log level (`error`, `warn`, `info` or `debug`). Both optional. |

### LOG_SUBSCRIBE

| Request field | Type | Description |
| --- | --- | --- |
| `enabled` | boolean | Start or stop sending `LOG` events. |

With `enabled: true`, answer like `GET_LOGS` and then send new lines as `LOG` events until the
server sends `enabled: false`. The server subscribes while someone has the agent's console open.

### GET_INFO

| Request | Answer |
| --- | --- |
| `{}` | `{ "version": "…", "info": { … } }`: the same diagnostics as `HELLO`'s `info`. The server stores them. |

### CONFIG_SET

Change settings stored on the agent. Only the fields present change.

| Request field | Type | Description |
| --- | --- | --- |
| `server_url` | string | New server URL (`http://` or `https://`). |
| `name` | string | Host name: letters, digits and `-`, at most 63 characters. |
| `log_level` | `"error"` \| `"warn"` \| `"info"` \| `"debug"` | Log level. |
| `ip` | object | `{ "mode": "dhcp" }`, or `{ "mode": "static", "address", "gateway", "netmask", "dns1"?, "dns2"? }` with IPv4 addresses. |

Answer `{}` when the change was accepted. The ESP32 agent tries a new `server_url` or `ip` first
and keeps it only if it reaches the server within 2 minutes.

### REBOOT and FACTORY_RESET

| Request | Answer |
| --- | --- |
| `{}` | `{}`, then restart. `FACTORY_RESET` erases Wi-Fi, server and credential first. The server revokes the agent's credential after a successful `FACTORY_RESET`. |

### SSH_CHECK

Log in to a device over SSH without opening a session, so no command (not even a forced one) runs.

| Request field | Type | Description |
| --- | --- | --- |
| `host` | string | Host name or IP address. |
| `port` | number | SSH port. |
| `username` | string | User name. |
| `auth` | object | `{ "type": "password", "password": "…" }` or `{ "type": "key", "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----…" }`. |
| `host_key` | string \| null | The trusted host key fingerprint (`SHA256:…`), or `null` before it's trusted. If the device presents another key, stop before sending any credential. |

| Answer field | Type | Description |
| --- | --- | --- |
| `online` | boolean | Whether the SSH port accepted the connection. |
| `host_key` | string | The device's host key fingerprint, `SHA256:` plus unpadded base64 (as `ssh-keygen -l` shows it). |
| `authenticated` | boolean | Whether the login worked. |
| `error` | string | `host_key_mismatch`, `auth_failed` or a short message. |

### SSH_EXEC

Log in and run a fixed shutdown or reboot command. The request contains the `SSH_CHECK` fields
(with a trusted `host_key`, never `null`) and:

| Request field | Type | Description |
| --- | --- | --- |
| `action` | `"shutdown"` \| `"reboot"` | What to do. |
| `os` | `"posix"` \| `"windows"` | Which command: `shutdown -h now` / `shutdown -r now`, or `shutdown /s /t 0` / `shutdown /r /t 0`. |
| `sudo` | boolean | POSIX: prefix the command with `sudo -n `. |

Answer `{}` when the command ran (or the connection dropped because the device went down), or
`ok: false` with the error, for example `sudo: a password is required`. Never run anything else, and
don't keep the credentials after the request.

## Events

### LOG

| Field | Type | Description |
| --- | --- | --- |
| `lines` | string[] | New log lines, at most 500 per event and 1024 characters per line. |
| `dropped` | number | Optional: lines the agent dropped because its buffer was full. |

### OTA_PROGRESS

| Field | Type | Description |
| --- | --- | --- |
| `version` | string | The version being installed. |
| `state` | `"downloading"` \| `"installed"` \| `"failed"` | `installed`: the agent restarts next. |
| `percent` | number | `0`–`100`. |
| `error` | string | Optional: why it failed. |

### HOST_STATUS

Sent by the Linux agent after `HELLO` and every 5 minutes: `{ "hostname": "nas", "uptime_s": 86400 }`.
The current server accepts and ignores it; the device's status comes from the connection itself.

## Keep-alive and close codes

The server sends `PING` every 30 seconds and closes a connection that sent nothing for 75 seconds.
Agents should treat 100 seconds without any frame from the server as a dead connection and
reconnect, with a backoff (the official agents: 5 seconds, doubling up to 60 seconds).

| Code | Meaning | What the agent should do |
| --- | --- | --- |
| `1001` | The server is shutting down. | Reconnect. |
| `4000` | Replaced: the same agent connected again. | Wait before reconnecting (the Linux agent waits 60 seconds); two copies may be running. |
| `4001` | No valid `HELLO` within 10 seconds, wrong protocol or kind. | Fix the `HELLO`. |
| `4002` | No message for 75 seconds. | Reconnect. |
| `4003` | Credential revoked: enrolled again, revoked or reset in the dashboard. | Stop; enroll again. |
| `4004` | The agent was deleted. | Stop. |

## Example agent

A minimal agent for [Bun](https://bun.sh) that wakes devices. In the dashboard, create an agent of
the kind **Linux agent** (custom agents use that kind), click **Create setup command** and copy the
token (`netignite_enroll_…`) from the command. Set your server and your subnet's broadcast address:

```ts [agent.ts]
// bun run agent.ts <enrollment-token>   (first run)
// bun run agent.ts                      (afterwards)
import { createSocket } from "node:dgram";
import { readFileSync, writeFileSync } from "node:fs";

const SERVER = "https://netignite.example.com";
const BROADCAST = "192.168.1.255";
const CREDENTIAL_FILE = "./netignite-agent.json";

type Payload = Record<string, unknown>;

async function enroll(token: string): Promise<string> {
	// The agent's own secret: 32 random bytes as 64 hex characters.
	const secret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex");
	const response = await fetch(`${SERVER}/api/v1/agents/enroll`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ enrollment_token: token, secret, kind: "linux" }),
	});
	const body = await response.json();
	if (!body.success) throw new Error(`Enrollment failed: ${body.message}`);

	const credential = `netignite_agent_${body.data.token_id}:${secret}`;
	writeFileSync(CREDENTIAL_FILE, JSON.stringify({ credential }), { mode: 0o600 });
	return credential;
}

function sendMagicPacket(mac: string, port: number) {
	const bytes = mac.split(":").map((part) => Number.parseInt(part, 16));
	// 6 × 0xFF, then the MAC address 16 times.
	const packet = Buffer.alloc(102, 0xff);
	for (let i = 0; i < 16; i++) Buffer.from(bytes).copy(packet, 6 + i * 6);

	const socket = createSocket("udp4");
	socket.bind(() => {
		socket.setBroadcast(true);
		socket.send(packet, port, BROADCAST, () => socket.close());
	});
}

function handle(cmd: string, p: Payload): Payload {
	switch (cmd) {
		case "PING":
			return {};
		case "WAKE":
			sendMagicPacket(String(p.mac), Number(p.port));
			return {};
		default:
			throw new Error(`Unknown command ${cmd}`);
	}
}

function connect(credential: string) {
	const ws = new WebSocket(`${SERVER.replace(/^http/, "ws")}/ws/agent`, {
		headers: { Authorization: `Bearer ${credential}` },
	});

	ws.onopen = () => {
		const hello = { protocol: 2, kind: "linux", version: "0.1.0", capabilities: ["wake"] };
		ws.send(JSON.stringify({ t: "evt", cmd: "HELLO", p: hello }));
	};

	ws.onmessage = (event) => {
		const frame = JSON.parse(String(event.data));
		if (frame.t !== "req") return;
		try {
			const p = handle(frame.cmd, frame.p ?? {});
			ws.send(JSON.stringify({ t: "res", id: frame.id, ok: true, p }));
		} catch (error) {
			ws.send(JSON.stringify({ t: "res", id: frame.id, ok: false, err: String(error) }));
		}
	};

	ws.onclose = (event) => {
		if (event.code === 4003 || event.code === 4004) {
			console.error(`Credential revoked or agent deleted (${event.code}); enroll again.`);
			return;
		}
		console.log(`Disconnected (${event.code}), reconnecting in 10 seconds`);
		setTimeout(() => connect(credential), 10_000);
	};
}

const token = Bun.argv[2];
const credential = token
	? await enroll(token)
	: JSON.parse(readFileSync(CREDENTIAL_FILE, "utf8")).credential;
connect(credential);
```

```bash [Terminal]
bun run agent.ts netignite_enroll_…
```

The agent shows up as **Online** in the dashboard. Choose it as the **Agent** of a device and
**Power on** works. Status checks show *Unknown* until you add the `status.*` capabilities and
answer `STATUS`.
