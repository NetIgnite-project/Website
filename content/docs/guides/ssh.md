---
title: "SSH"
description: "Shut down and reboot devices over SSH: why the Linux agent is the safer choice, a dedicated user with a generated Ed25519 key that may only shut down and reboot, and trusting the host key."
navigation:
  title: SSH
---

# SSH

For devices that can't run the [Linux agent](/docs/agents/linux) (many NAS systems, a Mac, a BSD
box, a Windows PC with OpenSSH Server), NetIgnite can shut them down and reboot them over SSH. The
**device's agent** logs in, because it's the one inside the LAN; the server stores the login and
sends it to that agent for each command.

::warning
**Prefer the Linux agent wherever it runs.** For a Linux machine with systemd, install the
[Linux agent](/docs/agents/linux) on it and choose it as the device's **Linux agent** instead of
setting up SSH. It can only shut down and reboot that machine, and no login to the
machine is stored anywhere. With SSH, the server stores a login to the device: whoever gets the
server's database **and** its secrets key can log in to the device with it. If you use SSH, log in
as a [dedicated user](#a-dedicated-user) that may only shut down and reboot, with a generated key.
Never use `root`, an administrator or your own account (Windows is the exception that needs an
administrator, see [Windows](#windows)).
::

What NetIgnite does over SSH is fixed:

| | Linux, macOS, BSD | with *Use sudo* | Windows (OpenSSH) |
| --- | --- | --- | --- |
| Shut down | `shutdown -h now` | `sudo -n shutdown -h now` | `shutdown /s /t 0` |
| Reboot | `shutdown -r now` | `sudo -n shutdown -r now` | `shutdown /r /t 0` |

There's no way to run anything else: no shell, no file access, no other commands.

## Requirements

- The device's **Agent** (on its **General** tab) must be able to log in over SSH and be online: an
  ESP32 agent or a Linux agent in [Wake-on-LAN mode](/docs/agents/linux#wake-on-lan-mode), in the
  device's network. The agent's capabilities on its page include `ssh` then.
- An SSH server on the device, reachable from the agent.
- You must be the device's owner. The **SSH** tab isn't available to users the device is shared
  with.

## A dedicated user

The stored login should be able to do as little as possible on the device, so that a leaked login
allows nothing but a shutdown:

- **A user only for NetIgnite**, for example `netignite`. Not `root`, not your own account.
- **No other rights.** Don't add it to `sudo`, `wheel`, `admin` or any other group with extra
  rights. The sudoers line from **Prepare the device** allows it exactly the two `shutdown`
  commands.
- **A generated key, not a password.** The `authorized_keys` line of a generated key lets only the
  two commands through. A password works for everything the account can do, including a shell.

On Linux, create the user with:

```sh
sudo useradd --create-home --shell /bin/sh netignite
sudo -u netignite mkdir -m 700 /home/netignite/.ssh
```

Keep a real shell such as `/bin/sh` (not `nologin`): SSH runs the forced command through the user's
shell. Then add the `authorized_keys` and sudoers lines as described
[below](#linux-macos-bsd). On macOS, create a **Standard** user (not an administrator) in
**System Settings → Users & Groups** and allow it under **Remote Login**; on BSD, use `adduser`.

For Linux, macOS and BSD, the dashboard warns when the username is `root`, `admin` or `Administrator`.

## Setting up the login

Open the device and its **SSH** tab:

| Field | Description |
| --- | --- |
| **Host** | Host name or IP address. Empty: the device's status check address. |
| **Port** | Usually `22`. |
| **Username** | The account the agent logs in with: a [dedicated user](#a-dedicated-user), for example `netignite`. |
| **Operating system** | *Linux, macOS, BSD* or *Windows (OpenSSH)*. Decides the command (table above). |
| **Use sudo** | Linux, macOS, BSD: run `shutdown` with `sudo -n`. Not needed for `root`. |
| **Authentication** | **New key pair** (recommended): the server generates an Ed25519 key pair. **Password**: the account's password. **Keep the current**: change the other fields only. |

Click **Save login**. With a generated key, the **Prepare the device** card shows what to add on
the device.

### Linux, macOS, BSD

1. Add the line from **Prepare the device** to `~/.ssh/authorized_keys` of the user. It looks
   like this (with *Use sudo*):

   ```text [authorized_keys]
   restrict,command="case \"$SSH_ORIGINAL_COMMAND\" in 'sudo -n shutdown -h now'|'sudo -n shutdown -r now') exec $SSH_ORIGINAL_COMMAND ;; *) echo 'Only shutdown and reboot are allowed' >&2; exit 1 ;; esac" ssh-ed25519 AAAA… netignite-device-7
   ```

   `restrict` turns off port forwarding, agent forwarding and a terminal. The forced `command` lets
   only the two commands through and refuses anything else, so the key is useless for anything but
   shutdown and reboot. **Test login** doesn't open a session, so the forced command doesn't run
   for it. You can add `from="<agent's IP address>"` after `restrict,` to accept the key only
   from the agent.

2. With *Use sudo*, allow the two commands without a password. Run
   `sudo visudo -f /etc/sudoers.d/netignite` and add the line from **Prepare the device**:

   ```text [sudoers]
   netignite ALL=(root) NOPASSWD: /usr/sbin/shutdown -h now, /usr/sbin/shutdown -r now, /sbin/shutdown -h now, /sbin/shutdown -r now
   ```

   `sudo -n` fails at once instead of asking for a password, so a missing line shows up in the
   dashboard as `sudo: a password is required`.

With a password instead of a key, there's no forced command: the account can do whatever its
password allows. Prefer a key.

### Windows

Install **OpenSSH Server** (Settings → System → Optional features), start the `sshd` service and
choose *Windows (OpenSSH)* as the operating system. Shutting down needs an administrator account,
so on Windows the login can't be limited to shutdown and reboot: whoever gets it controls the PC.
Keep the risk small:

- Create a **separate administrator account only for NetIgnite** instead of using your own or the
  built-in `Administrator`.
- Use a **generated key** rather than a password, and accept it only from the agent: put
  `restrict,from="<agent's IP address>"` at the start of its line.

Where the login goes:

- **Key:** put the line from **Prepare the device** (`restrict ssh-ed25519 AAAA…`) into
  `C:\ProgramData\ssh\administrators_authorized_keys`. Only Administrators and SYSTEM may have
  access to that file. Windows' OpenSSH runs forced commands through `cmd.exe`, so this line has no
  forced command.
- **Password:** use the account's password.

## Trusting the host key

NetIgnite trusts a device's SSH host key on first use, after you've checked it:

1. In the **Host key** card, click **Test login**. The agent connects, checks the login without
   running anything and reports the device's host key fingerprint (`SHA256:…`).
2. Compare it with the key on the device, for example
   `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`.
3. Click **Trust this host key**.

Shutdown and reboot over SSH work from then on: the power button of the device gets **Shut down**
and **Reboot**. Every later login checks the key first and stops before sending the password or
key if it differs. Changing the login's host or port removes the trusted key; test and trust again.

| Test result | Meaning |
| --- | --- |
| *Login works* | The agent logged in. Trust the key if you haven't. |
| *The device didn't answer on its SSH port* | Wrong host or port, the device is off, or a firewall blocks it. |
| *Login failed*, `auth_failed` | Wrong username, password, or `authorized_keys` line. |
| *Login failed*, `host_key_mismatch` | The device presents another key than the trusted one. If you reinstalled the device, trust the new key; otherwise someone may be intercepting the connection. |

## Security

- **A stored login is a key to the device.** That's why the [Linux agent](/docs/agents/linux) is the
  better choice for Linux machines, and why the login should belong to a
  [dedicated user](#a-dedicated-user) that may only shut down and reboot.
- **Write-only.** The API never returns a stored password or private key. The dashboard only shows
  the public key.
- **Encrypted at rest.** Passwords and private keys are encrypted with the server's secrets key
  (`NETIGNITE_SECRETS_KEY` or `config/secrets.key`). Back up the key with the database; without it,
  you have to set the logins up again.
- **Only to the device's agent.** The login is sent over the agent's TLS WebSocket for each test or
  command, kept in memory only for that login and wiped afterwards. The agent never stores or logs
  it.
- **Fixed commands, trusted host key.** Commands only run on a device whose host key you trusted.
- **Owner only.** Users the device is shared with can use **Shut down** and **Reboot** (operators
  and managers) but can't see or change the login.

## Removing the login

**Remove SSH login** deletes the stored password or key. Remove the `authorized_keys` line and the
sudoers file from the device too.
