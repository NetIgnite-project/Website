---
title: "Managing Agents"
description: "Create NetIgnite agents, set them up with the web installer or a setup command, use the ESP32 console and update the firmware over the network."
navigation:
  title: Managing Agents
---

# Managing Agents

An agent is the part of NetIgnite that lives inside your network. It keeps a WebSocket connection
to the server, wakes and checks devices, and shuts them down. You need one agent per network
(broadcast domain) that contains devices you want to wake.

## Agent kinds

| Kind | Use it for |
| --- | --- |
| **ESP32** | A small board in your network, installed from the browser. Wakes devices, checks their status and logs in to them over SSH. See [ESP32 Agent](/docs/agents/esp32). |
| **Linux agent** | A service for an always-on Linux machine, for example a Raspberry Pi or a server. Reports its own status and shuts the machine down or reboots it; in Wake-on-LAN mode it also wakes, checks and logs in to other devices. See [Linux Agent](/docs/agents/linux). |

The kind can't be changed later. For an agent you [wrote yourself](/docs/agents/protocol), choose
**Linux agent**.

## Creating an agent

1. Open **Agents** and click **Add agent**.
2. Choose the **Kind**, enter a **Name** and optionally a **Description**.
3. Click **Create agent**. The agent's page opens with the status **Not set up**.

Then set it up. The **Set up** card on the agent's **General** tab shows how.

## Setting up an agent

Every setup uses a **single-use token** that is valid for **15 minutes**. The agent uses it once to
register and generates its own secret; NetIgnite never shows that secret. Creating a new token
invalidates older unused tokens of the agent. Setting an agent up again replaces its credential: a
device that still uses the old one is disconnected.

### ESP32: web installer

Click **Open the web installer** or open the **Install** tab. The installer flashes the firmware
over USB together with the agent's setup data (server address, name and token) and then asks for
your Wi-Fi. It needs Google Chrome, Microsoft Edge or Firefox 151 or newer on a computer, and the
dashboard must be opened over HTTPS. See
[Install from the browser](/docs/agents/esp32#install-from-the-browser).

### ESP32: serial console

For a board that already runs the v2 firmware, click **Create setup command** under
*Or over the serial console*. Connect to Wi-Fi in the board's serial console with
`wifi "<network>" "<password>"`, then paste the command:

```text [Serial console]
setup https://netignite.example.com netignite_enroll_…
```

See [Serial console](/docs/agents/esp32#serial-console).

### Linux agent: setup command

Click **Create setup command** and run the command on the Linux machine:

```bash [Terminal]
curl -fsSL https://netignite.example.com/install/linux.sh | sudo sh -s -- netignite_enroll_…
```

It downloads the agent, checks it, pairs it with the server and installs the systemd service. If
the agent is already installed, open *Agent already installed?* for a
`sudo netignite-agent pair …` command instead. See [Linux Agent](/docs/agents/linux).

## Agent status

| Status | Meaning |
| --- | --- |
| **Online** | The agent is connected. |
| **Offline** | The agent is set up but not connected. **Last seen** shows when it was. |
| **Not set up** | The agent has no credential yet, or it was revoked. |

The **General** tab also shows the agent's version, its **capabilities** (what it can do, for
example `wake`, `status.ip`, `ssh` or `host.control`) and the diagnostics it reports: IP
addresses, Wi-Fi signal, uptime, memory and more. Agents that lose their connection reconnect on
their own, after 5 seconds at first and at most every 60 seconds.

The **Devices** card lists the devices that use the agent, to wake them or as the Linux agent on
the device.

## Console

ESP32 agents with a v2 firmware that has the console get a **Console** tab:

- **Log**: the agent's live log, starting with the lines it has stored (about the last 16 KB).
  Choose the **log level** (*Errors*, *Warnings*, *Info*, *Debug*), turn **Follow** on or off, copy
  or clear the view. The badge shows **Live**, **Agent offline** or **Disconnected**.
- **Settings on the agent**:
  - **Server address**: where the agent connects. Leave it empty to keep it.
  - **Host name**: letters, digits and `-`; used after the next restart.
  - **IP address**: *Automatic (DHCP)* or *Static* with address, gateway, netmask and DNS server.

  Click **Send to agent**. A new server address or IP setting is only kept if the agent reaches the
  server with it within 2 minutes; otherwise it restarts with the previous settings.
- **Restart**: the agent is back after a few seconds.
- **Factory reset**: erases Wi-Fi, server and credential on the agent and revokes the credential
  in NetIgnite. Set it up again with the web installer.

Wi-Fi can't be changed through the server. Use **Change Wi-Fi** in the web installer (see
[ESP32 Agent](/docs/agents/esp32#change-wi-fi)) or the `wifi` command in the serial console. Only
the agent's owner can open its console.

## Firmware updates

ESP32 agents whose firmware supports it (capability `ota`) are updated over the network. The
**Firmware** card on the agent's **General** tab shows the installed version and, when the admin's
[firmware channel](/docs/server/configuration#server-settings-in-the-dashboard) has a newer release,
**Update to …**. Use **Other version** to install any synced release, also an older one. The agent
must be online.

An update goes through these steps, shown on the card:

1. The agent downloads the firmware from your NetIgnite server with its own credential and checks
   its size and SHA-256, and its signature if the agent's firmware requires signed updates.
2. It writes the firmware to its second firmware slot and restarts into it.
3. The new firmware is **on probation** until it has reached the server. If it crashes or doesn't
   get there within 5 minutes, the board starts the previous firmware again, and the card reports
   that the update was rolled back.

The card then shows *Updated from … to …* or *Update to … failed* with the reason. An update that
hasn't finished after 15 minutes counts as failed.

To update several agents, click **Update n agents** on the **Agents** page. It updates every online
ESP32 agent with an available update, one after another: each update has to finish before the next
one starts.

ESP32 boards with a firmware that can't be updated over the network show *This firmware can't be
updated over the network*. Install a current firmware once with the web installer.

## Revoking and deleting

On the **General** tab, under **Danger Zone**:

- **Revoke credential** disconnects the agent. It can connect again only after it's set up again.
- **Delete agent** disconnects and deletes it. Devices that used it keep their settings but have no
  agent, so they can't be woken until you choose another one.
