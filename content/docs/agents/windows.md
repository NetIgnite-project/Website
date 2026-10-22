---
title: "Windows Agent"
description: "The NetIgnite agent for Windows: install it with one PowerShell command, the scheduled task, shutdown and restart, uninstalling and security."
navigation:
  title: Windows Agent
---

# Windows Agent

The NetIgnite agent runs on a Windows PC, too. The dashboard then sees whether the PC is online and
can **shut it down or restart it**. It's the same program as the [Linux agent](/docs/agents/linux),
in host mode; [Wake-on-LAN mode](/docs/agents/linux#wake-on-lan-mode) (waking other devices) is
only available on Linux.

The agent runs in the background as the built-in account `LOCAL SERVICE`, which can't read your
user folders. It talks to the server over one outgoing WebSocket; nothing listens on the PC. Source
and releases: [NetIgnite-project/Agent-Linux](https://github.com/NetIgnite-project/Agent-Linux).

## Requirements

- Windows 10 or 11, 64-bit, on an x86-64 CPU (`netignite-agent-windows-x64.exe`).
- PowerShell (included in Windows) and an administrator account for the installation.

## Install

1. In the dashboard, create an agent of the kind **Windows agent** (**Agents → Add agent**).
2. On its page, click **Create setup command**.
3. Open PowerShell with **Run as administrator** (right-click the Start button → *Terminal (Admin)*
   or *Windows PowerShell (Admin)*) and run the command within 15 minutes:

```powershell [PowerShell (administrator)]
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12; & ([scriptblock]::Create((irm 'https://netignite.example.com/install/windows.ps1'))) 'netignite_enroll_…'
```

The script, served by your NetIgnite server:

1. checks that it runs as an administrator on 64-bit Windows,
2. downloads `netignite-agent-windows-x64.exe` and `SHA256SUMS` from the
   [GitHub releases](https://github.com/NetIgnite-project/Agent-Linux/releases) and checks the
   checksum,
3. pairs the agent with the server using the token,
4. [installs](#the-scheduled-task) the agent and starts it.

The agent shows up as online on its page. Then open (or add) the device for this PC, choose the
agent under **Agent on the device**, and choose the status check **Agent on the device**. The device
gets **Shut down** and **Reboot**.

The release it installs is chosen like for the [Linux agent](/docs/agents/linux#install): the
newest stable one, unless the server's admin pinned another. `$env:NETIGNITE_AGENT_VERSION` (a
release tag) and `$env:NETIGNITE_AGENT_BASE_URL` (a mirror with the release files), set in the same
PowerShell window before the command, override that.

### Manual install

Download `netignite-agent-windows-x64.exe` and `SHA256SUMS` from the
[releases](https://github.com/NetIgnite-project/Agent-Linux/releases), compare
`(Get-FileHash .\netignite-agent-windows-x64.exe).Hash` with the line in `SHA256SUMS`, and run in
PowerShell as an administrator:

```powershell [PowerShell (administrator)]
.\netignite-agent-windows-x64.exe pair https://netignite.example.com netignite_enroll_…
.\netignite-agent-windows-x64.exe install
```

### Updating

Run the setup command again without the token at the end (`… /install/windows.ps1')))`). It
downloads the current release and reinstalls it with the existing pairing.

### Pairing again

If the agent is already installed, the agent's page offers a pair command under *Agent already
installed?*:

```powershell [PowerShell (administrator)]
& "C:\Program Files\NetIgnite\netignite-agent.exe" pair https://netignite.example.com netignite_enroll_…
```

The running agent restarts with the new credential.

## The scheduled task

`install`:

- copies the agent to `C:\Program Files\NetIgnite\netignite-agent.exe`,
- keeps the config `C:\ProgramData\NetIgnite\agent.json` readable for administrators, `SYSTEM` and
  `LOCAL SERVICE` only (`pair` already restricts the folder: below `ProgramData`, every user could
  read it otherwise),
- gives `LOCAL SERVICE` write access to the log folder `C:\ProgramData\NetIgnite\logs`,
- registers the scheduled task **NetIgnite Agent**: started at boot, before anyone logs in, as
  `LOCAL SERVICE`; restarted once a minute if it stops; no time limit; also on battery,
- starts it.

The permissions are set by the accounts' SIDs, so it works on Windows in any language. The task is
visible in the Task Scheduler; don't change it there, run `install` again instead.

## Shutdown and restart

The server sends `HOST_CONTROL` with `shutdown` or `reboot`. `LOCAL SERVICE` may shut the PC down,
so the agent answers and runs `shutdown.exe /s /t 0 /d p:0:0` (or `/r` to restart) itself. That's
the only program it runs. Windows asks the open programs to close; one with unsaved changes can
hold up the shutdown until someone answers on the PC.

## Commands

In PowerShell as an administrator, with `& "C:\Program Files\NetIgnite\netignite-agent.exe"` in
front:

| Command | What it does |
| --- | --- |
| `pair <server-url> <token>` | Registers with the server and writes the config. |
| `install` | Sets up and starts the scheduled task (`--dry-run`). |
| `uninstall` | Removes it (`--purge`, `--dry-run`). |
| `status` | Shows the config, the server, the agent ID, the task's state and whether the server and the credential work. Never shows the secret. |
| `version` | Prints the version. |

The agent logs to `C:\ProgramData\NetIgnite\logs\agent.log` (up to 1 MB, then `agent.log.1`).

## Uninstall

```powershell [PowerShell (administrator)]
& "C:\Program Files\NetIgnite\netignite-agent.exe" uninstall           # keeps the config (administrators only)
& "C:\Program Files\NetIgnite\netignite-agent.exe" uninstall --purge   # also deletes the config with the credential
```

This stops and deletes the task, the log folder and `C:\Program Files\NetIgnite` (the program file
is deleted right after the command has finished, since Windows can't delete a running program).
Delete the agent in the dashboard too.

## Security

- **Fixed actions only.** The server can ask for `PING` and `HOST_CONTROL` (`shutdown` or
  `reboot`). There's no remote shell, no file access and no configuration change from the server.
- **The secret** is generated on the PC and only leaves it in the `Authorization` header. The
  server stores only a hash. The config folder is readable for administrators, `SYSTEM` and the
  agent only. Use an `https://` server address outside your LAN.
- **The account** `LOCAL SERVICE` is Windows' built-in account for services with minimal rights:
  it can't read your user folders or change the system, but it may shut down. The agent needs no
  administrator rights after the installation.
