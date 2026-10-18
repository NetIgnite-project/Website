---
title: "ESP32 Agent"
description: "Configure, build and flash the NetIgnite ESP32 agent firmware with PlatformIO."
navigation:
  title: ESP32 Agent
---

# ESP32 Agent

The [ESP32 agent](https://github.com/NetIgnite-project/Agent-ESP32) turns an ESP32 development
board into a NetIgnite agent. It joins your WiFi, connects to the NetIgnite server, and sends
Wake-on-LAN packets and status pings to the devices in its network. The board draws little power,
so it can stay on around the clock.

## Requirements

- An ESP32 development board supported by PlatformIO's `esp32dev` target (the original ESP32).
- A **2.4 GHz** WiFi network with WPA/WPA2-Personal. The ESP32 doesn't support 5 GHz or
  WPA2-Enterprise.
- The ESP32 must be in the **same network and subnet** as the devices it wakes. Wake-on-LAN
  broadcasts and IPv6 link-local pings don't cross routers.
- Outbound access from the ESP32 to the NetIgnite server, to DNS and to NTP (`pool.ntp.org`,
  `time.nist.gov`).
- [PlatformIO](https://platformio.org/): the VS Code extension or PlatformIO Core (CLI).
- Python 3 with the `cryptography` package, to generate the certificate bundle.
- An agent created in the dashboard. You need its **Connection ID** and **Connection Secret**
  (see [Managing Agents](/docs/guides/agents)).

## Get the source

```bash [Terminal]
git clone https://github.com/NetIgnite-project/Agent-ESP32.git
cd Agent-ESP32
```

## Configure

Settings are compiled into the firmware. Copy the sample config and edit it:

```bash [Terminal]
cp src/config/config.sample.h src/config/config.h
```

```cpp [config.h]
#define C_WIFI_SSID "WIFI_SSID"
#define C_WIFI_PASSWORD "WIFI_PASSWORD"

#define C_WIFI_LOCAL_IP IPAddress(192, 168, 1, 32)
#define C_WIFI_GATEWAY_IP IPAddress(192, 168, 1, 1)
#define C_WIFI_SUBNET_MASK IPAddress(255, 255, 255, 0)

#define C_WIFI_PRIMARY_DNS IPAddress(1, 1, 1, 1)
#define C_WIFI_SECONDARY_DNS IPAddress(1, 0, 0, 1)

#define C_CONTROL_SERVER_HOST "example.com"
#define C_CONTROL_SERVER_PORT (uint16_t) 80
#define C_CONTROL_SERVER_USE_SSL (bool) false

#define C_CONTROL_SERVER_AUTH_ID "AUTH_ID"
#define C_CONTROL_SERVER_AUTH_SECRET "AUTH_SECRET"
```

`src/config/config.h` is ignored by Git, so your credentials stay out of the repository.

### WiFi

| Setting | Description |
| --- | --- |
| `C_WIFI_SSID` | Name of the 2.4 GHz network. |
| `C_WIFI_PASSWORD` | WiFi password. |
| `C_WIFI_LOCAL_IP` | Static IPv4 address of the ESP32. Pick a free address outside your DHCP range. |
| `C_WIFI_GATEWAY_IP` | Your router's address. |
| `C_WIFI_SUBNET_MASK` | Subnet mask. The agent also uses it to compute the Wake-on-LAN broadcast address (for example `192.168.1.255`). |
| `C_WIFI_PRIMARY_DNS`, `C_WIFI_SECONDARY_DNS` | DNS servers, used to resolve the server host and the NTP servers. |

::tip
The agent always applies the static network settings. To use DHCP instead, set
`C_WIFI_LOCAL_IP` to `IPAddress(0, 0, 0, 0)`. The ESP32 Arduino core then requests an address
from your router; reserve one for the ESP32 there so it doesn't change.
::

### Server

| Setting | Description |
| --- | --- |
| `C_CONTROL_SERVER_HOST` | Host name or IP of the NetIgnite server, without `https://` or a path. |
| `C_CONTROL_SERVER_PORT` | Server port: `443` behind an HTTPS proxy, `18232` for a direct connection to the Docker container. |
| `C_CONTROL_SERVER_USE_SSL` | `true` for an encrypted connection (`wss://`), `false` for plain `ws://`. |
| `C_CONTROL_SERVER_AUTH_ID` | The agent's **Connection ID**, as a string, for example `"3"`. |
| `C_CONTROL_SERVER_AUTH_SECRET` | The agent's **Connection Secret**. |

The agent always connects to the path `/api/agent-control-service`.

| Server | `HOST` | `PORT` | `USE_SSL` |
| --- | --- | --- | --- |
| Hosted app | `"app.netignite.dev"` | `443` | `true` |
| Self-hosted behind an [HTTPS proxy](/docs/server/reverse-proxy) | `"netignite.example.com"` | `443` | `true` |
| Self-hosted, direct to the container (LAN only) | `"192.168.1.10"` | `18232` | `false` |

::warning
Without SSL, the agent's ID and secret are sent unencrypted. Only use plain connections inside a
network you trust.
::

## Certificate bundle

The firmware embeds a bundle of trusted root certificates (`data/cert/x509_crt_bundle.bin`) that
it uses to verify the server's TLS certificate. The bundle isn't checked into Git, and **the build
fails without it, even with SSL turned off**. Generate it once after cloning:

```bash [Terminal]
pip install cryptography
cd data/cert
python gen_crt_bundle.py --input cacrt_all.pem
mv x509_crt_bundle x509_crt_bundle.bin
cd ../..
```

On Windows PowerShell, use `Move-Item x509_crt_bundle x509_crt_bundle.bin` for the rename.

`cacrt_all.pem` contains Mozilla's list of public root CAs, including Let's Encrypt. If your
server uses a certificate from a private CA, add that CA's certificate when you generate the
bundle:

```bash [Terminal]
python gen_crt_bundle.py --input cacrt_all.pem /path/to/my-ca.pem
```

## Build and flash

Connect the board over USB, then build, upload and open the serial monitor:

```bash [Terminal]
pio run
pio run -t upload
pio device monitor
```

In VS Code, use the PlatformIO toolbar's **Build**, **Upload** and **Serial Monitor** buttons
instead. The monitor runs at 115200 baud. Add `--upload-port <port>` (for example `COM5` or
`/dev/ttyUSB0`) if PlatformIO doesn't find the board.

::note
The project targets the Arduino-ESP32 **2.x** core that PlatformIO's `espressif32` platform
provides. Arduino core 3.x (for example via pioarduino) isn't supported yet.
::

Every configuration change requires a rebuild and upload. The firmware has no setup portal and no
over-the-air updates.

## What happens at boot

A successful start looks like this on the serial monitor (shortened; the order of the lines can
vary):

```text [Serial Monitor]
[INFO] Starting...
[INFO] Connecting to Wifi...
[INFO] STA Configured
[INFO] Connecting to MyWiFi...
[INFO] Wifi connected to MyWiFi. Waiting for IP...
[INFO] IPv6 enabled on WiFi
[INFO] Got IP address!
[INFO] IP address: 192.168.1.32
[INFO] Waiting for NTP time sync: ....
[INFO] Current UTC time: Sun Oct 18 19:30:00 2026
[INFO] Websocket Connected to netignite.example.com:443 SSL: true
```

1. The agent connects to WiFi and enables IPv6.
2. It waits until the clock is synced via NTP, which is needed to check TLS certificates.
3. It opens the WebSocket to the server and authenticates with the Connection ID and Secret.
4. It answers commands until the connection drops.

| Event | Behavior |
| --- | --- |
| WiFi connection lost | Reconnects after 60 seconds. |
| Server connection lost or refused | Retries every 60 seconds. |
| No WiFi or NTP during boot | The agent waits at the NTP step. Reset the board once the network is available. |
| Empty Connection ID or Secret | Logs `Missing credentials!` and never connects. |

## Commands

The agent implements the three commands of the [agent protocol](/docs/agents/protocol):

| Command | What the agent does |
| --- | --- |
| `WAKEUP` | Validates the MAC address and port, then sends the Wake-on-LAN magic packet three times, 100 ms apart, to the subnet's broadcast address. |
| `GET_STATUS` | Pings the device once with a 1-second timeout. A MAC address is converted to the device's IPv6 link-local (EUI-64) address; an IPv4 address is pinged directly. |
| `HEARTBEAT` | Nothing; the server uses it to keep the connection active. |

MAC addresses must have the form `AA:BB:CC:DD:EE:FF` or `AA-BB-CC-DD-EE-FF`. SecureOn (password
protected) magic packets aren't supported.

## Limitations

- The agent uses IPv4 subnet broadcasts for Wake-on-LAN, so it only reaches devices in its own
  subnet. Use one agent per network.
- The status check depends on the device's IPv6 link-local address being derived from its MAC
  address. See [How It Works](/docs/how-it-works#checking-device-status).
- The `installer/` folder in the repository is an early placeholder for a desktop installer. It
  can't flash boards yet; use PlatformIO.
