---
title: "Getting Started"
description: "Set up a self-hosted NetIgnite server, install an ESP32 agent from the browser and wake your first device."
navigation:
  title: Getting Started
---

# Getting Started

This guide takes you from an empty machine to your first remote wake-up. You need:

- a Linux host with [Docker](https://docs.docker.com/engine/install/) and Docker Compose for the
  server, and a host name with HTTPS for it (see [HTTPS & Reverse Proxy](/docs/server/reverse-proxy)),
- an ESP32 development board (a classic ESP32, for example an *ESP32 DevKit*) and a USB data cable,
- a computer with Google Chrome, Microsoft Edge or Firefox 151 or newer to install the agent,
- a device that supports Wake-on-LAN, in the same LAN as the ESP32.

::tip
Using the hosted app at [app.netignite.dev](https://app.netignite.dev/)? Skip steps 1 and 2, log
in, and continue with step 3. No ESP32? A [Linux agent](/docs/agents/linux) on an always-on Linux
machine in the same network works too.
::

::steps{level="3"}

### Start the server

Create a `docker-compose.yml`. Set `NETIGNITE_APP_URL` to the address you'll open the dashboard
at:

```yaml [docker-compose.yml]
services:
  netignite-server:
    image: ghcr.io/netignite-project/server:latest
    container_name: netignite-server
    restart: unless-stopped
    ports:
      - "18232:18232"
    environment:
      NETIGNITE_APP_URL: https://netignite.example.com
    volumes:
      - /opt/netignite/data:/opt/netignite/data
      - /opt/netignite/config:/opt/netignite/config
```

```bash [Terminal]
docker compose up -d
```

The server listens on port `18232`. Put it behind a reverse proxy with HTTPS: logging in and the
ESP32 web installer only work over HTTPS (or on `localhost`). See
[Installation](/docs/server/installation) and [HTTPS & Reverse Proxy](/docs/server/reverse-proxy).

### Set the admin password

On first start, the server creates the user `admin` and writes a link for setting its password to
`config/initial_admin_password_reset_token.txt`:

```bash [Terminal]
sudo cat /opt/netignite/config/initial_admin_password_reset_token.txt
```

Open the link (it's valid for 7 days), choose a password and log in as `admin`. The welcome page
suggests a few first steps; start with **Complete your profile** and enter your real email
address. See [Users & Accounts](/docs/server/users).

### Create an agent

Go to **Agents → Add agent**, keep the kind **ESP32**, enter a name such as *Office ESP32* and click
**Create agent**. The agent's page opens; its status is **Not set up**. See
[Managing Agents](/docs/guides/agents).

### Install the ESP32 from the browser

On the agent's page, click **Open the web installer** (or open the **Install** tab):

1. **Choose the firmware.** The recommended release is preselected.
2. Click **Prepare installer**. The browser downloads the firmware from your server, and the
   server adds the agent's setup data: your server's address and a single-use token, valid for 15
   minutes.
3. Plug the ESP32 into your computer, click **Connect and install** and pick its serial port.
   After flashing, enter your Wi-Fi name and password in the dialog. They go straight to the
   ESP32, not to NetIgnite.
4. Wait a moment: the agent joins your Wi-Fi, connects to the server, and the page shows it as
   connected.

Details and alternatives are on the [ESP32 Agent](/docs/agents/esp32) page.

### Add a device

Go to **Devices → Add device** and enter a name, the device type, its **MAC address** (for example
`AA:BB:CC:DD:EE:FF`), the **Wake-on-LAN port** (`9` unless you know otherwise) and the agent you
just set up. Under **Status check**, choose **IPv4 address** and enter the device's IP address to
see whether it's online. See [Devices](/docs/guides/devices).

### Power it on

Shut the device down, then click the power button next to it on the **Overview** or **Devices**
page. The agent sends the magic packet and the device starts; its status turns **Online** a moment
later.

::

Nothing happened? Check [Troubleshooting](/docs/reference/troubleshooting). Next, you could
[share the device](/docs/guides/sharing) or set it up for [shutdown over SSH](/docs/guides/ssh).
