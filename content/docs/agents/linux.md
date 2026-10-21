---
title: "Linux Agent"
description: "The NetIgnite agent for Linux: install it with one command, pair it, host mode and Wake-on-LAN mode, the systemd service, polkit, uninstalling and security."
navigation:
  title: Linux Agent
---

# Linux Agent

`netignite-agent` connects a Linux machine to your NetIgnite server. It has two modes:

- **Host mode** (always on): the dashboard sees whether this machine is online and can **shut it
  down or reboot it**.
- **Wake-on-LAN mode** (optional): the agent also **wakes other devices** in its network,
  **checks whether they're online** and **logs in to them over [SSH](/docs/guides/ssh)** to shut
  them down or reboot them. That's what the [ESP32 agent](/docs/agents/esp32) does, on a machine
  you already run: a Raspberry Pi, a NAS or a home server.

The agent is a single binary that runs as a systemd service under its own unprivileged user. It
talks to the server over one outgoing WebSocket; nothing listens on the machine. Source and
releases: [NetIgnite-project/Agent-Linux](https://github.com/NetIgnite-project/Agent-Linux).

## Requirements

- Linux with systemd, on a 64-bit x86 or ARM CPU.
- polkit, for shutdown and reboot (`apt install polkitd` on Debian and Ubuntu, `dnf install polkit`
  on Fedora). Without it, the agent runs, but shutdown and reboot fail.
- Wake-on-LAN mode: `ping` (iputils or BusyBox) and `ip` (iproute2).
- `curl` and `sha256sum` for the install script.

| Binary | For |
| --- | --- |
| `netignite-agent-linux-x64` | x86-64 CPUs with AVX2 (about 2013 and newer) |
| `netignite-agent-linux-x64-baseline` | Any x86-64 CPU |
| `netignite-agent-linux-arm64` | 64-bit ARM, for example a Raspberry Pi 3, 4 or 5 with a 64-bit OS |

## Install

1. In the dashboard, create an agent of the kind **Linux agent** (**Agents → Add agent**).
2. On its page, click **Create setup command**.
3. Run the command on the Linux machine within 15 minutes:

```bash [Terminal]
curl -fsSL https://netignite.example.com/install/linux.sh | sudo sh -s -- netignite_enroll_…
```

The script, served by your NetIgnite server:

1. checks that it runs on Linux as root with `curl`, `sha256sum` and systemd,
2. picks the binary for the CPU: `arm64`, `x64` if the CPU has AVX2, `x64-baseline` otherwise,
3. downloads it and `SHA256SUMS` from the
   [GitHub releases](https://github.com/NetIgnite-project/Agent-Linux/releases) and checks the
   checksum,
4. [pairs](#pair) the agent with the server using the token,
5. [installs](#the-systemd-service) the systemd service and starts it.

The agent shows up as online on its page. Then:

- To control **this machine**, open (or add) the device for it, choose the agent under
  **Linux agent on the device**, and choose the status check **Linux agent on the device**. The
  device gets **Shut down** and **Reboot**.
- To **wake other devices**, turn on [Wake-on-LAN mode](#wake-on-lan-mode) and choose the agent as
  the **Agent** of those devices.

By default, the script installs the newest release, pre-releases included. The server's admin can
pin a release with `NETIGNITE_LINUX_AGENT_VERSION` or use another repository with
`NETIGNITE_LINUX_AGENT_REPO` (see [Configuration](/docs/server/configuration#linux-agent-installer)).
On the machine, the variables `NETIGNITE_AGENT_VERSION` (a release tag) and
`NETIGNITE_AGENT_BASE_URL` (a mirror with the release files) override that; pass them through
`sudo env`:

```bash [Terminal]
curl -fsSL https://netignite.example.com/install/linux.sh | sudo env NETIGNITE_AGENT_VERSION=v1.0.0 sh -s -- netignite_enroll_…
```

### Manual install

Without the script, or if the machine reaches the server under another address than the
dashboard's:

```bash [Terminal]
arch=x64   # or x64-baseline, arm64
base=https://github.com/NetIgnite-project/Agent-Linux/releases/latest/download
curl -fsSLO "$base/netignite-agent-linux-$arch"
curl -fsSLO "$base/SHA256SUMS"
sha256sum --check --ignore-missing SHA256SUMS
chmod +x "netignite-agent-linux-$arch"

sudo ./netignite-agent-linux-$arch pair https://netignite.example.com netignite_enroll_…
sudo ./netignite-agent-linux-$arch install
```

`releases/latest` skips pre-releases. `install` copies the binary to
`/usr/local/bin/netignite-agent`.

### Updating

Run the install script again without a token. It downloads the current release and reinstalls the
service with the existing pairing:

```bash [Terminal]
curl -fsSL https://netignite.example.com/install/linux.sh | sudo sh
```

## Pair

```bash [Terminal]
sudo netignite-agent pair <server-url> <enrollment-token> [--wol] [--config <path>]
```

- The agent generates its own secret (32 random bytes), sends it with the token to
  `POST <server>/api/v1/agents/enroll` and writes the result to `/etc/netignite/agent.json`
  (mode `0600`). Neither the secret nor the token is printed.
- `<server-url>` is the server's address, for example `https://netignite.example.com` or
  `http://192.168.1.10:18232`. A missing scheme means `https://`.
- Pairing again with a new token replaces the credential. The server disconnects the old one, and
  an installed service is restarted with the new one.
- A token of an ESP32 agent is refused and stays valid for that ESP32. Create a Linux agent for this
  machine instead.
- `--wol` turns on Wake-on-LAN mode. Without it, pairing again keeps the previous mode.

The config file looks like this:

```json [agent.json]
{
	"server": "https://netignite.example.com",
	"agent_id": 3,
	"token_id": "…",
	"secret": "…",
	"wol": { "enabled": false }
}
```

## Host mode

In host mode, the agent announces the capabilities `host.status` and `host.control`. The server can
then:

- show the machine as online while the agent is connected (status check
  *Linux agent on the device*),
- send `HOST_CONTROL` with `shutdown` or `reboot`. The agent first asks systemd-logind whether it
  may (`CanPowerOff`/`CanReboot`); if not (polkit rule missing, or a block inhibitor such as a
  running package upgrade), it answers with the reason, which the dashboard shows. Otherwise it
  answers, waits about a second and runs `systemctl --no-ask-password poweroff` or
  `systemctl --no-ask-password reboot`.

Nothing else: the server can't run commands, read files or change the configuration. If
`systemctl` still fails after the answer, the error is in the agent's journal.

## Wake-on-LAN mode

```bash [Terminal]
sudo netignite-agent wol-mode on     # or: pair --wol
sudo netignite-agent wol-mode off
```

`wol-mode` updates the config and the installed service, and restarts it. In this mode, the agent
also announces `wake`, `status.link_local`, `status.ip`, `status.host`, `status.tcp` and `ssh`:

- **Wake:** a magic packet over UDP to `255.255.255.255` and each network interface's broadcast
  address, three times, 100 ms apart.
- **Status:** the device is online if it answers a ping (`ping -c 1 -W 1`) or the TCP port (a
  refused connection counts too). For the MAC check, the agent first looks at the neighbor table
  (`ip neigh`): a reachable entry for the MAC address counts as online. Otherwise it pings the
  IPv6 link-local address derived from the MAC address and the addresses the neighbor table knows
  for it. Every check answers within 4.5 seconds.
- **SSH:** logins to devices in the network for [shutdown and reboot over SSH](/docs/guides/ssh).

To test Wake-on-LAN from the machine itself:

```bash [Terminal]
netignite-agent wol AA:BB:CC:DD:EE:FF --port 9
```

## The systemd service

`install` needs root and a paired config. It:

- creates the system user `netignite` (no home directory, no login shell),
- copies the binary to `/usr/local/bin/netignite-agent`,
- makes the config readable for the service: `/etc/netignite` owned by `root:netignite` with mode
  `0750`, `agent.json` owned by `netignite` with mode `0600`,
- writes `/etc/systemd/system/netignite-agent.service`,
- writes the polkit rule `/etc/polkit-1/rules.d/50-netignite-agent.rules` (plus a `.pkla` file in
  `/etc/polkit-1/localauthority/50-local.d/` on polkit older than 0.106, for example Debian 11),
- runs `systemctl daemon-reload`, `enable` and `restart`.

`sudo netignite-agent install --dry-run` prints every step and the files' contents without changing
anything. The unit for host mode (comments left out):

```ini [netignite-agent.service]
[Unit]
Description=NetIgnite Agent
Documentation=https://github.com/NetIgnite-project/Agent-Linux
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=netignite
Group=netignite
ExecStart=/usr/local/bin/netignite-agent run --config /etc/netignite/agent.json
Restart=always
RestartSec=5
RestartPreventExitStatus=78
TimeoutStopSec=10

NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
PrivateDevices=yes
ReadOnlyPaths=/etc/netignite
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectKernelLogs=yes
ProtectControlGroups=yes
ProtectClock=yes
ProtectHostname=yes
RestrictNamespaces=yes
RestrictRealtime=yes
RestrictSUIDSGID=yes
LockPersonality=yes
SystemCallArchitectures=native
UMask=0077
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6 AF_NETLINK
CapabilityBoundingSet=

[Install]
WantedBy=multi-user.target
```

In Wake-on-LAN mode, the last line is replaced by `CapabilityBoundingSet=CAP_NET_RAW` and
`AmbientCapabilities=CAP_NET_RAW`, which `ping` needs. Use `systemctl edit netignite-agent` for local
changes; `install` and `wol-mode` overwrite the unit file.

### polkit

The rule lets the user `netignite`, and nobody else, use exactly the logind actions behind
`systemctl poweroff` and `systemctl reboot`:

```js [polkit rule]
polkit.addRule(function (action, subject) {
	var allowed = [
		"org.freedesktop.login1.power-off",
		"org.freedesktop.login1.power-off-multiple-sessions",
		"org.freedesktop.login1.reboot",
		"org.freedesktop.login1.reboot-multiple-sessions"
	];
	if (subject.user == "netignite" && allowed.indexOf(action.id) >= 0) {
		return polkit.Result.YES;
	}
});
```

The `*-multiple-sessions` actions apply when other users are logged in, for example over SSH. The
`*-ignore-inhibit` actions aren't granted, so a block inhibitor (a running package upgrade, for
example) still stops a remote shutdown. `systemctl` asks logind over D-Bus, and logind asks polkit;
no setuid helper is involved, so `NoNewPrivileges` doesn't get in the way.

## Commands

| Command | What it does |
| --- | --- |
| `pair <server-url> <token>` | Registers with the server and writes the config (`--wol`, `--config`). |
| `install` | Sets up and starts the systemd service (`--config`, `--dry-run`). |
| `uninstall` | Removes the service (`--purge`, `--config`, `--dry-run`). |
| `run` | Runs the agent in the foreground; this is what the service runs (`--wol`, `--config`). |
| `status` | Shows the config, the server, the agent ID, the service state and whether the server and the credential work. Never shows the secret. |
| `wol-mode on\|off` | Turns Wake-on-LAN mode on or off (`--config`). |
| `wol <mac>` | Sends a magic packet from this machine (`--port`, default `9`). |
| `version` | Prints the version. |

Global flags go before the command, for example `netignite-agent --log-level debug run`. The
default config path is `/etc/netignite/agent.json`.

Exit codes: `0` success, `1` error, `78` the server rejected the credential. The service isn't
restarted after `78`; pair again.

```bash [Terminal]
sudo netignite-agent status
journalctl -u netignite-agent -f
```

## Connection

The agent keeps one WebSocket to `<server>/ws/agent` (`wss://` for `https://` servers) and speaks
the [agent protocol](/docs/agents/protocol). Its `HELLO` reports the version, the capabilities and,
for the dashboard, the host name, OS, kernel, architecture, uptime, IP addresses and whether
Wake-on-LAN mode is on.

- It reconnects after 5 seconds, doubling the wait up to 60 seconds. If the server sends nothing for
  100 seconds (it pings every 30 seconds), the agent drops the connection and reconnects.
- It stops for good and exits with `78` when the server rejects the credential (HTTP 401), revokes
  it (close code `4003`, for example after pairing again or **Revoke credential**) or deletes the
  agent (`4004`).
- If another connection with the same credential takes over (`4000`), it waits 60 seconds before
  reconnecting, so two copies of the agent don't keep replacing each other.

## Uninstall

```bash [Terminal]
sudo netignite-agent uninstall           # keeps /etc/netignite/agent.json (root-only again)
sudo netignite-agent uninstall --purge   # also deletes the config with the credential
```

This stops and disables the service and removes the unit, the polkit rule, the user `netignite`
and `/usr/local/bin/netignite-agent`. `--dry-run` shows the steps. Delete the agent in the dashboard
too.

## Security

- **Fixed actions only.** The server can ask for `PING`, `HOST_CONTROL` (`shutdown` or `reboot`)
  and, in Wake-on-LAN mode, `WAKE`, `STATUS`, `SSH_CHECK` and `SSH_EXEC` (one of four fixed commands
  on another device). Every parameter is validated; commands run without a shell, and only IP
  addresses reach `ping`. There's no remote shell, no file access and no configuration change from
  the server.
- **The secret** is generated on the machine and only leaves it in the `Authorization` header. The
  server stores only a hash. It's in `/etc/netignite/agent.json` with mode `0600` and never printed,
  not even by `status`. Use an `https://` server address outside your LAN.
- **The service** runs as the unprivileged user `netignite` with the hardening options above, without
  capabilities in host mode and with only `CAP_NET_RAW` in Wake-on-LAN mode.
- **SSH logins** for other devices arrive with each request and are only kept in memory for that
  login; the agent never writes or logs them. See [SSH](/docs/guides/ssh#security).
- The binary doesn't load `.env` or `bunfig.toml` from the working directory, so a stray file there
  can't change how `pair` or `install` behave when run as root.

## Building from source

The agent is written in TypeScript and compiled with [Bun](https://bun.sh) into single binaries.

```bash [Terminal]
git clone https://github.com/NetIgnite-project/Agent-Linux.git
cd Agent-Linux
bun install
bun test
bun run compile all --no-version-tag   # build/bin/netignite-agent-linux-{x64,x64-baseline,arm64}
```

Releases are built by the repository's release workflow when a tag `v<version>` is pushed; it
attaches the three binaries and `SHA256SUMS`. Versions with a suffix, such as `1.0.0-beta.1`, are
published as pre-releases.
