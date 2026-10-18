---
title: "Managing Agents"
description: "Create NetIgnite agents, find their Connection ID and Secret, and understand agent status."
navigation:
  title: Managing Agents
---

# Managing Agents

An agent is the part of NetIgnite that lives inside your network. It keeps a WebSocket connection
to the server and sends Wake-on-LAN packets for the devices assigned to it. You need one agent per
network (broadcast domain) that contains devices you want to wake.

## Agent types

| Type | Use it for |
| --- | --- |
| **Microcontroller** | The [ESP32 agent](/docs/agents/esp32) or other embedded agents. |
| **Server** | An agent running on an always-on computer, such as a [custom agent](/docs/agents/protocol). |

The type is informational. It doesn't change how the server talks to the agent.

## Creating an agent

1. Open **Agents** and click **Add New Agent**.
2. Enter a **Name**, choose the **Agent Type** and optionally add a **Description**.
3. Click **Create Agent**. The server generates a random secret, and the agent's page opens.

The agent's page shows its **Connection Details**:

| Field | Agent setting |
| --- | --- |
| **Connection ID** | The agent's numeric ID, for example `3`. ESP32: `C_CONTROL_SERVER_AUTH_ID`. |
| **Connection Secret** | The shared secret (click the eye icon to reveal it). ESP32: `C_CONTROL_SERVER_AUTH_SECRET`. |

To change the name, type or secret later, edit the fields and click **Update Agent**. Configure
your agent with the two connection values and the server address. As soon as it connects, its
status turns **online**.

## Agent status

| Status | Meaning |
| --- | --- |
| `online` | The agent is connected to the server. |
| `offline` | The agent is known but not connected. |
| `unknown` | The server has no state for this agent. |

The **Agents** page refreshes the status every 20 seconds. The **Ping** button refreshes it right
away. An agent that loses its connection reconnects on its own (the ESP32 agent retries every 60
seconds).

## Changing the secret

You can edit the **Connection Secret** on the agent's page. Saving a new secret immediately
disconnects the agent. It can only reconnect once it's configured with the new secret. For the
ESP32 agent, that means rebuilding and reflashing the firmware.

Keep these rules in mind when you choose a secret yourself:

- Use a long random value. The generated secrets are 16 hex characters.
- Don't use a colon (`:`). The ID and secret are joined with a colon for authentication, so a
  secret containing one never matches.

## Deleting an agent

Delete an agent with the trash icon on the **Agents** page. Reassign or delete the devices that
use it first: devices keep pointing at the deleted agent and can no longer be woken.
