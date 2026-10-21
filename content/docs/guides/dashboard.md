---
title: "Dashboard"
description: "A tour of the NetIgnite web app: overview, devices, agents, settings, API keys, the admin area and installing it as an app."
navigation:
  title: Dashboard
---

# Dashboard

The NetIgnite web app is the same on the [hosted app](https://app.netignite.dev/) and on a
self-hosted server. It lives under `/dashboard`; the server's root address redirects there.

The sidebar has:

- **Overview**, **Devices** and **Agents**,
- **Settings**: **General**, **Security** and **API Keys**,
- **Admin** (admins only): **Users** and **Server Settings**,
- **Documentation** (this site) and **API Reference** (the server's OpenAPI reference at
  `/api/docs/v1`),
- your name at the bottom, with **Settings** and **Log out**.

The first time you log in, a welcome page suggests three steps: complete your profile, add an agent
and add a device. Pick one or click **Skip for now**; it doesn't come back.

## Overview

The overview shows your devices at a glance:

- **Stat cards** with the number of devices that are online, offline and unknown, and how many of
  your agents are online.
- A warning when you have agents but none of them is online.
- **Favorites**: your favorite devices with their status and power buttons. Without favorites, the
  first eight devices are shown. Shared devices say who shared them.

Everything refreshes every 20 seconds.

## Devices

**Devices** lists your devices and the devices shared with you. Search by name, filter by status or
type, and use the row's buttons:

| Column | Shows |
| --- | --- |
| Star | Add the device to your favorites or remove it. |
| Name | Opens the device page. |
| Status | Online, offline or unknown. Hover the badge for the reason and when it was checked. |
| Access | Your role: owner, manager, operator or viewer, and who shared it. |
| Power buttons | **Power on**, and a menu with **Shut down** and **Reboot** when the device supports them. Viewers don't see them. |

A device page has the tabs **General** (status, power buttons, **Check now**, settings) and, for the
owner, **Sharing** and **SSH**. See [Devices](/docs/guides/devices), [Sharing](/docs/guides/sharing)
and [SSH](/docs/guides/ssh).

## Agents

**Agents** lists your agents with their kind, status (**Online**, **Offline** or **Not set up**),
firmware or agent version and when they were last seen. A badge shows when a firmware update is
available or running. **Update n agents** updates every online ESP32 agent with an available
update, one after another.

An agent page has the tabs **General** (status, diagnostics, firmware, setup, settings) and, for
ESP32 agents, **Console** and **Install**. See [Managing Agents](/docs/guides/agents).

## Settings

- **General**: username, display name and email address.
- **Security**: change your password or delete your account.
- **API Keys**: keys for scripts and integrations.

See [Users & Accounts](/docs/server/users).

## Admin

Admins see two more pages:

- **Users**: create, edit and delete accounts and reset passwords.
- **Server Settings**: public sign-up, the default ESP32 firmware channel and the firmware sync.

See [Users & Accounts](/docs/server/users#managing-users) and
[Configuration](/docs/server/configuration#server-settings-in-the-dashboard).

## Installing as an app

The dashboard can be installed as an app (PWA) on phones, tablets and computers. It then opens in
its own window without the browser's address bar and gets an icon on the home screen or in the app
list:

- **Android (Chrome):** menu **⋮** → **Add to home screen**, then **Install**.
- **iPhone and iPad (Safari):** **Share** → **Add to Home Screen**.
- **Chrome or Edge on a computer:** the install icon at the right of the address bar.

The app is the same dashboard and needs its server: without a connection it shows *You're offline*
and a **Try again** button. Browsers only offer to install it over HTTPS (or on `localhost`), so a
self-hosted server needs a [reverse proxy](/docs/server/reverse-proxy) with a certificate.
