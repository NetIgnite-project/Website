---
title: "Troubleshooting"
description: "Solutions for common NetIgnite problems: logins, agents that don't connect, devices that don't wake, and wrong status."
navigation:
  title: Troubleshooting
---

# Troubleshooting

## Logging in

### The login form returns to the login page

Production builds only accept the session cookie over HTTPS (or on `localhost`). If you open the
dashboard as `http://<server-ip>:18232`, the browser drops the cookie and every page redirects
back to the login. Put the server behind [HTTPS](/docs/server/reverse-proxy), or open
`http://localhost:18232` on the server itself (for example through an SSH tunnel:
`ssh -L 18232:localhost:18232 <server>`).

### Everyone was logged out

Sessions are kept in memory, so every server restart or update ends all sessions. Log in again.

### I lost the admin password

If `data/initial_admin_credentials` still exists and you never changed the password, it's in
there. Otherwise, set a new password directly in the database. With Docker, replace
`NEW-PASSWORD` and run:

```bash [Terminal]
docker exec netignite-server bun -e '
  const { Database } = require("bun:sqlite");
  const hash = await Bun.password.hash("NEW-PASSWORD", { algorithm: "bcrypt", cost: 12 });
  new Database("data/db.sqlite").run("UPDATE users SET password_hash = ? WHERE username = ?", [hash, "admin"]);
'
```

## Agents

### The agent doesn't come online

Check the server log (`docker logs netignite-server`) and, for the ESP32, the serial monitor.

| Symptom | Cause and fix |
| --- | --- |
| ESP32 logs `Missing credentials!` | `C_CONTROL_SERVER_AUTH_ID` or `C_CONTROL_SERVER_AUTH_SECRET` is empty. |
| ESP32 logs `Websocket Connected` and right after `Websocket Disconnected!` | The server rejected the credentials. Check that the ID is the numeric **Connection ID** and that the secret is exactly the one shown when the agent was created. If you're unsure, [regenerate the secret](/docs/guides/agents#changing-the-secret) and reflash. |
| ESP32 only logs `Websocket Disconnected! Retrying in 60 seconds...` | The connection fails before the handshake: wrong host or port, `USE_SSL` doesn't match the port (`true` for `443`, `false` for a plain `18232`), or the server certificate isn't trusted (see [Certificate bundle](/docs/agents/esp32#certificate-bundle)). |
| ESP32 logs `NTP time sync timed out` | The board has no internet access, DNS doesn't work, or NTP (UDP port 123) is blocked. TLS connections fail until the time is synced; the agent keeps retrying on its own once the network works. |
| ESP32 logs `WiFi lost connection` repeatedly | Wrong SSID or password, or the network is 5 GHz only. |
| The server logs `Agent '<id>' connected`, but the dashboard shows offline | The status refreshes every 20 seconds; use the **Ping** button to refresh it. |

### The agent disconnects about once a minute

A reverse proxy is closing idle WebSocket connections. Raise its idle/read timeout above 60
seconds, as shown in [HTTPS & Reverse Proxy](/docs/server/reverse-proxy).

### The ESP32 firmware doesn't build

- **The certificate bundle can't be generated:** the first build installs the Python package
  `cryptography` into PlatformIO's environment and needs internet access for that. See
  [Certificate bundle](/docs/agents/esp32#certificate-bundle).
- **`config/config.h` not found:** copy `src/config/config.sample.h` to `src/config/config.h`.
- **Errors about `IPv6Address`, `enableIpV6` or `beginSslWithBundle`:** you're building with
  Arduino-ESP32 core 3.x. Use PlatformIO's official `espressif32` platform, which ships core 2.x.

## Waking devices

### The device doesn't wake up

*Wakeup command sent* only means the agent sent the packet. If the device stays off:

1. **Wake-on-LAN enabled?** Check the BIOS/UEFI and the network driver settings, and disable
   ErP/EuP power saving. See [Preparing a device](/docs/guides/devices#preparing-a-device).
2. **Right MAC address?** Use the MAC of the **wired** network card the device is connected with,
   not its WiFi adapter.
3. **Same network?** The agent must be in the same subnet as the device. Magic packets are
   broadcasts and don't cross routers or VLANs.
4. **Right port?** Most devices listen on `9`; some only react to `7`.
5. **Power state.** Some devices only wake from sleep or hibernation, not from a full shutdown.
   On Windows, disabling Fast Startup often helps.
6. **Test locally.** Send a magic packet from another computer in the same network (for example
   with `wakeonlan` or `etherwake`). If that doesn't work either, the problem is the device, not
   NetIgnite.

### "Agent is offline"

The device's agent isn't connected. See [The agent doesn't come online](#the-agent-doesnt-come-online).

### "Wakeup command failed: Wakeup failed: Invalid MAC address or port"

The ESP32 agent only accepts MAC addresses like `AA:BB:CC:DD:EE:FF` or `AA-BB-CC-DD-EE-FF` and
ports from `1` to `65535`. Edit the device and fix the value.

### "Failed to send wakeup command"

The agent didn't answer within 5 seconds, often because it was busy with status checks or its
connection had just dropped. Try again. If it keeps happening, check the agent's connection.

## Device status

### A running device shows as offline

The ESP32 agent pings the device's IPv6 link-local address that it derives from the MAC address
(EUI-64). The device shows as `offline` if it doesn't use that address or doesn't answer pings:

- **Windows** uses random interface identifiers. Switch to MAC-based ones in an elevated prompt with
  `netsh interface ipv6 set global randomizeidentifiers=disabled`, and allow the firewall rule
  *File and Printer Sharing (Echo Request - ICMPv6-In)*.
- **Linux with NetworkManager:** `nmcli connection modify <connection> ipv6.addr-gen-mode eui64`,
  then reconnect.
- **Linux with systemd-networkd:** set `IPv6LinkLocalAddressGenerationMode=eui64` in the
  `[Network]` section.
- **IPv6 disabled** on the device or a firewall that blocks ICMPv6 echo requests also causes
  `offline`.

Waking the device works regardless of the status.

### Every status is "unknown"

The devices' agent is offline, or it didn't answer within 5 seconds. Check the agent's status on
the **Agents** page.
