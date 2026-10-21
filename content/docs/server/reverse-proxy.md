---
title: "HTTPS & Reverse Proxy"
description: "Serve the NetIgnite dashboard, API and WebSockets over HTTPS with Caddy, nginx or Apache."
navigation:
  title: HTTPS & Reverse Proxy
---

# HTTPS & Reverse Proxy

The NetIgnite server speaks plain HTTP on port `18232`. Put it behind a reverse proxy that
terminates TLS before you use it outside `localhost`:

- **Logins need HTTPS.** The dashboard stores its login token in a `Secure` cookie, which browsers
  only keep on HTTPS pages or on `localhost`. Over `http://<server-ip>:18232`, every login ends on
  the login page again.
- **The ESP32 web installer needs HTTPS.** Browsers only allow USB (Web Serial) access on HTTPS
  pages or on `localhost`.
- **Credentials.** Agents send their credential in an `Authorization` header; the dashboard sends
  its login token and passwords. Without TLS, anyone on the path can read them.

Set `NETIGNITE_APP_URL` to the public HTTPS address, for example
`https://netignite.example.com` (see [Configuration](/docs/server/configuration#the-public-url)).
Serve NetIgnite at the root of its own host name; sub-paths aren't supported.

## What the proxy must do

The dashboard, the API and both WebSockets share one port, so a single proxy rule covers all of
them. The proxy must:

1. forward WebSocket upgrades: `/ws/agent` (agents) and `/ws/console` (the live log of an ESP32
   agent in the dashboard),
2. pass the `Authorization`, `Host` and `Origin` headers through (the examples below do),
3. keep idle WebSockets open for at least 60 seconds. The server pings every agent every 30
   seconds. The console can be quiet for longer; the dashboard reconnects it after 5 seconds if the
   proxy closes it.

The examples assume NetIgnite runs on the same host at `127.0.0.1:18232`, published as
`netignite.example.com`.

## Caddy

Caddy obtains certificates automatically and proxies WebSockets without extra configuration.

```text [Caddyfile]
netignite.example.com {
	reverse_proxy 127.0.0.1:18232
}
```

## nginx

```nginx [netignite.conf]
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    http2 on;
    server_name netignite.example.com;

    ssl_certificate     /etc/letsencrypt/live/netignite.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/netignite.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:18232;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # WebSockets: agents get a ping every 30 s, the console can be quiet for longer.
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

## Apache

Requires Apache 2.4.47 or newer with `mod_proxy`, `mod_proxy_http` and `mod_ssl` enabled.

```apache [netignite.conf]
<VirtualHost *:443>
    ServerName netignite.example.com

    SSLEngine on
    SSLCertificateFile    /etc/letsencrypt/live/netignite.example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/netignite.example.com/privkey.pem

    ProxyPreserveHost On
    ProxyTimeout 600
    ProxyPass        / http://127.0.0.1:18232/ upgrade=websocket
    ProxyPassReverse / http://127.0.0.1:18232/
</VirtualHost>
```

## Agents behind a proxy

Agents use the server address from their setup: the ESP32 web installer and the Linux agent's
setup command fill in `NETIGNITE_APP_URL`. Agents connect to `wss://` for `https://` addresses and
to `ws://` for `http://` addresses.

- The **ESP32 agent** checks the server's certificate against Mozilla's list of public root CAs
  (Let's Encrypt included). A certificate from a private CA only works with a firmware you
  [build yourself](/docs/agents/esp32#build-from-source) with that CA added.
- The **Linux agent** checks the certificate against the public root CAs built into its runtime
  ([Bun](https://bun.sh)). Use a certificate from a public CA such as Let's Encrypt.

An agent in the same LAN as the server can also use a plain `http://` address such as
`http://192.168.1.10:18232`: set it with **Change server address** in the web installer, or pair
the Linux agent with it. Its credential then crosses the network unencrypted, so only do this in a
network you trust.

## Rate limits behind a proxy

The server counts failed logins, sign-ups and agent enrollments per client IP address. It uses the
address of the TCP connection and doesn't read `X-Forwarded-For`, so behind a proxy all clients
share the proxy's address for these limits.

## Checking the setup

1. Open `https://netignite.example.com` and log in.
2. Open `https://netignite.example.com/api/health`; it answers
   `{"success": true, "code": 200, "message": "NetIgnite API is running", …}`.
3. Start an agent and watch the server log for `Agent <id> online (…)`.
4. Open an ESP32 agent's **Console** tab: the badge shows **Live** when `/ws/console` works.
