---
title: "Getting Started"
description: "Set up a self-hosted NetIgnite server, connect an ESP32 agent and wake your first device."
navigation:
  title: Getting Started
---

# Getting Started

This guide takes you from an empty machine to your first remote wake-up. You need:

- a Linux host with [Docker](https://docs.docker.com/engine/install/) and Docker Compose for the
  server,
- an ESP32 development board (`esp32dev`) and a USB cable,
- a device that supports Wake-on-LAN, in the same LAN as the ESP32.

::tip
Using the hosted app at [app.netignite.dev](https://app.netignite.dev/)? Skip steps 1 and 2, log
in, and continue with step 3. Use `app.netignite.dev`, port `443` and SSL as the agent's server
settings.
::

::steps{level="3"}

### Start the server

Create a `docker-compose.yml` and start it:

```yaml [docker-compose.yml]
services:
  netignite-server:
    image: ghcr.io/netignite-project/server:latest
    container_name: netignite-server
    restart: unless-stopped
    ports:
      - "18232:18232"
    volumes:
      - /opt/netignite/data:/opt/netignite/data
      - /opt/netignite/config:/opt/netignite/config
```

```bash [Terminal]
docker compose up -d
```

The server listens on port `18232`. See [Installation](/docs/server/installation) for details and
other ways to run it.

### Log in as admin

On first start, the server creates an `admin` account with a random password and writes it to
`data/initial_admin_credentials`:

```bash [Terminal]
sudo cat /opt/netignite/data/initial_admin_credentials
```

Open the dashboard and log in. The session cookie is only accepted over HTTPS or on `localhost`,
so either open `http://localhost:18232` on the server itself or put the server behind
[HTTPS](/docs/server/reverse-proxy) first. Then change the password under **Settings**.

### Create an agent

Go to **Agents → Add New Agent**, enter a name, choose the type **Microcontroller** and save.
The agent page now shows the **Connection ID** and the **Connection Secret**. You need both for
the next step. See [Managing Agents](/docs/guides/agents).

### Flash the ESP32 agent

Clone the [Agent-ESP32](https://github.com/NetIgnite-project/Agent-ESP32) repository, copy
`src/config/config.sample.h` to `src/config/config.h` and fill in your WiFi details, the server
address, and the Connection ID and Secret:

```cpp [config.h]
#define C_CONTROL_SERVER_HOST "netignite.example.com"
#define C_CONTROL_SERVER_PORT (uint16_t) 443
#define C_CONTROL_SERVER_USE_SSL (bool) true

#define C_CONTROL_SERVER_AUTH_ID "1"
#define C_CONTROL_SERVER_AUTH_SECRET "your-connection-secret"
```

Then generate the certificate bundle, build and flash the firmware. The
[ESP32 Agent](/docs/agents/esp32) page walks through every setting and command. When the agent
shows as **online** in the dashboard, it is connected.

### Add a device

Go to **Devices → Add New Device** and enter a name, the device type, its **MAC address** (for
example `AA:BB:CC:DD:EE:FF`), the Wake-on-LAN **port** (`9` unless you know otherwise) and the
agent you just created. See [Devices & Wake-on-LAN](/docs/guides/devices).

### Power it on

Shut the device down, then press **Power On** on the dashboard. The agent sends the magic packet
and the device starts.

::

Nothing happened? Check [Troubleshooting](/docs/reference/troubleshooting).
