---
title: "ESP32 Agent"
description: "The NetIgnite ESP32 agent: hardware, the web installer, the serial console, over-the-air updates, release signing and building the firmware yourself."
navigation:
  title: ESP32 Agent
---

# ESP32 Agent

The [ESP32 agent](https://github.com/NetIgnite-project/Agent-ESP32) turns an ESP32 board into a
NetIgnite agent. It joins your Wi-Fi, connects to your NetIgnite server, wakes devices in its
network, checks whether they're online and can shut them down over [SSH](/docs/guides/ssh). The
board draws little power, so it can stay on around the clock. You install it from the browser, and
it updates itself over the network.

## Requirements

- A **classic ESP32** board with 4 MB flash, for example an *ESP32 DevKit* with an ESP32-WROOM or
  ESP32-WROVER module (PlatformIO's `esp32dev`). Other chips such as the ESP32-S3 or ESP32-C3 aren't
  supported.
- A **2.4 GHz** Wi-Fi network with WPA, WPA2 or WPA3-Personal. 5 GHz and WPA2-Enterprise networks
  don't work.
- The ESP32 must be in the **same network and subnet** as the devices it wakes. Wake-on-LAN
  broadcasts and IPv6 link-local addresses don't cross routers.
- Outbound access to your NetIgnite server and to DNS. For an `https://` server also to NTP
  (`pool.ntp.org`, `time.cloudflare.com`, `time.google.com`): the agent needs the time to check the
  server's certificate.
- For the first install: a USB data cable and a computer with Google Chrome, Microsoft Edge or
  Firefox 151 or newer.

## Install from the browser

The dashboard flashes the firmware with [ESP Web Tools](https://esphome.github.io/esp-web-tools/).
Create an ESP32 agent first (**Agents → Add agent**, see
[Managing Agents](/docs/guides/agents#creating-an-agent)), then open its **Install** tab:

1. **Choose the firmware.** The list contains the releases the server has synced from GitHub; the
   recommended one is preselected. **Change server address** sets the address the agent connects
   to, if it's not the dashboard's address, for example `http://192.168.1.10:18232` inside your
   network.
2. **Prepare the installer.** The browser downloads the firmware files from your NetIgnite server
   and checks their SHA-256. The server creates the agent's setup data: the server address, the
   agent's name and a single-use token, valid for 15 minutes.
3. **Connect and install.** Plug the ESP32 into the computer, click **Connect and install** and pick
   its serial port. ESP Web Tools flashes the firmware and the setup data. Then enter your Wi-Fi
   name and password in the dialog: they're sent over USB to the ESP32 only, never to NetIgnite.
4. **Wait for the agent.** It joins the Wi-Fi, uses the token to register with the server,
   generates its own secret and connects. The page shows *… is connected*.

The browser must open the dashboard over **HTTPS** (or `localhost`): browsers only allow USB access
there. If the token expires before you flash, click **Prepare again**.

::note
Installing replaces everything on the board, including a previous NetIgnite credential and Wi-Fi
settings. It's also how you move a board from NetIgnite v1 to v2: the v2 firmware uses a new
partition table, so it has to be installed over USB once.
::

If the board doesn't show up as a serial port, install the USB driver for its USB-to-serial chip
(often a CP210x or CH340), try another cable (some only carry power) and close other programs that
use the port.

### Change Wi-Fi

To change the Wi-Fi without reinstalling, connect the board over USB, open the **Install** tab,
click **Prepare installer** and **Connect and install**. For a board that already runs NetIgnite,
the dialog offers **Change Wi-Fi** and **Logs & console** without touching the firmware or its
credential. A new network is only saved if the ESP32 can connect to it.

The `wifi` command in the [serial console](#serial-console) does the same.

## What happens at startup

1. The agent connects to Wi-Fi (DHCP by default) and enables IPv6.
2. For an `https://` server, it waits until the time is synced over NTP.
3. If it has a setup token, it registers with the server (`POST /api/v1/agents/enroll`), stores
   the credential and forgets the token.
4. It opens the WebSocket to `<server>/ws/agent` and announces itself.

A start looks like this on the serial console (115200 baud):

```text [Serial console]
[       0] I NetIgnite Agent 2.0.0 on ESP32-D0WD-V3 rev 3.1
[       0] I Device Office-ESP32 (24:6F:28:AA:BB:CC), partition app0, reset reason: power-on
[       0] I Connecting to Wi-Fi "MyWiFi"
[       3] I Wi-Fi connected: MyWiFi, IPv4 192.168.1.50, RSSI -58 dBm
[       3] I Time sync started
[       4] I Enrolling with https://netignite.example.com
[       5] I Enrolled as agent 3
[       5] I Connecting to https://netignite.example.com/ws/agent
[       6] I Connected to the server as agent 3
```

The number is the time since start in seconds, the letter the level (`E`rror, `W`arning, `I`nfo,
`D`ebug).

| Event | Behavior |
| --- | --- |
| Wi-Fi lost | The ESP32 reconnects on its own; after 30 seconds without a connection it starts over. |
| Server unreachable or the credential rejected | Retries after 5 seconds, then doubles the wait up to 60 seconds. |
| No message from the server for 100 seconds | Drops the connection and reconnects (the server pings every 30 seconds). |
| Token rejected (used, expired or for a Linux agent) | Logs `Enrollment rejected: …` and forgets the token. Create a new one. |
| Server not reachable while registering | Logs `Enrollment failed: …` and retries every 30 seconds. |

## Serial console

The firmware has a small command console on its USB serial port at 115200 baud. Open it with
**Logs & console** in the web installer dialog, PlatformIO's serial monitor (`pio device monitor`)
or any serial terminal. Type `help` for the list.

| Command | What it does |
| --- | --- |
| `help` | Lists the commands. |
| `status` | Firmware, device, Wi-Fi, IP addresses, server, agent ID and connection state. Never shows the secret. |
| `setup <server-url> <token>` | Connects the agent to a NetIgnite server with a setup token from the dashboard. |
| `wifi <ssid> [password]` | Connects to a Wi-Fi network. It's saved only if the connection works. Quote names with spaces: `wifi "My Network" "my password"`. |
| `server <url>` | Changes the server address. |
| `enroll <token>` | Sets the agent up again with a new token. |
| `ip dhcp` | Gets the IP address from DHCP (the default). |
| `ip static <ip> <gateway> <netmask> [dns1] [dns2]` | A static IPv4 configuration. |
| `name <name>` | Host name: letters, digits and `-`, at most 63 characters. Used after a restart. |
| `log <error\|warn\|info\|debug>` | Log level. |
| `reboot` | Restarts the agent. |
| `factory-reset confirm` | Erases Wi-Fi, server, credential and all other settings, then restarts. |

To set up a board over the serial console instead of with the installer's setup data (for example
after flashing a firmware you built yourself):

1. Connect it to Wi-Fi: `wifi "My Network" "my password"`.
2. On the agent's page in the dashboard, click **Create setup command** and paste the command:
   `setup https://netignite.example.com netignite_enroll_…`.

A server address without `http://` or `https://` means `https://`. The default name is
`NetIgnite-` plus the last six digits of the board's MAC address; the web installer sets the
agent's name from the dashboard instead.

## What the agent does

The agent implements these commands of the [agent protocol](/docs/agents/protocol):

| Command | What the agent does |
| --- | --- |
| `WAKE` | Sends the magic packet three times, 100 ms apart, to its subnet's broadcast address and to `255.255.255.255`. |
| `STATUS` | Pings the device twice with a 1-second timeout (IPv4, IPv6, or the IPv6 link-local address derived from the MAC address) and tries the TCP port, if one is set. A refused TCP connection also counts as online. Host names resolve to IPv4 and IPv6 addresses. |
| `SSH_CHECK`, `SSH_EXEC` | Logs in to a device over SSH (one login at a time). See [SSH](/docs/guides/ssh). |
| `OTA_BEGIN` | Installs a firmware update; see [below](#updates-over-the-network). |
| `GET_LOGS`, `LOG_SUBSCRIBE` | Sends its stored log (the last 16 KB, including ESP-IDF's own messages) and new lines for the dashboard's console. |
| `GET_INFO`, `CONFIG_SET` | Reports diagnostics; changes the server address, host name, log level and IP settings. |
| `REBOOT`, `FACTORY_RESET` | Restarts; erases its settings and restarts. |

The dashboard's [Console](/docs/guides/agents#console) tab uses the log and settings commands.

## Updates over the network

The firmware has two app slots of 1.875 MB each. An update from the dashboard
([Firmware updates](/docs/guides/agents#firmware-updates)) works like this:

1. The server sends `OTA_BEGIN` with the version, size, SHA-256 and, for signed releases, the
   signature of the new firmware.
2. The agent downloads it from its own server (`/api/v1/firmware/<version>/files/firmware.bin`)
   with its own credential, writes it into the unused slot and checks size and SHA-256. A firmware
   that requires signed updates also checks the signature and refuses unsigned ones.
3. It restarts into the new firmware, which is **on probation**: it marks itself as good once it
   has reached the server. If it crashes or doesn't get there within **5 minutes**, the board goes
   back to the previous firmware and reports the failed version to the server.

While the new firmware is on probation, the agent refuses another update. If memory is short, it
pauses the server connection during the download.

### Release signing

Releases can be signed with an ECDSA P-256 key. Signing works at two points:

- **On the agent.** A firmware built with a public key (`keys/firmware-signing.pub.pem` in the
  repository at build time) only installs updates with a valid signature. `status` on the serial
  console shows `updates: signed only` then; the dashboard's firmware card says the agent checks
  the *signature and SHA-256*.
- **On the server.** With
  [`NETIGNITE_FIRMWARE_PUBLIC_KEY`](/docs/server/configuration#esp32-firmware) set to the same
  public key, the server only syncs releases with a valid `firmware.sig`. The admin's firmware list
  marks them as *signed*.

To sign releases of your own fork, create a key pair with `sh scripts/generate_signing_key.sh`,
store the private key as the repository secret `FIRMWARE_SIGNING_KEY` and commit only the public
key. The release workflow then attaches `firmware.sig` to every release.

## Certificates

For `https://` servers, the agent checks the server's certificate against a bundle of trusted root
certificates compiled into the firmware: Mozilla's list of public root CAs, which includes Let's
Encrypt. A certificate from a private CA only works with a firmware you build yourself with that CA
added (see below). Don't update such an agent to an official release over the network: the official
firmware doesn't trust your CA, can't reach the server and goes back to your build after 5 minutes.

## Build from source

You need [PlatformIO](https://platformio.org/) Core **6.2 or newer** (`pio upgrade`). The build uses
[pioarduino](https://github.com/pioarduino/platform-espressif32) with Arduino-ESP32 3.3 on ESP-IDF
5.5, pinned in `platformio.ini`.

```bash [Terminal]
git clone https://github.com/NetIgnite-project/Agent-ESP32.git
cd Agent-ESP32
pio run -e esp32dev                # build
pio run -e esp32dev -t upload      # flash over USB
pio device monitor                 # serial console, 115200 baud
```

Add `--upload-port <port>` (for example `COM5` or `/dev/ttyUSB0`) if PlatformIO doesn't find the
board. A board flashed this way has no setup data: set it up over the
[serial console](#serial-console).

- **Private CA:** put its certificate (`.pem` or `.der`) into `data/cert/custom/` before building.
  The build adds it to the certificate bundle. The bundle generator needs the Python package
  `cryptography`, which the build installs on the first run.
- **Signed updates:** with `keys/firmware-signing.pub.pem` present, the firmware only accepts
  signed updates (see [Release signing](#release-signing)).
- **Version:** the build takes it from `git describe`, or from the environment variable
  `NETIGNITE_FW_VERSION`.

::tip
On Windows, build from PowerShell or the Command Prompt rather than Git Bash: ESP-IDF's tools
refuse to run in an MSYS shell.
::

## Limitations

- Wake-on-LAN uses IPv4 broadcasts, so the agent only reaches devices in its own subnet. Use one
  agent per network.
- The *MAC (IPv6 link-local)* status check only works for devices that use their MAC-based IPv6
  address. See [Status checks](/docs/guides/devices#status-checks).
- Wi-Fi can only be changed over USB, never through the server.
- One SSH login runs at a time; a second one at the same moment is refused.
