---
title: "How It Works"
description: "The building blocks of NetIgnite (server, agents and devices) and what happens when you power on, check, shut down or share a device."
navigation:
  title: How It Works
---

# How It Works

NetIgnite has three building blocks: the **server** you log in to, **agents** that live in your
networks, and the **devices** you want to control.

```text
 Browser ──HTTPS──▶ NetIgnite Server ◀──WebSocket── Agent ──Wake-on-LAN / ping / SSH──▶ Devices
                    (dashboard, API,    (outbound     (ESP32 or      (same LAN as the agent)
                     agent gateway)      from the LAN)  Linux agent)
```

## Concepts

**Server.** A [Nuxt](https://nuxt.com) application with a [Hono](https://hono.dev) API, running on
[Bun](https://bun.sh) and storing its data in SQLite. It serves the web dashboard, the
[REST API](/docs/reference/api) under `/api/v1`, and the WebSocket endpoints `/ws/agent` (agents)
and `/ws/console` (the live log of an ESP32 agent). Everything uses one port: `18232`.

**Agent.** A program inside your network that connects *out* to the server over a WebSocket and
waits for commands. Because the agent dials out, you don't need port forwarding or a VPN into the
network you want to control. There are two kinds:

| Kind | Runs on | Does |
| --- | --- | --- |
| [ESP32](/docs/agents/esp32) | An ESP32 board in your LAN | Wakes and checks devices in its network, logs in to them over SSH, updates itself over the network. |
| [Linux agent](/docs/agents/linux) | A Linux machine with systemd | Reports the machine's own status and shuts it down or reboots it. In Wake-on-LAN mode, also wakes, checks and logs in to other devices in its network. |

You can also [write your own agent](/docs/agents/protocol).

**Device.** A machine you want to control: a desktop PC, server, laptop, printer or NAS. A device
record stores the device's **MAC address**, the **Wake-on-LAN port** (usually `9`), the **agent**
that wakes it, how its **status is checked**, and optionally the **Linux agent running on it** and
an **SSH login**. The agent must be in the same local network (broadcast domain) as the device.

Agents and devices belong to the user who created them. Agents are never shared; devices can be
[shared](/docs/guides/sharing) with other users.

## Connecting an agent

An agent proves who it is with a credential that only the agent knows:

1. In the dashboard, the agent's owner creates a **single-use enrollment token**
   (`netignite_enroll_…`, valid for 15 minutes). The ESP32 web installer writes it into the
   board's flash; for the Linux agent it's part of the setup command.
2. The agent generates a random **secret** itself and sends it with the token to
   `POST /api/v1/agents/enroll`. The server stores only a hash of the secret and answers with a
   token ID.
3. From then on, the agent connects to `/ws/agent` with
   `Authorization: Bearer netignite_agent_<token-id>:<secret>`. Its first message is a `HELLO`
   that lists its **capabilities**; the server only sends commands the agent listed.

The secret never leaves the agent and is never shown. Enrolling again (with a new token) replaces
the old credential. See [Agent Protocol](/docs/agents/protocol) for the details.

## Waking a device

1. You press **Power on**. The browser calls `POST /api/v1/devices/<id>/power-on`.
2. The server checks that you may power the device on (owner, manager or operator) and that its
   agent is online and supports Wake-on-LAN. Otherwise it answers with an error such as
   *Agent is offline*.
3. The server sends the agent a `WAKE` command with the device's MAC address and port.
4. The agent broadcasts the magic packet three times, 100 ms apart, to its subnet's broadcast
   address and to `255.255.255.255`, and answers.
5. The device's network card receives the packet and powers the machine on.

*Wake-on-LAN packet sent* means that the packet was sent, not that the device started.
Wake-on-LAN must be enabled on the device. See
[Troubleshooting](/docs/reference/troubleshooting#the-device-doesnt-wake-up) if nothing happens.

## Checking device status

The server checks every device with a status check every **20 seconds** and keeps the results;
the dashboard reads them and refreshes every 20 seconds too. Checks through the same agent run one
after another, different agents work in parallel. Each check has 6 seconds. **Check now** on a
device page runs one immediately (at most every 5 seconds per device).

| Status check | How it works |
| --- | --- |
| Off | No check. The status stays *Unknown*. |
| MAC (IPv6 link-local) | The agent pings the IPv6 link-local address derived from the MAC address (EUI-64). |
| IPv4 address / IPv6 address | The agent pings the address you enter. |
| SSH port | The agent tries a TCP connection to port 22 (or the port you enter). |
| Linux agent on the device | The device is online while the Linux agent running on it is connected. |

For the first three, you can add a **TCP port** (for example `445` or `3389`): the device then also
counts as online when that port answers. See [Devices](/docs/guides/devices#status-checks) for
when to use which.

| Status | Meaning |
| --- | --- |
| Online | The device answered. |
| Offline | The device didn't answer. |
| Unknown | No check is configured, or the check couldn't run: no agent, the agent is offline, didn't answer in time or doesn't support the check. The badge's tooltip shows the reason. |

## Shutting down and rebooting

Shutdown and reboot need one of two things:

- **The Linux agent on the device** (preferred). The server sends it `HOST_CONTROL`, and the agent
  runs `systemctl poweroff` or `systemctl reboot`. It can't do anything else, and the server holds
  no login to the device.
- **An SSH login.** The device's agent logs in to the device over SSH and runs a fixed `shutdown`
  command. The device's host key must have been trusted first. The server stores the login, so it
  should belong to a user that may only shut down and reboot. See [SSH](/docs/guides/ssh).

If a device has both, the server uses the Linux agent while it's online.

## Where data lives

| Data | Storage |
| --- | --- |
| Users, sessions, API keys, agents, devices, shares, favorites, SSH logins, the firmware list | SQLite database `data/netignite.sqlite` |
| Agent credentials, session tokens, API keys | Only as hashes in the database |
| SSH passwords and private keys | Encrypted in the database with the secrets key (`config/secrets.key` or `NETIGNITE_SECRETS_KEY`) |
| ESP32 firmware releases | `data/firmware/<version>/`, downloaded from GitHub |
| Agent connections, device status, firmware update progress | Server memory: agents reconnect and statuses are checked again after a restart |

Continue with [Getting Started](/docs/getting-started) to set up your own instance.
