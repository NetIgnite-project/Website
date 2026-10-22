---
title: "Troubleshooting"
description: "Solutions for common NetIgnite problems: the server doesn't start, logins, the web installer, agents that don't connect, devices that don't wake, wrong status, shutdown, updates and the v1 import."
navigation:
  title: Troubleshooting
---

# Troubleshooting

Start with the logs: the server's (`docker logs netignite-server`), the ESP32's
[serial console](/docs/agents/esp32#serial-console) or **Console** tab, and the Linux agent's
journal (`journalctl -u netignite-agent`). The Windows agent logs to
`C:\ProgramData\NetIgnite\logs\agent.log`, the macOS agent to
`/usr/local/var/log/netignite-agent/agent.log`.

## Server

### The server doesn't start

| Log message | Fix |
| --- | --- |
| `Failed to read the environment variable APP_URL: …` | Set `NETIGNITE_APP_URL`; it's required. |
| `Failed to read the environment variable <NAME>: Expected a boolean value ('true' or 'false')` | Booleans must be exactly `true` or `false`, not empty, `1` or `yes`. |
| `NETIGNITE_FIRMWARE_PUBLIC_KEY: can't use …` | `NETIGNITE_FIRMWARE_PUBLIC_KEY` is a *path* to a PEM public key; the file must exist inside the container, for example in the config volume. Until it can be read, every firmware sync fails with this message (also under **Admin → Server Settings**). |

### The firmware list stays empty

The web installer says *No firmware available yet*. Under **Admin → Server Settings**, click
**Sync now** and read the result:

- *GitHub answered 403 …* or another HTTP error: the server can't reach GitHub or hit GitHub's rate
  limit. Allow outbound HTTPS, or set `NETIGNITE_GITHUB_TOKEN`.
- *Skipped … the release isn't signed, but FIRMWARE_PUBLIC_KEY requires a signature*: with
  `NETIGNITE_FIRMWARE_PUBLIC_KEY` set, unsigned releases are skipped. Remove the variable or use
  signed releases.
- *Skipped … the firmware speaks agent protocol …*: the release is for another server version.

Servers without internet access can't sync firmware. Build the firmware yourself and set the board
up over the [serial console](/docs/agents/esp32#build-from-source).

## Logging in

### The login page comes back after logging in

- **No HTTPS.** The browser drops the login cookie on plain `http://` pages other than `localhost`.
  Put the server behind [HTTPS](/docs/server/reverse-proxy), or open `http://localhost:18232` on
  the server itself (for example through an SSH tunnel: `ssh -L 18232:localhost:18232 <server>`).
- **Wrong `NETIGNITE_APP_URL`.** The dashboard sends its API requests to `NETIGNITE_APP_URL`. If it
  isn't the address in the browser's address bar, logins and everything else fail. Fix it and
  restart the server.

### "Too many login attempts"

After 5 failed logins for a username from one address (15 from all addresses), the server refuses
logins for that username until 5 minutes after the first attempt. Behind a reverse proxy, all
clients share the proxy's address. Wait, then try again.

### The reset link email doesn't arrive

Password-reset emails need [email](/docs/server/configuration#email) to be configured, and they go
to the account's email address. Imported v1 users and the first admin have placeholder addresses
until they change them. An admin can set a new password under **Admin → Users → Reset Password**.

### I lost the admin password

If another admin exists, they can reset it under **Admin → Users**. If the first admin's link in
`config/initial_admin_password_reset_token.txt` was never used and is less than 7 days old, use it.
Otherwise, set a new password directly in the database. With Docker, replace `NEW-PASSWORD` and run:

```bash [Terminal]
docker exec netignite-server bun -e '
  const { Database } = require("bun:sqlite");
  const hash = await Bun.password.hash("NEW-PASSWORD");
  new Database("/opt/netignite/data/netignite.sqlite").run("UPDATE users SET password_hash = ? WHERE username = ?", [hash, "admin"]);
'
```

## Web installer

| Problem | Fix |
| --- | --- |
| *This browser can't access USB devices* | Use Google Chrome, Microsoft Edge or Firefox 151 or newer on a computer, or set the board up over its [serial console](/docs/agents/esp32#serial-console). |
| *Installing needs HTTPS* | Open the dashboard over HTTPS (or on `localhost`). |
| The ESP32's port isn't in the list | Install the USB driver for the board's USB-to-serial chip (often CP210x or CH340), use a data cable, and close other programs that use the port, such as a serial monitor. |
| *The setup token expired* | The token is valid for 15 minutes. Click **Prepare again**. |
| Wi-Fi setup fails in the dialog | The ESP32 only supports 2.4 GHz networks. Check the password; a new network is only saved if the connection works. |
| Installed, but the agent doesn't come online | See [below](#the-agent-doesnt-come-online). |

## Agents

### The agent doesn't come online

**ESP32**: check the serial console or the web installer's **Logs & console**:

| Message | Cause and fix |
| --- | --- |
| `Waiting for Wi-Fi settings` | No Wi-Fi set up. Use **Change Wi-Fi** in the web installer or the `wifi` command. |
| `Connecting to Wi-Fi "…"` every 30 seconds, `Wi-Fi connection lost` | Wrong network or password, a 5 GHz-only network, or poor signal. Change the Wi-Fi with the web installer or the `wifi` command. |
| `Couldn't connect to "…"` after `wifi` or **Change Wi-Fi** | The new network didn't work; the previous one is kept. |
| `Not connected to a server yet` | No server set. Use the web installer, or `setup <server-url> <token>`. |
| `Waiting for the time` | The board can't reach NTP (UDP port 123) or DNS. HTTPS connections wait until the time is synced. |
| `Enrollment rejected: …` | The setup token was used, expired or is for another kind of agent. Create a new one and install again, or use `enroll <token>`. |
| `Enrollment failed: …` | The server isn't reachable at the configured address. The agent retries every 30 seconds. |
| `This agent has no credential` | The credential was erased. Set the agent up again. |
| `Couldn't connect to the server, retrying in … s` | Wrong server address, the certificate isn't trusted (private CA, see [Certificates](/docs/agents/esp32#certificates)), the proxy doesn't forward `/ws/agent`, or the credential was revoked: then set the agent up again. |

**Linux, Windows and macOS agent**: run `sudo netignite-agent status` (Windows: in an elevated
PowerShell, `& "C:\Program Files\NetIgnite\netignite-agent.exe" status`). It checks the server
(`Server check`) and the credential (`Credential`) unless the service is running.

| Message | Cause and fix |
| --- | --- |
| `The server doesn't accept this agent's credential (HTTP 401)`, exit code `78` | The credential was revoked or the agent deleted. Pair again with a new token: `sudo netignite-agent pair <server-url> <token>`. |
| `The server revoked this agent's credential` | Same: it was paired again elsewhere, revoked or reset in the dashboard. |
| `Another connection with this agent's credential replaced this one` | The agent runs twice, for example `run` by hand next to the service. |
| `The server didn't accept the HELLO` | The agent and the server don't speak the same protocol version. Update the agent or the server. |
| `No config at …` | Pair the agent first. |

The server logs `Agent <id> online (…)` when an agent connects and `Agent <id> disconnected` when
it goes.

### The agent disconnects regularly

- A reverse proxy closes idle WebSockets. Raise its timeout above 60 seconds; see
  [HTTPS & Reverse Proxy](/docs/server/reverse-proxy).
- `Agent <id> unresponsive, closing` in the server log: the agent didn't send anything for 75
  seconds. For an ESP32, check its Wi-Fi signal (`rssi_dbm` on the agent's page).

### The Console tab says "Agent offline" or "Disconnected"

*Agent offline*: the agent isn't connected; the log appears when it is. *Disconnected*: the
browser's connection to `/ws/console` failed. Check that the proxy forwards WebSockets on
`/ws/console` and that you opened the dashboard at `NETIGNITE_APP_URL` (the server refuses other
origins).

## Waking devices

### The power button is disabled

Its tooltip says *No online agent with Wake-on-LAN*: the device has no agent, its agent is offline,
or the agent can't send Wake-on-LAN packets (a Linux agent without
[Wake-on-LAN mode](/docs/agents/linux#wake-on-lan-mode)). Viewers of a shared device don't get the
button at all.

### The device doesn't wake up

*Wake-on-LAN packet sent* only means the agent sent the packet. If the device stays off:

1. **Wake-on-LAN enabled?** Check the BIOS/UEFI and the network driver settings, and disable
   ErP/EuP power saving. See [Preparing a device](/docs/guides/devices#preparing-a-device).
2. **Right MAC address?** Use the MAC of the **wired** network card the device is connected with,
   not its Wi-Fi adapter.
3. **Same network?** The agent must be in the same subnet as the device. Magic packets are
   broadcasts and don't cross routers or VLANs.
4. **Right port?** Most devices listen on `9`; some only react to `7`.
5. **Power state.** Some devices only wake from sleep or hibernation, not from a full shutdown.
   On Windows, disabling Fast Startup often helps.
6. **Test locally.** Send a magic packet from another machine in the same network, for example with
   `netignite-agent wol AA:BB:CC:DD:EE:FF` on a Linux agent, `wakeonlan` or `etherwake`. If that
   doesn't work either, the problem is the device, not NetIgnite.

### Error messages

| Message | Meaning |
| --- | --- |
| *No agent is assigned to this device* | Choose an agent in the device's settings. |
| *Agent is offline* | See [The agent doesn't come online](#the-agent-doesnt-come-online). |
| *The agent didn't answer in time* | The agent didn't answer within 5 seconds, often because its connection had just dropped. Try again. |
| *The agent doesn't support this action* | The agent can't do that, for example Wake-on-LAN on a Linux agent without Wake-on-LAN mode. |
| *Your role on this device doesn't allow power actions* | You're a viewer of this shared device. |

## Device status

### A running device shows as offline

- **MAC (IPv6 link-local)** only works when the device uses its MAC-based IPv6 link-local address
  and answers IPv6 pings. Windows and many Linux distributions use random addresses. Switch to the
  **IPv4 address** check, or change the device:
  - Windows, in an elevated prompt: `netsh interface ipv6 set global randomizeidentifiers=disabled`.
  - NetworkManager: `nmcli connection modify <connection> ipv6.addr-gen-mode eui64`, then reconnect.
  - systemd-networkd: `IPv6LinkLocalAddressGenerationMode=eui64` in the `[Network]` section.
- **The device doesn't answer pings.** Windows blocks them by default. Add a **TCP port** the device
  answers on (`445`, `3389`), or allow *File and Printer Sharing (Echo Request)* in the firewall.
- **The address changed.** Give the device a fixed address (DHCP reservation).
- **The agent can't reach the address.** The agent checks the device, not the server: the address
  must be reachable from the agent's network.

### The status is "Unknown"

Hover the status badge for the reason:

| Reason | Fix |
| --- | --- |
| *Status checks are turned off* | Choose a status check in the device's settings. |
| *No agent assigned* | Choose an agent. |
| *No status address configured* | Enter the address for the IPv4, IPv6 or SSH check. |
| *Agent is offline* | Check the agent. |
| *Agent doesn't support …* | The agent lacks the capability, for example a Linux agent without Wake-on-LAN mode. |
| *No host agent assigned* | Choose the agent on the device, or another status check. |
| *Agent didn't answer in time* | The check took longer than 6 seconds. |

## Shutdown and reboot

### Shut down and Reboot are missing

The device needs the agent on the device (online): a [Linux](/docs/agents/linux#host-mode),
[Windows](/docs/agents/windows) or [macOS](/docs/agents/macos) agent. Or SSH turned on under
**Admin → Server Settings**, an [SSH login](/docs/guides/ssh) with a trusted host key, and an online
agent that can log in over SSH. Viewers don't get power actions.

### Shutdown requested, but nothing happens

- **Agent on the device:** the dashboard shows why the agent refused. *… can't shut down
  through the agent (netignite-agent-shutdown.path is inactive)*, or on macOS *(… is missing)*: run
  `sudo netignite-agent install` again, for example after updating from 1.0.0 or older.
  *… blocks shutdown and reboot right now*: a block inhibitor, such as a running package upgrade,
  holds the shutdown (`systemd-inhibit --list`). If the request succeeded but nothing happened,
  check `journalctl -u netignite-agent -u netignite-agent-shutdown` (Linux) or the agent's log
  (Windows, macOS).
- **SSH:** errors come back in the toast:

| Message | Fix |
| --- | --- |
| *SSH is turned off on this server* | An admin turns it on under **Admin → Server Settings**. While it's off, NetIgnite sends no SSH request at all. |
| *Test the SSH login and trust the device's host key first* | Open the **SSH** tab, **Test login** and **Trust this host key**. |
| `sudo: a password is required` | The sudoers line is missing. See [SSH](/docs/guides/ssh#linux-macos-bsd). |
| `host_key_mismatch` | The device's host key changed. Test again and trust the new key if you expected the change. |
| *the device didn't accept the agent's shutdown key* (or *reboot key*) | Wrong username, or the `authorized_keys` lines are missing or outdated: copy them again from the **SSH** tab. |
| *Too many SSH logins (at most 10 a minute)* | The agent limits its SSH logins. Wait the time it says. |
| *The device's agent can't log in over SSH* | The device's agent doesn't support SSH: a Linux agent without Wake-on-LAN mode, an agent that connects over plain HTTP (SSH needs HTTPS), or an older agent (ESP32 firmware 2.0.0, Linux agent 1.0.0 or older). |

## Firmware updates

| Message | Meaning |
| --- | --- |
| *This firmware can't be updated over the network* | The installed firmware has no update support. Install a current one with the web installer once. |
| *The current firmware isn't confirmed yet; try again shortly* | The agent just updated and is on probation until it reaches the server. |
| *The download doesn't match its SHA-256* | The download was damaged. Try again. |
| *This firmware only installs signed updates, and the update has no signature* | The agent requires signed updates; install a signed release. |
| *The update's signature is invalid* | The release was signed with another key than the one built into the agent. |
| *The update to … was rolled back* | The new firmware didn't reach the server within 5 minutes after restarting, so the agent went back. Check the server address and the certificate (a firmware with a private CA updated to an official release can't connect). |

## Upgrading from v1

| Message | Fix |
| --- | --- |
| `v1 database not found: …` | Check the path given with `--from`; inside the container it's `/opt/netignite/data/db.sqlite`. |
| `Not a NetIgnite v1 database: table "…" is missing` | `--from` points at another file, for example the v2 `netignite.sqlite`. |
| `skipped user …: username already exists in v2` | Add `--merge-users`, or rename the v2 user first. |
| `skipped device …: invalid MAC address` | Add the device again in the dashboard. |

See [Upgrading from v1](/docs/server/upgrading).
