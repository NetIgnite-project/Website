---
title: "Documentation"
description: "Learn how NetIgnite powers on, checks and shuts down devices from anywhere: self-host the server, set up an agent and control your devices."
navigation:
  title: Overview
---

# NetIgnite Documentation

NetIgnite lets you power on computers, servers and other devices in your network from anywhere,
see whether they're online, and shut them down or reboot them. A small **agent** inside your
network keeps a connection open to the **NetIgnite server**. When you press **Power on** in the
dashboard, the server tells the agent to send a
[Wake-on-LAN](https://en.wikipedia.org/wiki/Wake-on-LAN) magic packet to the device.

::note
These docs describe **NetIgnite v2**: the server 2.x, the ESP32 firmware 2.x and the NetIgnite
agent 1.x for Linux, Windows and macOS. v1 agents can't connect to a v2 server. Coming from v1? Read
[Upgrading from v1](/docs/server/upgrading).
::

## Components

| Component | What it does | Source |
| --- | --- | --- |
| **Server** | Web dashboard, REST API and the WebSocket gateway that agents connect to. Stores users, agents and devices in SQLite. | [NetIgnite-project/Server](https://github.com/NetIgnite-project/Server) |
| **ESP32 agent** | Firmware for an ESP32 board in your LAN. Wakes devices, checks whether they're online and can shut them down over SSH. Installed from the browser and updated over the network. | [NetIgnite-project/Agent-ESP32](https://github.com/NetIgnite-project/Agent-ESP32) |
| **Agent for Linux, Windows and macOS** | A service on a computer. Reports the machine's status and shuts it down or reboots it; on Linux it optionally also wakes and checks other devices in its network, like the ESP32 agent. | [NetIgnite-project/Agent-Linux](https://github.com/NetIgnite-project/Agent-Linux) |
| **Website** | This site, including the docs. | [NetIgnite-project/Website](https://github.com/NetIgnite-project/Website) |

You can use the hosted app at [app.netignite.dev](https://app.netignite.dev/) or run your own
server. All components are open source under the
[AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html).

## What you can do

- **Power on** devices with Wake-on-LAN through an agent in their network.
- **Check** whether a device is online: by its IPv4 or IPv6 address, a TCP port, its MAC address
  (IPv6 link-local), its SSH port, or the agent running on it.
- **Shut down and reboot** devices through the NetIgnite agent on the device (Linux, Windows,
  macOS), or over SSH for devices that can't run it.
- **Share** devices with other users as viewer, operator or manager.
- **Install the ESP32 agent from the browser** and keep it up to date with over-the-air updates.
- **Automate** with the REST API and API keys.
- **Use it on your phone**: install the dashboard as an app (PWA).

## Where to start

::icon-card-grid
---
cards:
  - icon: i-lucide-workflow
    title: How It Works
    description: Server, agents and devices, and what happens when you press Power on.
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
    description: Install the firmware from the browser, its console and updates.
    to: /docs/agents/esp32
  - icon: i-lucide-terminal
    title: Linux Agent
    description: Install the agent as a systemd service with one command.
    to: /docs/agents/linux
  - icon: i-lucide-monitor
    title: Windows and macOS
    description: The same agent on a PC or a Mac, to shut it down and reboot it.
    to: /docs/agents/windows
  - icon: i-lucide-history
    title: Upgrading from v1
    description: Import your v1 data and set your agents up again.
    to: /docs/server/upgrading
  - icon: i-lucide-cable
    title: Agent Protocol
    description: The WebSocket protocol, if you want to write your own agent.
    to: /docs/agents/protocol
  - icon: i-lucide-braces
    title: REST API
    description: Authentication, API keys and the most important endpoints.
    to: /docs/reference/api
---
::
