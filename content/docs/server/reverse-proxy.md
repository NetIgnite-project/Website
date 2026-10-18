---
title: "HTTPS & Reverse Proxy"
description: "Serve the NetIgnite dashboard and the agent WebSocket over HTTPS with Caddy, nginx or Apache."
navigation:
  title: HTTPS & Reverse Proxy
---

# HTTPS & Reverse Proxy

The NetIgnite server speaks plain HTTP. Put it behind a reverse proxy that terminates TLS before
you use it outside `localhost`:

- **Logins need HTTPS.** Production builds mark the `session` cookie as `Secure`. Browsers only
  store it over HTTPS or on `localhost`, so logging in over `http://<server-ip>:18232` fails.
- **Agent credentials.** Agents send their ID and secret in an HTTP Basic `Authorization` header.
  Without TLS, anyone on the path can read them.

The dashboard, the REST API and the agent WebSocket share one port, so a single proxy rule covers
all of them. The proxy must:

1. forward WebSocket upgrades for `/api/agent-control-service`,
2. pass the `Authorization` header through (all proxies below do this by default),
3. allow idle connections longer than 60 seconds. The server sends each agent a heartbeat once a
   minute, so a 60-second idle timeout can cut agent connections.

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

        # Agents may be idle for a minute between heartbeats.
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
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
    ProxyTimeout 300
    ProxyPass        / http://127.0.0.1:18232/ upgrade=websocket
    ProxyPassReverse / http://127.0.0.1:18232/
</VirtualHost>
```

## Agent settings behind a proxy

Point your agents at the public hostname on port `443` with TLS enabled. For the ESP32 agent:

```cpp [config.h]
#define C_CONTROL_SERVER_HOST "netignite.example.com"
#define C_CONTROL_SERVER_PORT (uint16_t) 443
#define C_CONTROL_SERVER_USE_SSL (bool) true
```

The ESP32 agent verifies the server certificate against a bundle of public root CAs (including
Let's Encrypt). Self-signed certificates or a private CA only work if you
[add your CA to the bundle](/docs/agents/esp32#certificate-bundle).

## Checking the setup

1. Open `https://netignite.example.com` and log in.
2. Start an agent and watch the server log for `Agent '<id>' connected`.
3. If the agent connects and drops again after about a minute, raise the proxy's idle timeout.
