---
title: "Users & Accounts"
description: "The initial admin account, login sessions, roles and password changes on a self-hosted NetIgnite server."
navigation:
  title: Users & Accounts
---

# Users & Accounts

## The initial admin

When the server starts with an empty database, it creates one account:

| Field | Value |
| --- | --- |
| Username | `admin` |
| Password | 64 random hex characters, written to `data/initial_admin_credentials` and printed to the log |
| Role | `admin` |

```text [initial_admin_credentials]
Username: admin
Password: 3f9c…
```

Log in, open **Settings** from the user menu, set a new password and delete the credentials file.

## Changing username and password

Every user can change their own username and password under **Settings** (`/account/settings`).
Leave the password field empty to keep the current password. Usernames must be unique.

Changing the password does not end other active sessions.

## Sessions

- Logging in sets a `session` cookie that is valid for 30 days. The cookie is `HttpOnly` (scripts
  on the page can't read it), `SameSite=Strict` and, in production builds, `Secure`. Serve the
  dashboard over [HTTPS](/docs/server/reverse-proxy).
- Sessions are kept in server memory. Restarting or updating the server logs everyone out.
- **Log out** in the user menu ends the session immediately.

## Roles

There are two roles: `admin` and `user`.

- Agents and devices are private to the user who created them, for both roles. Admins don't see
  other users' agents or devices.
- Through the [API](/docs/reference/api#update-an-account), admins can edit other users' usernames
  and passwords. The first user (the initial `admin`, ID `1`) can also change other users' roles.

## Adding users

::note
The current release has no user management in the dashboard, no self-registration and no
password reset. A self-hosted server starts with the single `admin` account, which is enough to
manage all of your own agents and devices.
::
