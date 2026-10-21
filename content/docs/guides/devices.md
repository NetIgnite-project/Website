---
title: "Devices"
description: "Add devices to NetIgnite, prepare them for Wake-on-LAN, choose a status check, power them on, shut them down and mark favorites."
navigation:
  title: Devices
---

# Devices

A device is a machine you want to control. NetIgnite wakes it with a
[Wake-on-LAN](https://en.wikipedia.org/wiki/Wake-on-LAN) magic packet that an agent in the same
network sends, checks whether it's online, and can shut it down or reboot it.

## Preparing a device

Wake-on-LAN is a hardware feature and usually disabled by default.

1. **BIOS/UEFI.** Enable the option called *Wake on LAN*, *Power On by PCI-E* or *Resume by LAN*.
   Disable *ErP*/*EuP* power saving if your board has it, because it cuts power to the network
   card.
2. **Operating system.**
   - Windows: in Device Manager, open the network adapter's properties. Enable **Wake on Magic
     Packet**, and under **Power Management** allow the device to wake the computer. Turning off
     Fast Startup helps on many systems.
   - Linux: check with `ethtool <interface>` that `Wake-on` is `g`. Enable it with
     `ethtool -s <interface> wol g` and make it persistent through your network configuration.
3. **Wired connection.** Use Ethernet. Most computers can't be woken over Wi-Fi.
4. **Note the MAC address** of the wired network card, for example with `ip link` (Linux),
   `getmac /v` (Windows) or in your router's client list.

## Adding a device

Open **Devices → Add device** and fill in:

| Field | Description |
| --- | --- |
| **Name** | A name to recognize the device by. |
| **Type** | Server, Desktop PC, Laptop, Printer, NAS or Other. Only used for display. |
| **Description** | Optional notes. |
| **MAC address** | The MAC address of the device's wired network card, as `AA:BB:CC:DD:EE:FF` or `AA-BB-CC-DD-EE-FF`. It's stored with colons and in uppercase. |
| **Wake-on-LAN port** | The UDP port of the magic packet. Use `9` (the default) unless the device expects `7`. |
| **Agent** | The agent in the same network that wakes the device and runs its status check and SSH login: an ESP32, or a Linux agent in [Wake-on-LAN mode](/docs/agents/linux#wake-on-lan-mode). |
| **Status check** | How NetIgnite finds out whether the device is online. See [below](#status-checks). |
| **Address** | For the IPv4, IPv6 and SSH checks: the address the agent checks. |
| **TCP port** | Optional for the MAC, IPv4 and IPv6 checks; the port for the SSH check (default `22`). |
| **Linux agent on the device** | The [Linux agent](/docs/agents/linux#host-mode) running on this device, if any. It enables **Shut down** and **Reboot** and the status check *Linux agent on the device*. |

Only the owner chooses the agents; the lists show only your own agents.

## Status checks

| Status check | What the agent does | Use it for |
| --- | --- | --- |
| **Off** | Nothing; the status stays *Unknown*. | Devices you only wake. |
| **MAC (IPv6 link-local)** | Pings the IPv6 link-local address derived from the MAC address (EUI-64). A Linux agent also counts the device as online if its neighbor table (`ip neigh`) shows the MAC address as reachable. | Devices that use MAC-based IPv6 addresses. Doesn't work with Windows and many Linux defaults, which use random interface identifiers. |
| **IPv4 address** | Pings the address. | Most devices. Give them a fixed address (DHCP reservation). |
| **IPv6 address** | Pings the address. A zone such as `fe80::1%eth0` is allowed. | Devices with a stable IPv6 address. |
| **SSH port** | Tries a TCP connection to port 22, or the **TCP port** you enter. Works with an IP address or a host name. | Linux, macOS and NAS devices with an SSH server. It doesn't log in. |
| **Linux agent on the device** | Nothing: the device is online while its Linux agent is connected. | Machines that run the [Linux agent](/docs/agents/linux). |

With **TCP port** set, the MAC, IPv4 and IPv6 checks also count the device as online when that port
answers. That helps with devices that don't answer pings, such as Windows PCs with the default
firewall: use `445` (file sharing) or `3389` (remote desktop). A refused connection also counts as
online: the device answered.

The address must be reachable from the agent's network, because the agent checks it, not the
server. Checks run every 20 seconds; **Check now** on the device page checks right away. Hover the
status badge to see when the device was checked and, for *Unknown*, why: for example *Agent is
offline*, *No agent assigned* or *Status checks are turned off*.

## Powering on

Click the power button on the **Overview**, in the **Devices** list or on the device page. NetIgnite
shows *Wake-on-LAN packet sent* or *Couldn't power on* with the reason:

| Message | Meaning |
| --- | --- |
| *Wake-on-LAN packet sent* | The agent sent the magic packet. The device should start within a few seconds. |
| *No agent is assigned to this device* | Choose an agent in the device's settings. |
| *Agent is offline* | The device's agent isn't connected. Check the agent first. |
| *The agent didn't answer in time* | The agent didn't answer within 5 seconds. Try again. |
| *The agent doesn't support this action* | The agent can't send Wake-on-LAN packets, for example a Linux agent without Wake-on-LAN mode. |
| *The agent reported an error: …* | The agent couldn't send the packet, for example because it has no network. |

The button is disabled (*No online agent with Wake-on-LAN*) while no suitable agent is online.
*Wake-on-LAN packet sent* means the packet left the agent. It doesn't confirm that the device
turned on; watch its status turn **Online**, or see
[Troubleshooting](/docs/reference/troubleshooting#the-device-doesnt-wake-up).

## Shutting down and rebooting

When a device can be shut down, the power button gets a menu with **Shut down** and **Reboot**.
NetIgnite asks for confirmation, then shows *Shutdown requested* or *Reboot requested*. This needs:

- the **Linux agent on the device**, online (the preferred way for Linux machines: no login to the
  device is stored anywhere), or
- an **SSH login** with a trusted host key, and the device's agent online and able to log in over
  SSH. Use a dedicated user that may only shut down and reboot. See [SSH](/docs/guides/ssh).

If both are set up, NetIgnite uses the Linux agent while it's online, and SSH otherwise.

## Favorites

Click the star in the **Devices** list, or **Add to favorites** on the device page. Favorites appear
on the **Overview**. They're personal: every user has their own.

## Editing and deleting

Change the settings on the device's **General** tab and click **Save**. The owner and managers can
edit a device; only the owner can change its agents and delete it. **Delete device** under
**Danger Zone** removes the device and all its shares.

Someone shared a device with you? **Leave device** on its page removes it from your account. See
[Sharing](/docs/guides/sharing).
