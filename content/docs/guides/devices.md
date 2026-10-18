---
title: "Devices & Wake-on-LAN"
description: "Add devices to NetIgnite, prepare them for Wake-on-LAN, power them on and check their status."
navigation:
  title: Devices & Wake-on-LAN
---

# Devices & Wake-on-LAN

A device is a machine you want to power on remotely. NetIgnite wakes it with a
[Wake-on-LAN](https://en.wikipedia.org/wiki/Wake-on-LAN) magic packet that an agent in the same
network broadcasts.

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
3. **Wired connection.** Use Ethernet. Most computers can't be woken over WiFi.
4. **Note the MAC address** of the wired network card, for example with `ip link` (Linux),
   `getmac /v` (Windows) or in your router's client list.

## Adding a device

Open **Devices → Add New Device** and fill in:

| Field | Description |
| --- | --- |
| **Name** | A name to recognize the device by. |
| **Device Type** | Server, Desktop PC, Laptop, Printer or NAS Storage. Only used for display. |
| **Description** | Optional notes. |
| **MAC Address** | The MAC address of the device's network card, as `AA:BB:CC:DD:EE:FF` or `AA-BB-CC-DD-EE-FF`. |
| **Port** | The UDP port of the magic packet. Use `9` (the default) unless your device expects `7`. |
| **Agent** | The agent in the same network as the device. |

::warning
The server doesn't check the MAC address format. The ESP32 agent only accepts six pairs of hex
digits separated by `:` or `-`, so `AABBCCDDEEFF` or `AABB.CCDD.EEFF` fails when you wake the
device.
::

## Powering on

Click **Power On** on the dashboard or in the device list. NetIgnite reports:

| Message | Meaning |
| --- | --- |
| *Wakeup command sent* | The agent sent the magic packet. The device should start within a few seconds. |
| *Agent is offline* | The device's agent isn't connected. Check the agent first. |
| *Failed to send wakeup command* | The agent didn't answer within 5 seconds. |
| *Wakeup command failed: …* | The agent rejected the request, for example because of an invalid MAC address or port. |

*Wakeup command sent* means the packet left the agent. It doesn't confirm that the device turned
on. Watch the device's status turn **online**, or check
[Troubleshooting](/docs/reference/troubleshooting#the-device-doesnt-wake-up).

## Device status

NetIgnite asks the device's agent to ping the device. The ESP32 agent pings the device's IPv6
link-local address, which it derives from the MAC address. See
[How It Works](/docs/how-it-works#checking-device-status) for what the statuses mean and when this
check reports a running device as `offline`.

Statuses refresh every 20 seconds. The **Ping** button checks a device right away.

## Editing and deleting

Click **Edit** to change any field, including the agent. Delete a device with the trash icon in
the device list; you'll be asked to confirm.
