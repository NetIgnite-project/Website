---
title: "Sharing"
description: "Share NetIgnite devices with other users as viewer, operator or manager, and what each role can do."
navigation:
  title: Sharing
---

# Sharing

You can share a device with other users on the same NetIgnite server: let your family power on the
media PC, or let a colleague reboot a server. You stay the owner, and commands still go through
your agent.

## Roles

Each share has a role:

| | Owner | Manager | Operator | Viewer |
| --- | --- | --- | --- | --- |
| See the device and its status, **Check now** | ✓ | ✓ | ✓ | ✓ |
| Add it to their favorites | ✓ | ✓ | ✓ | ✓ |
| **Power on**, **Shut down**, **Reboot** | ✓ | ✓ | ✓ | |
| Edit name, type, description, MAC address, port and status check | ✓ | ✓ | | |
| Choose the agent and the Linux agent on the device | ✓ | | | |
| Set up the SSH login | ✓ | | | |
| Share the device, change and remove shares | ✓ | | | |
| Delete the device | ✓ | | | |

Agents are never shared. Users you share a device with see the name and status of its agents, but
can't open them, use them for their own devices or see their credentials. They never see the
device's SSH login either.

## Sharing a device

1. Open the device and its **Sharing** tab. Only the owner has it.
2. Enter the other user's **username or email address** and choose a role.
3. Click **Share**.

The user must already have an account on the server; NetIgnite doesn't send invitations. The device
then appears in their **Devices** list with their role and *by* your name, and on their
**Overview** as *shared by* you.

Under **People with access**, change someone's role with the role menu, or remove their access with
the **×** button. Removing a share also removes the device from their favorites.

## Leaving a shared device

On a device someone shared with you, the **General** tab shows your role and a **Leave device**
section. **Leave** removes the device from your account until the owner shares it again.

## When the owner deletes things

- Deleting the device removes all its shares.
- Deleting or changing the device's agent affects everyone: if the agent is gone, nobody can wake
  the device until the owner chooses another one.
- Deleting the owner's account deletes their devices, and with them all shares.

## With the API

The owner manages shares with the [REST API](/docs/reference/api#sharing):
`GET /api/v1/devices/<id>/shares`, `POST` with `{ "user": "<username or email>", "role": "operator" }`,
`PUT /api/v1/devices/<id>/shares/<user-id>` with a new role, and `DELETE` to remove a share. A user
leaves a device with `DELETE /api/v1/devices/<id>/shares/<their user id>`.
