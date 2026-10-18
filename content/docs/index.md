---
title: "Documentation"
description: "Learn how NetIgnite powers on devices from anywhere: self-host the server, connect an agent and wake your devices."
navigation:
  title: Overview
---

# NetIgnite Documentation

NetIgnite lets you power on computers, servers and other devices in your network from anywhere. A
small **agent** inside your network keeps a connection open to the **NetIgnite server**. When you
press **Power On** in the dashboard, the server tells the agent to send a
[Wake-on-LAN](https://en.wikipedia.org/wiki/Wake-on-LAN) magic packet to the device.

::note
NetIgnite is under active development. These docs describe the latest versions of the
[server](https://github.com/NetIgnite-project/Server/releases) and the
[ESP32 agent](https://github.com/NetIgnite-project/Agent-ESP32). Where a feature isn't available
yet, the page says so.
::

## Components

| Component | What it does | Source |
| --- | --- | --- |
| **Server** | Web dashboard, REST API and the WebSocket service that agents connect to. Stores users, agents and devices in SQLite. | [NetIgnite-project/Server](https://github.com/NetIgnite-project/Server) |
| **ESP32 Agent** | Firmware for an ESP32 that sits in your LAN, sends Wake-on-LAN packets and checks whether devices are online. | [NetIgnite-project/Agent-ESP32](https://github.com/NetIgnite-project/Agent-ESP32) |
| **Website** | This site, including the docs. | [NetIgnite-project/Website](https://github.com/NetIgnite-project/Website) |

You can use the hosted app at [app.netignite.dev](https://app.netignite.dev/) or run your own
server. All components are open source under the
[AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html).

## Where to start

::icon-card-grid
---
cards:
  - icon: i-lucide-workflow
    title: How It Works
    description: Server, agents and devices, and what happens when you press Power On.
    to: /docs/how-it-works
  - icon: i-lucide-rocket
    title: Getting Started
    description: From an empty server to your first remote wake-up.
    to: /docs/getting-started
  - icon: i-lucide-container
    title: Install the Server
    description: Run NetIgnite with Docker Compose or from source.
    to: /docs/server/installation
  - icon: i-lucide-cpu
    title: ESP32 Agent
    description: Configure, build and flash the agent firmware.
    to: /docs/agents/esp32
  - icon: i-lucide-cable
    title: Agent Protocol
    description: The WebSocket protocol, if you want to write your own agent.
    to: /docs/agents/protocol
  - icon: i-lucide-braces
    title: REST API
    description: Every HTTP endpoint of the server.
    to: /docs/reference/api
---
::
