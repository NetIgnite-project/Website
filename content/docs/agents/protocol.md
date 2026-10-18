---
title: "Agent Protocol"
description: "The WebSocket protocol between the NetIgnite server and its agents: connection, authentication, message format and commands."
navigation:
  title: Agent Protocol
---

# Agent Protocol

Agents talk to the NetIgnite server over a single WebSocket connection that the agent opens. The
protocol is plain text and small enough to implement in a few dozen lines, so you can write an
agent for any platform: a Raspberry Pi, a NAS or a router.

## Connecting

| Setting | Value |
| --- | --- |
| **URL** | `wss://<server>/api/agent-control-service` (or `ws://` without TLS) |
| **Port** | The server's HTTP port: `443` behind a proxy, `18232` for the Docker container |
| **Authentication** | HTTP Basic, sent with the WebSocket upgrade request |
| **Subprotocol** | None |

```http
GET /api/agent-control-service HTTP/1.1
Host: netignite.example.com
Upgrade: websocket
Connection: Upgrade
Authorization: Basic MzpzM2NyM3Q=
```

The credentials are `base64("<agent ID>:<secret>")`; the example above encodes `3:s3cr3t`. The ID
is the agent's numeric **Connection ID** and the secret its **Connection Secret** (see
[Managing Agents](/docs/guides/agents)).

- The server accepts the upgrade first and checks the credentials afterwards. With a missing or
  wrong `Authorization` header, it closes the connection right away with code `1008` and reason
  `Missing or invalid credentials`.
- Each agent can have one connection. When an agent connects again, the server closes the older
  connection.
- If the agent's secret is regenerated or the agent is deleted, the server closes the connection.
- Browsers can't set the `Authorization` header on WebSockets, so agents can't run in a browser.

## Message format

Every message is a UTF-8 **text frame** with three parts separated by colons:

```text
<COMMAND>:<ID>:<JSON>
```

| Part | Description |
| --- | --- |
| `COMMAND` | The command name, for example `WAKEUP`. Case-sensitive. |
| `ID` | A decimal number from `0` to `4294967295` that identifies the request. |
| `JSON` | A JSON object with the command's payload. May itself contain colons; split only at the first two. |

The server sends commands; the agent answers each one with the **same command name and ID** and a
response object:

```text
→ WAKEUP:2876151413:{"macAddress":"AA:BB:CC:DD:EE:FF","port":9}
← WAKEUP:2876151413:{"status":"OK","message":"Wakeup successful"}
```

The server waits **5 seconds** for each response; after that it treats the command as failed.
Several commands can be pending at once, and responses may arrive in any order. They're matched by
ID.

## Commands

### WAKEUP

Send a Wake-on-LAN magic packet.

| Request field | Type | Description |
| --- | --- | --- |
| `macAddress` | string | Target MAC address, as stored in the device record (for example `AA:BB:CC:DD:EE:FF`). |
| `port` | number | UDP port for the magic packet, usually `9`. |

| Response field | Type | Description |
| --- | --- | --- |
| `status` | `"OK"` \| `"ERROR"` | Whether the packet was sent. |
| `message` | string | Human-readable result. On `ERROR`, the dashboard shows it after *Wakeup command failed:*. |

A magic packet is 6 bytes of `0xFF` followed by the 6-byte MAC address repeated 16 times, sent as
a UDP broadcast to the local subnet.

### GET_STATUS

Report whether a device is reachable.

| Request field | Type | Description |
| --- | --- | --- |
| `address` | string | The device's address. The current server always sends the device's **MAC address** here. |

| Response field | Type | Description |
| --- | --- | --- |
| `status` | `"OK"` \| `"ERROR"` | Whether the check could run. |
| `message` | string | Human-readable result. |
| `online` | `"online"` \| `"offline"` \| `"unknown"` | The device status shown in the dashboard. |

How you resolve a MAC address to something you can ping is up to the agent. The ESP32 agent pings
the device's EUI-64 IPv6 link-local address; an agent on a full computer could look the MAC up in
its ARP/neighbor table instead.

### HEARTBEAT

Sent by the server to every connected agent once a minute, with an empty payload `{}`. The server
doesn't wait for the answer; replying with `{}` is fine.

```text
→ HEARTBEAT:1739004211:{}
← HEARTBEAT:1739004211:{}
```

## Example agent

A minimal agent for [Bun](https://bun.sh) that handles all three commands. Create an agent of type
**Server** in the dashboard and fill in its credentials and your subnet's broadcast address:

```ts [agent.ts]
import { createSocket } from "node:dgram";

const SERVER_URL = "wss://netignite.example.com/api/agent-control-service";
const AGENT_ID = "3";
const AGENT_SECRET = "your-connection-secret";
const BROADCAST_ADDRESS = "192.168.1.255";

type Payload = Record<string, unknown>;

function sendMagicPacket(macAddress: string, port: number) {
	const mac = macAddress.split(/[:-]/).map((part) => Number.parseInt(part, 16));
	if (mac.length !== 6 || mac.some(Number.isNaN)) throw new Error("Invalid MAC address");

	// 6 × 0xFF, then the MAC address 16 times.
	const packet = Buffer.alloc(102, 0xff);
	for (let i = 0; i < 16; i++) Buffer.from(mac).copy(packet, 6 + i * 6);

	const socket = createSocket("udp4");
	socket.bind(() => {
		socket.setBroadcast(true);
		socket.send(packet, port, BROADCAST_ADDRESS, () => socket.close());
	});
}

function handleCommand(command: string, payload: Payload): Payload {
	switch (command) {
		case "WAKEUP":
			sendMagicPacket(String(payload.macAddress), Number(payload.port));
			return { status: "OK", message: "Wakeup successful" };
		case "GET_STATUS":
			// Look up and ping the device here, then report "online" or "offline".
			return { status: "OK", message: "Status check not implemented", online: "unknown" };
		case "HEARTBEAT":
			return {};
		default:
			return { status: "ERROR", message: "Unknown command" };
	}
}

function connect() {
	const ws = new WebSocket(SERVER_URL, {
		headers: { Authorization: `Basic ${btoa(`${AGENT_ID}:${AGENT_SECRET}`)}` },
	});

	ws.onopen = () => console.log("Connected");

	ws.onmessage = (event) => {
		const message = String(event.data);
		const first = message.indexOf(":");
		const second = message.indexOf(":", first + 1);
		const command = message.slice(0, first);
		const id = message.slice(first + 1, second);

		let response: Payload;
		try {
			response = handleCommand(command, JSON.parse(message.slice(second + 1)));
		} catch (error) {
			response = { status: "ERROR", message: String(error) };
		}
		ws.send(`${command}:${id}:${JSON.stringify(response)}`);
	};

	ws.onclose = (event) => {
		console.log(`Disconnected (${event.code} ${event.reason}), reconnecting in 10 seconds`);
		setTimeout(connect, 10_000);
	};
}

connect();
```

```bash [Terminal]
bun run agent.ts
```

The agent's status in the dashboard turns **online** as soon as it connects.
