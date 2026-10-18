---
title: "Dashboard"
description: "A tour of the NetIgnite web app: the device overview, device and agent management, and account settings."
navigation:
  title: Dashboard
---

# Dashboard

The NetIgnite web app is the same on the [hosted app](https://app.netignite.dev/) and on a
self-hosted server. The sidebar has three entries: **Home**, **Devices** and **Agents**. Your
username at the bottom opens **Settings** and **Log out**.

## Home

The home page is an overview of all your devices:

- **Stat cards** with the number of devices that are online, offline, in an unknown state, and in
  total.
- **Your Devices**: one card per device with its status and quick actions:

| Action | What it does |
| --- | --- |
| **Power On** | Sends a Wake-on-LAN packet through the device's agent. Shown while the device isn't online. |
| **Ping** | Refreshes the device's status right away. |
| **Edit** | Opens the device's settings. |

Statuses refresh automatically every 20 seconds.

## Devices

**Devices** lists all your devices in a table. Search by name or description, filter by status or
type, and use the row actions to power on, ping, edit or delete a device. **Add New Device** opens
the device form. See [Devices & Wake-on-LAN](/docs/guides/devices).

## Agents

**Agents** lists your agents with their connection status. Search, filter by status or type, and
ping, edit or delete agents. **Add New Agent** creates a new agent. See
[Managing Agents](/docs/guides/agents).

## Settings

**Settings** lets you change your username and password. See
[Users & Accounts](/docs/server/users).

::note
The **Shutdown** button appears for online devices, but remote shutdown isn't implemented yet. It
only shows a notice. Marking devices as favorites is not saved yet either.
::
