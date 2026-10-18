---
title: "How It Works"
description: "The building blocks of NetIgnite (server, agents and devices) and what happens when you wake a device or check its status."
navigation:
  title: How It Works
---

# How It Works

NetIgnite has three building blocks: the **server** you log in to, **agents** that live in your
networks, and the **devices** you want to power on.

```text
 Browser ──HTTPS──▶ NetIgnite Server ◀──WebSocket── Agent ──Wake-on-LAN / ping──▶ Devices
                     (dashboard + API)    (outbound      (ESP32 in    (same LAN as the agent)
                                          from the LAN)   your LAN)
```

## Concepts

**Server.** A [Nuxt](https://nuxt.com) application running on [Bun](https://bun.sh). It serves the
web dashboard and the [REST API](/docs/reference/api), and it accepts agent connections on
`/api/agent-control-service`. All of this uses one port (`18232` in the Docker image). Users,
agents and devices are stored in a SQLite database.

**Agent.** A program inside your network that connects *out* to the server over a WebSocket and
waits for commands. Because the agent dials out, you don't need port forwarding or a VPN into the
network you want to control. Every agent has a numeric **ID** and a **secret**; it authenticates
with both when it connects. The [ESP32 agent](/docs/agents/esp32) is the reference
implementation, and you can [write your own](/docs/agents/protocol).

**Device.** A machine you want to wake: a desktop PC, server, laptop, printer or NAS. A device
record stores the device's **MAC address**, the **Wake-on-LAN port** (usually `9`) and the
**agent** that is responsible for it. The agent must be in the same local network (broadcast
domain) as the device.

Agents and devices belong to the user who created them. Each user only sees their own.

## Waking a device

1. You press **Power On** in the dashboard. The browser calls
   `POST /api/devices/<id>/wakeup`.
2. The server looks up the device and its agent. If the agent isn't connected, the request fails
   with **Agent is offline**.
3. The server sends a `WAKEUP` command with the device's MAC address and port to the agent.
4. The agent broadcasts a Wake-on-LAN magic packet to its subnet (the ESP32 agent sends it three
   times, 100 ms apart) and replies `OK`.
5. The device's network card receives the packet and powers the machine on.

The agent's `OK` means that the packet was sent, not that the device actually started.
Wake-on-LAN must be enabled in the device's BIOS/UEFI and network driver. See
[Troubleshooting](/docs/reference/troubleshooting#the-device-doesnt-wake-up) if nothing happens.

## Checking device status

The dashboard refreshes device and agent status every 20 seconds.

- **Agent status** is `online` while the agent's WebSocket connection is open. The server keeps
  this state in memory and sends every connected agent a `HEARTBEAT` once a minute.
- **Device status** comes from the agent. For each device, the server sends a `GET_STATUS`
  command with the device's MAC address. The ESP32 agent derives the device's IPv6 link-local
  address from the MAC (the EUI-64 address) and pings it once.

| Status | Meaning |
| --- | --- |
| `online` | The device answered the ping. |
| `offline` | The device didn't answer within one second. |
| `unknown` | The agent is offline, didn't answer within 5 seconds, or rejected the request (for example because of a malformed MAC address). |

::warning
The EUI-64 status check only works when the device has IPv6 enabled, uses a MAC-derived
link-local address and answers ICMPv6 echo requests. Windows and many modern Linux distributions
use randomized IPv6 interface identifiers by default, so such devices show as `offline` even when
they are running. Waking them is not affected.
::

## Where data lives

| Data | Storage |
| --- | --- |
| Users, agents, devices | SQLite database `data/db.sqlite` |
| Login sessions | Server memory (a restart logs everyone out) |
| Agent connection state | Server memory |
| Server settings | `config/config.json` |

Continue with [Getting Started](/docs/getting-started) to set up your own instance.
