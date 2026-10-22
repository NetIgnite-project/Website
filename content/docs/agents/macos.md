---
title: "macOS Agent"
description: "The NetIgnite agent for macOS: install it with one command, the launchd daemons, shutdown and restart, uninstalling and security."
navigation:
  title: macOS Agent
---

# macOS Agent

The NetIgnite agent runs on a Mac, too. The dashboard then sees whether the Mac is online and can
**shut it down or restart it**. It's the same program as the [Linux agent](/docs/agents/linux), in
host mode; [Wake-on-LAN mode](/docs/agents/linux#wake-on-lan-mode) (waking other devices) is only
available on Linux.

The agent runs in the background as its own hidden user without rights. It talks to the server
over one outgoing WebSocket; nothing listens on the Mac. Source and releases:
[NetIgnite-project/Agent-Linux](https://github.com/NetIgnite-project/Agent-Linux).

## Requirements

- macOS 13 (Ventura) or newer, on Apple silicon (`netignite-agent-macos-arm64`) or an Intel Mac
  (`netignite-agent-macos-x64`).
- An administrator account for the installation.

## Install

1. In the dashboard, create an agent of the kind **macOS agent** (**Agents → Add agent**).
2. On its page, click **Create setup command**.
3. Run the command in Terminal on the Mac within 15 minutes:

```bash [Terminal]
curl -fsSL https://netignite.example.com/install/macos.sh | sudo sh -s -- netignite_enroll_…
```

The script, served by your NetIgnite server:

1. checks that it runs on macOS as root,
2. picks the binary for the CPU (`arm64` on Apple silicon, also from a Terminal running under
   Rosetta),
3. downloads it and `SHA256SUMS` from the
   [GitHub releases](https://github.com/NetIgnite-project/Agent-Linux/releases) and checks the
   checksum,
4. signs it ad hoc (`codesign --force --sign -`): the binaries aren't signed by Apple, and macOS
   only runs Apple silicon programs with a signature,
5. pairs the agent with the server using the token,
6. [installs](#the-launchd-daemons) the agent and starts it.

The agent shows up as online on its page. Then open (or add) the device for this Mac, choose the
agent under **Agent on the device**, and choose the status check **Agent on the device**. The
device gets **Shut down** and **Reboot**.

The release it installs is chosen like for the [Linux agent](/docs/agents/linux#install), with the
same variables `NETIGNITE_AGENT_VERSION` and `NETIGNITE_AGENT_BASE_URL` (pass them through
`sudo env`).

### Manual install

```bash [Terminal]
arch=arm64   # or x64 for an Intel Mac
base=https://github.com/NetIgnite-project/Agent-Linux/releases/latest/download
curl -fsSLO "$base/netignite-agent-macos-$arch"
curl -fsSLO "$base/SHA256SUMS"
grep " netignite-agent-macos-$arch\$" SHA256SUMS | shasum -a 256 -c
chmod +x "netignite-agent-macos-$arch"
codesign --force --sign - "netignite-agent-macos-$arch"

sudo ./netignite-agent-macos-$arch pair https://netignite.example.com netignite_enroll_…
sudo ./netignite-agent-macos-$arch install
```

### Updating

Run the install script again without a token:

```bash [Terminal]
curl -fsSL https://netignite.example.com/install/macos.sh | sudo sh
```

If the agent is already installed, pair it again with `sudo netignite-agent pair …` (the agent's
page shows the command under *Agent already installed?*).

## The launchd daemons

`install`:

- creates the hidden system user and group `_netignite` (an ID between 400 and 499, no shell, no
  home folder),
- copies the agent to `/usr/local/bin/netignite-agent`,
- makes the config `/usr/local/etc/netignite/agent.json` readable for `_netignite` only (besides
  root),
- creates the request folders `/usr/local/var/netignite-agent/shutdown` and `…/reboot` (owned by
  `_netignite`, mode `0700`) and the log folder `/usr/local/var/log/netignite-agent`,
- writes three daemons to `/Library/LaunchDaemons` and loads them:

| Daemon | Runs as | Does |
| --- | --- | --- |
| `dev.netignite.agent` | `_netignite` | The agent. launchd starts it at boot and restarts it if it stops. |
| `dev.netignite.agent.shutdown` | root | Shuts the Mac down when the agent asks (see below). Nothing else. |
| `dev.netignite.agent.reboot` | root | The same for a restart. |

## Shutdown and restart

The user `_netignite` has no right to shut the Mac down. Like on Linux, a small root service does
it on request:

1. For a shutdown, the agent creates a file in `/usr/local/var/netignite-agent/shutdown` (only it
   and root can write there).
2. launchd sees the file (`QueueDirectories`) and starts the root daemon
   `dev.netignite.agent.shutdown`. It empties the folder and runs `/sbin/shutdown -h now`
   (`-r now` for a restart), but only if the request is less than a minute old: an old request, for
   example from right before a power cut, is only removed.
3. The agent waits up to 5 seconds for the request to be picked up. If nothing does, it removes the
   request again and the dashboard shows the error.

Before answering the server, the agent checks that the request folder exists; if not, the dashboard
says to run `sudo netignite-agent install` again. Open apps are quit without asking; changes that
an app doesn't save by itself are lost.

## Commands

| Command | What it does |
| --- | --- |
| `pair <server-url> <token>` | Registers with the server and writes the config. |
| `install` | Sets up and starts the daemons (`--dry-run`). |
| `uninstall` | Removes them (`--purge`, `--dry-run`). |
| `status` | Shows the config, the server, the agent ID, the daemon's state and whether the server and the credential work. Never shows the secret. |
| `version` | Prints the version. |

Run them with `sudo netignite-agent …`. The agent logs to
`/usr/local/var/log/netignite-agent/agent.log` (up to 1 MB, then `agent.log.1`).

## Uninstall

```bash [Terminal]
sudo netignite-agent uninstall           # keeps the config (root-only again)
sudo netignite-agent uninstall --purge   # also deletes the config with the credential
```

This unloads and deletes the three daemons, the request and log folders,
`/usr/local/bin/netignite-agent` and the user `_netignite`. Delete the agent in the dashboard too.

## Security

- **Fixed actions only.** The server can ask for `PING` and `HOST_CONTROL` (`shutdown` or
  `reboot`). There's no remote shell, no file access and no configuration change from the server.
- **The secret** is generated on the Mac and only leaves it in the `Authorization` header. The
  server stores only a hash. The config is readable for root and `_netignite` only. Use an
  `https://` server address outside your LAN.
- **The agent** runs as `_netignite`, without rights. The root daemons do exactly one thing each and
  read nothing from the request but its age.
