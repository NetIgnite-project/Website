---
title: "Users & Accounts"
description: "The first admin, user management, public sign-up, roles, logins, password resets and API keys on a NetIgnite server."
navigation:
  title: Users & Accounts
---

# Users & Accounts

## The initial admin

When the server starts with an empty database, it creates one account:

| Field | Value |
| --- | --- |
| Username | `admin` |
| Display name | Default Administrator |
| Email | `admin@netignite.dev` (a placeholder; change it) |
| Role | `admin` |
| Password | Random and unknown. Set it with the link below. |

The server writes a password link to `config/initial_admin_password_reset_token.txt` (in Docker:
`/opt/netignite/config/…`, readable only by root) and prints it to the log:

```text [initial_admin_password_reset_token.txt]
https://netignite.example.com/auth/reset-password?token=3f9c…
```

1. Open the link within **7 days** and choose a password.
2. Log in with the username `admin` and that password.
3. The welcome page opens. Click **Complete your profile** (or go to **Settings → General**) and
   enter your real email address and name. Saving changes there asks for your current password.
4. Delete `initial_admin_password_reset_token.txt`. The link stops working once it's used, but the
   server doesn't remove the file.

The link uses `NETIGNITE_APP_URL`. If that was wrong at the first start, replace the address in the
link and keep the `?token=…` part.

::note
If the link expired before you used it and the server has no data yet, stop the server, delete
`data/netignite.sqlite` and start it again: an empty database gets a new admin and a new link. With
data, see [I lost the admin password](/docs/reference/troubleshooting#i-lost-the-admin-password).
::

## Roles

There are two roles: `admin` and `user`.

- Agents and devices belong to the user who created them, for both roles. Admins don't see other
  users' agents or devices. Users see devices that were [shared](/docs/guides/sharing) with them.
- Admins additionally get the **Admin** section in the sidebar: **Users** and **Server Settings**.

## Managing users

Admins manage accounts under **Admin → Users**:

- **New User** creates an account with a username, display name, email address, password and role.
- **Edit** changes the display name, email address and role. A changed role applies to the user's
  existing logins and API keys right away.
- **Reset Password** sets a new password and logs the user out everywhere.
- **Delete** removes the account with all its data: its agents, devices, shares, API keys and
  logins.

Usernames have 5 to 40 characters: lowercase letters, digits, `.`, `_` and `-`, starting with a
letter or digit. Usernames and email addresses must be unique.

## Public sign-up

By default only admins create accounts. To let people register themselves, turn on
**Admin → Server Settings → Registration → Public sign-up**. The login page then shows a **Sign up**
link to `/auth/signup`, where anyone who can open the server creates an account with the role
`user`. The server accepts at most 5 sign-ups per client address and hour.

## Logging in

- A login is valid for **7 days**. The dashboard keeps it in the cookie
  `netignite_session_token`, which requires [HTTPS](/docs/server/reverse-proxy) (or `localhost`).
  With **Remember me**, the browser keeps it after it's closed.
- Logins are stored in the database, so restarting or updating the server doesn't log anyone out.
- **Log out** in the user menu ends the login on the server.
- After 5 failed attempts for a username from one address (or 15 from all addresses), further
  logins for it are refused until 5 minutes after the first attempt.

## Changing your account

Under **Settings** in the sidebar:

- **General**: username, display name and email address. Saving asks for your current password.
- **Security**: change your password (this logs you out everywhere) or delete your account. Deleting
  your account deletes your agents and devices too.
- **API Keys**: see [below](#api-keys).

Passwords need 8 to 50 characters with an uppercase letter, a lowercase letter, a digit and a
special character, everywhere: sign-up, **Create User**, **Change Password**, an admin's **Reset
Password** and reset links.

## Forgotten passwords

**Forgot password?** on the login page sends a reset link to the account's email address. The link
is valid for 1 hour; one link per address is sent every 15 minutes. This needs
[email](/docs/server/configuration#email) to be configured. Without email, an admin resets the
password under **Admin → Users**.

## API keys

API keys let scripts and integrations use the [REST API](/docs/reference/api) as you. Create one
under **Settings → API Keys → New API Key** with a description and an expiration (7, 30, 90, 180 or
365 days, or none). The key (`netignite_apikey_…`) is shown **once**; copy it right away. Send it as
`Authorization: Bearer <key>`.

An API key can do what you can do with agents, devices and firmware, and admin tasks if you're an
admin. Your own account (profile, password, API keys) can only be changed with a login, not with an
API key. Delete a key under **Settings → API Keys**; it stops working immediately. Keys of a user
whose role changes get the new role.

## Imported v1 users

Users imported from NetIgnite v1 keep their username and password. They get a placeholder email
address (`<username>@imported.netignite.invalid`) and should enter their real one under
**Settings → General** after their first login. See [Upgrading from v1](/docs/server/upgrading).
