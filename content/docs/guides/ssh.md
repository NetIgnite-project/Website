---
title: "SSH"
description: "Shut down and reboot devices that can't run the NetIgnite agent over SSH: the agent's own keys, one forced command per key, a dedicated user, and trusting the host key."
navigation:
  title: SSH
---

# SSH

For devices that can't run the NetIgnite agent themselves (many NAS systems, a BSD box, an older
Mac or a Windows PC with OpenSSH Server you'd rather not install it on), NetIgnite can shut them
down and reboot them over SSH. The **device's agent** logs in, because it's the one inside the
LAN: an ESP32, or a Linux agent in Wake-on-LAN mode.

::warning
**Prefer the NetIgnite agent on the device wherever it runs.** For a Linux, Windows or macOS
machine, install the agent on it ([Linux](/docs/agents/linux), [Windows](/docs/agents/windows),
[macOS](/docs/agents/macos)) and choose it as the device's **Agent on the device** instead of
setting up SSH. It can only shut down and reboot that machine, and no login to the machine exists.
Use SSH for devices that can't run the agent, with a [dedicated user](#a-dedicated-user).
::

SSH is **off** until an admin turns it on under **Server Settings → SSH**.

## How it works

- **No secrets on the server.** Every agent that can log in over SSH has two Ed25519 key pairs of
  its own, one for shutdown and one for reboot. It creates them itself (the ESP32 on its first
  boot, the Linux agent when it's paired) and never sends the private keys anywhere. The server
  only knows the public keys, which the agent reports when it connects.
- **One command per key.** The device allows the two keys in its `authorized_keys`, each with a
  forced command. Whatever the client asks for, the shutdown key runs the shutdown command and the
  reboot key the reboot command, and nothing else: no shell, no file access, no other commands.
- **The agent asks for the same fixed command** and nothing the server sends ends up in it:

  | | Linux, macOS, BSD | with *Use sudo* | Windows (OpenSSH) |
  | --- | --- | --- | --- |
  | Shut down | `shutdown -h now` | `sudo -n shutdown -h now` | `shutdown /s /t 0` |
  | Reboot | `shutdown -r now` | `sudo -n shutdown -r now` | `shutdown /r /t 0` |

- **Over HTTPS only.** Agents only offer SSH when they connect to the server over HTTPS, and they
  make at most 10 SSH logins a minute.

So whoever gets hold of the server or its database finds no password and no private key. A
compromised server could still make the agent shut down or reboot the devices that allow its keys,
which it could do with the agent on the device too.

## Requirements

- An admin turned SSH on under **Server Settings**.
- The device's **Agent** (on its **General** tab) is online, in the device's network, and can log
  in over SSH: an ESP32 with firmware newer than 2.0.0, or a Linux agent newer than 1.0.0 in
  [Wake-on-LAN mode](/docs/agents/linux#wake-on-lan-mode), connected to the server over HTTPS. Its
  capabilities on its page include `ssh.power` then.
- An SSH server on the device, reachable from the agent.
- You must be the device's owner. The **SSH** tab isn't available to users the device is shared
  with.

## A dedicated user

Log in as a user that can do as little as possible on the device:

- **A user only for NetIgnite**, for example `netignite`. Not `root`, not your own account.
- **No other rights.** Don't add it to `sudo`, `wheel`, `admin` or any other group with extra
  rights. The sudoers line from **Prepare the device** allows it exactly the two `shutdown`
  commands.

On Linux, create the user with:

```sh
sudo useradd --create-home --shell /bin/sh netignite
sudo -u netignite mkdir -m 700 /home/netignite/.ssh
```

Keep a real shell such as `/bin/sh` (not `nologin`): SSH runs the forced command through the user's
shell. On macOS, create a **Standard** user (not an administrator) in **System Settings → Users &
Groups** and allow it under **Remote Login**; on BSD, use `adduser`. On Windows, shutting down needs
an administrator account (see [Windows](#windows)).

For Linux, macOS and BSD, the dashboard warns when the username is `root`, `admin`, `Administrator` or `ALL` (which the
sudoers line would treat as *every user*).

## Setting up the login

Open the device and its **SSH** tab:

| Field | Description |
| --- | --- |
| **Host** | Host name or IP address. Empty: the device's status check address. |
| **Port** | Usually `22`. |
| **Username** | The account the agent logs in with: a [dedicated user](#a-dedicated-user), for example `netignite`. |
| **Operating system** | *Linux, macOS, BSD* or *Windows (OpenSSH)*. Decides the commands (table above). |
| **Use sudo** | Linux, macOS, BSD: run `shutdown` with `sudo -n`. Not needed for `root`. |

Click **Save login**. The **Prepare the device** card then shows the lines to add on the device.

### Linux, macOS, BSD

1. Add the two lines from **Prepare the device** to `~/.ssh/authorized_keys` of the user. They look
   like this (with *Use sudo*):

   ```text [authorized_keys]
   restrict,command="sudo -n shutdown -h now" ssh-ed25519 AAAA… netignite-agent-3-shutdown
   restrict,command="sudo -n shutdown -r now" ssh-ed25519 AAAA… netignite-agent-3-reboot
   ```

   `restrict` turns off port forwarding, agent forwarding and a terminal. The forced `command`
   makes each key run exactly its command. **Test login** doesn't open a session, so the commands
   don't run for it. You can add `from="<agent's IP address>",` after `restrict,` to accept the keys
   only from the agent.

2. With *Use sudo*, allow the two commands without a password. Run
   `sudo visudo -f /etc/sudoers.d/netignite` and add the line from **Prepare the device**:

   ```text [sudoers]
   netignite ALL=(root) NOPASSWD: /usr/sbin/shutdown -h now, /usr/sbin/shutdown -r now, /sbin/shutdown -h now, /sbin/shutdown -r now
   ```

   `sudo -n` fails at once instead of asking for a password, so a missing line shows up in the
   dashboard as `sudo: a password is required`.

### Windows

Install **OpenSSH Server** (Settings → System → Optional features), start the `sshd` service and
choose *Windows (OpenSSH)* as the operating system. Windows only shuts down for administrators, so
the username must be an administrator account; use a separate one only for NetIgnite rather than
your own. Put the two lines from **Prepare the device** into
`C:\ProgramData\ssh\administrators_authorized_keys`:

```text [administrators_authorized_keys]
restrict,command="shutdown /s /t 0" ssh-ed25519 AAAA… netignite-agent-3-shutdown
restrict,command="shutdown /r /t 0" ssh-ed25519 AAAA… netignite-agent-3-reboot
```

Only Administrators and SYSTEM may have access to that file. The forced commands limit each key to
its command here too. For a Windows PC, the [Windows agent](/docs/agents/windows) is the simpler
and safer choice.

### When the keys change

The lines belong to the device's agent. They change when you choose another agent for the device,
when you factory-reset the ESP32 or install it again with the web installer, or when you set up a
Linux agent from scratch (pairing it again keeps its keys). The **SSH** tab always shows the current
lines: replace the old ones on the device.

## Trusting the host key

NetIgnite trusts a device's SSH host key on first use, after you've checked it:

1. In the **Host key** card, click **Test login**. The agent logs in with each of its two keys
   without running anything, and reports the device's host key fingerprint (`SHA256:…`).
2. Compare it with the key on the device, for example
   `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`.
3. Click **Trust this host key**.

Shutdown and reboot over SSH work from then on: the power button of the device gets **Shut down**
and **Reboot**. Every later login checks the host key first and stops before offering a key if it
differs. Changing the login's host or port removes the trusted key; test and trust again.

| Test result | Meaning |
| --- | --- |
| *Both keys work* | The device accepted both keys. Trust the host key if you haven't. |
| *The device didn't accept the shutdown key* (or reboot key) | Its line is missing or wrong in `authorized_keys`, or the username is wrong. |
| *The device didn't answer on its SSH port* | Wrong host or port, the device is off, or a firewall blocks it. |
| *The device presents another host key* | It differs from the trusted one. If you reinstalled the device, trust the new key; otherwise someone may be intercepting the connection. |

## Security

- **Nothing secret on the server.** It stores only host, port, username, operating system and the
  trusted host key fingerprint. The private keys never leave the agent.
- **One command per key.** Even someone who gets a key off the agent can only shut down or reboot
  the devices that allow it.
- **Fixed commands, trusted host key.** Commands only run on a device whose host key you trusted.
- **Off by default, HTTPS only, rate-limited.** An admin has to turn SSH on; agents only offer it
  over HTTPS and make at most 10 SSH logins a minute.
- **Owner only.** Users the device is shared with can use **Shut down** and **Reboot** (operators
  and managers) but can't see or change the SSH login.

## Removing the login

**Remove SSH login** deletes the login from the server. Remove the two `authorized_keys` lines and
the sudoers file from the device too.

## Upgrading from 2.0.0

Server 2.0.0 (and its betas) stored passwords or server-generated keys. Newer servers store no SSH
secrets: remove the old `authorized_keys` lines (or the password login) from your devices, delete
`config/secrets.key` on the server, update the device's agent (ESP32 firmware newer than 2.0.0,
Linux agent newer than 1.0.0), turn SSH on under **Server Settings**, and add the two new lines
from each device's **SSH** tab.
