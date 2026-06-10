# BDE Farm Trac — UK VPS Deployment Guide

**Domain:** bdefarmtrac.co.uk  
**Purpose:** Host the full stack on UK infrastructure so the LIS (Livestock Information Service) API is reachable.

---

## Architecture

```
bdefarmtrac.co.uk  (nginx — TLS termination, static files, reverse proxy)
  ├── /             → website (static files)
  ├── /dashboard/   → dashboard (static files)
  ├── /admin-portal/ → admin portal (static files)
  ├── /api/         → Node.js API server (port 8080, pm2 managed)
  └── /mobile/      → mobile app (Expo export, static files)
```

Everything on one domain. No CORS issues. The LIS API resolves from UK infrastructure.

---

## Step 1 — Provision a VPS

**Recommended: Hetzner Cloud** (cheapest reliable UK option)

1. Go to [console.hetzner.cloud](https://console.hetzner.cloud)
2. Create a new project: **BDE Farm Trac**
3. Add a server:
   - **Location:** London (eu-central or uk)
   - **Image:** Ubuntu 24.04
   - **Type:** CX22 (2 vCPU, 4 GB RAM) — ~£4.50/mo
   - **SSH key:** add your public key (`~/.ssh/id_rsa.pub` or create a new one)
4. Note the server's public IPv4 address (e.g. `5.161.xxx.xxx`)

---

## Step 2 — Point your domain at the VPS

In your domain registrar (wherever bdefarmtrac.co.uk is registered), add/update:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A    | @    | `<VPS_IP>` | 300 |
| A    | www  | `<VPS_IP>` | 300 |

Wait for DNS to propagate (usually 5–30 minutes). Check with:
```bash
dig bdefarmtrac.co.uk +short
```

---

## Step 3 — Initial server setup

SSH in as root, then run these commands:

```bash
ssh root@<VPS_IP>

# Update system
apt update && apt upgrade -y

# Install Node.js 22 (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm pm2

# Install nginx and certbot
apt install -y nginx certbot python3-certbot-nginx

# Install git
apt install -y git

# Create app user (never run the app as root)
useradd -m -s /bin/bash farmtrac
mkdir -p /home/farmtrac/.ssh
cp /root/.ssh/authorized_keys /home/farmtrac/.ssh/
chown -R farmtrac:farmtrac /home/farmtrac/.ssh
chmod 700 /home/farmtrac/.ssh
chmod 600 /home/farmtrac/.ssh/authorized_keys
```

---

## Step 4 — Clone and build the project

```bash
su - farmtrac

# Clone your repo (replace with your actual repo URL)
git clone https://github.com/YOUR_ORG/bde-farm-trac.git /home/farmtrac/app
cd /home/farmtrac/app

# Install dependencies
pnpm install --frozen-lockfile

# Build all artifacts
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/dashboard run build
pnpm --filter @workspace/admin-portal run build
pnpm --filter @workspace/website run build
```

> **Note on mobile:** The Expo mobile app connects to `bdefarmtrac.co.uk` via
> `EXPO_PUBLIC_DOMAIN`. No server-side build needed — it's configured in the app bundle.
> For production mobile builds, use EAS Build (see Step 8).

---

## Step 5 — Set environment variables

Create `/home/farmtrac/app/.env.production`:

```bash
nano /home/farmtrac/app/.env.production
```

Paste and fill in all values:

```bash
NODE_ENV=production
PORT=8080

# Database — copy from Replit Secrets panel
DATABASE_URL=postgresql://...

# Clerk — get from clerk.com dashboard (your existing Replit Clerk tenant)
CLERK_SECRET_KEY=sk_live_...

# Encryption key — copy from Replit Secrets panel (CREDENTIAL_ENCRYPTION_KEY)
CREDENTIAL_ENCRYPTION_KEY=...

# LIS — copy from Replit Secrets panel
LIS_SUBSCRIPTION_KEY=...
LIS_B2C_CLIENT_ID=...
# Set to true for sandbox testing, remove/set false for production
LIS_USE_SANDBOX_API=true

# Twilio (SMS alerts)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=...

# Email (SMTP)
SMTP_PASS=...
SMTP_FROM=hello@bdefarmtrac.co.uk

# Admin portal
ADMIN_PORTAL_SECRET=...

# Object storage — copy from Replit Secrets panel
DEFAULT_OBJECT_STORAGE_BUCKET_ID=...
CREDENTIAL_ENCRYPTION_KEY=...
PRIVATE_OBJECT_DIR=...
PUBLIC_OBJECT_SEARCH_PATHS=...

# CORS — allow your production domain explicitly (belt-and-suspenders)
ALLOWED_ORIGINS=https://bdefarmtrac.co.uk,https://www.bdefarmtrac.co.uk

# Clerk proxy (the dashboard proxies Clerk through /api/clerk)
# No change needed — already configured for *.replit.app and custom domains
```

Secure the file:
```bash
chmod 600 /home/farmtrac/app/.env.production
```

---

## Step 6 — Configure Clerk for your production domain

In your **Clerk dashboard** ([dashboard.clerk.com](https://dashboard.clerk.com)):

1. Go to your application → **Domains**
2. Add `bdefarmtrac.co.uk` as a production domain
3. Copy the **production publishable key** (`pk_live_...`)

Then set the Vite build-time env vars. Create `/home/farmtrac/app/artifacts/dashboard/.env.production`:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CLERK_PROXY_URL=https://bdefarmtrac.co.uk/api/clerk
```

And `/home/farmtrac/app/artifacts/admin-portal/.env.production`:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CLERK_PROXY_URL=https://bdefarmtrac.co.uk/api/clerk
```

Then **rebuild** after adding these:
```bash
cd /home/farmtrac/app
pnpm --filter @workspace/dashboard run build
pnpm --filter @workspace/admin-portal run build
```

---

## Step 7 — Start the API with pm2

pm2 keeps the Node process alive and restarts it on crash or reboot.

```bash
cd /home/farmtrac/app

# Start the API server, loading .env.production
pm2 start artifacts/api-server/dist/index.cjs \
  --name farmtrac-api \
  --env production \
  -- --env-file /home/farmtrac/app/.env.production

# Or using dotenv-style loading:
pm2 start artifacts/api-server/dist/index.cjs \
  --name farmtrac-api \
  --node-args="--env-file=/home/farmtrac/app/.env.production"

# Save pm2 config so it restarts on server reboot
pm2 save
pm2 startup   # follow the printed command as root
```

Check it's running:
```bash
pm2 status
pm2 logs farmtrac-api --lines 50
```

The API should log `[ENV] Environment audit passed.` and `[SERVER] Listening on port 8080`.

---

## Step 8 — Configure nginx

Back as root:

```bash
exit  # back to root
nano /etc/nginx/sites-available/bdefarmtrac
```

Paste this config:

```nginx
server {
    listen 80;
    server_name bdefarmtrac.co.uk www.bdefarmtrac.co.uk;
    # Certbot will upgrade this to HTTPS automatically
    return 301 https://bdefarmtrac.co.uk$request_uri;
}

server {
    listen 443 ssl;
    server_name www.bdefarmtrac.co.uk;
    ssl_certificate     /etc/letsencrypt/live/bdefarmtrac.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bdefarmtrac.co.uk/privkey.pem;
    return 301 https://bdefarmtrac.co.uk$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bdefarmtrac.co.uk;

    ssl_certificate     /etc/letsencrypt/live/bdefarmtrac.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bdefarmtrac.co.uk/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # ── API server ─────────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_read_timeout 120s;
        client_max_body_size 50M;
    }

    # ── Dashboard SPA ──────────────────────────────────────────────────
    location /dashboard/ {
        alias /home/farmtrac/app/artifacts/dashboard/dist/public/;
        try_files $uri $uri/ /dashboard/index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # ── Admin portal SPA ───────────────────────────────────────────────
    location /admin-portal/ {
        alias /home/farmtrac/app/artifacts/admin-portal/dist/public/;
        try_files $uri $uri/ /admin-portal/index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # ── Website ────────────────────────────────────────────────────────
    location / {
        root  /home/farmtrac/app/artifacts/website/dist/public;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # ── Uploaded/stored assets (if serving from local disk) ───────────
    # (Skip this if using object storage — files go to GCS directly)
    # location /uploads/ {
    #     alias /home/farmtrac/uploads/;
    # }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

Enable the site and get SSL:

```bash
# Enable site
ln -s /etc/nginx/sites-available/bdefarmtrac /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Start nginx
systemctl enable nginx
systemctl start nginx

# Get SSL certificate (Certbot)
certbot --nginx -d bdefarmtrac.co.uk -d www.bdefarmtrac.co.uk \
  --non-interactive --agree-tos -m admin@bdefarmtrac.co.uk

# Reload nginx with SSL
systemctl reload nginx
```

---

## Step 9 — Smoke test

```bash
# API health check
curl https://bdefarmtrac.co.uk/api/healthz

# LIS B2C token endpoint reachability from the server
curl -s -o /dev/null -w "%{http_code}" \
  --max-time 10 \
  "https://livestockinformationb2cprod.b2clogin.com/livestockinformationb2cprod.onmicrosoft.com/B2C_1_ROPC_Auth/oauth2/v2.0/token" \
  -X POST -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=91afad18-e537-48bb-840b-06f4fa943ac6&scope=test&username=test&password=test"
# Should return 400 (bad credentials) not 404 — confirms the endpoint is reachable
```

Then open `https://bdefarmtrac.co.uk/dashboard/` in a browser and test the LIS connection from Farm Settings.

---

## Step 10 — Deploying updates

Each time you push new code:

```bash
su - farmtrac
cd /home/farmtrac/app

git pull origin main

pnpm install --frozen-lockfile

# Rebuild only what changed — or rebuild everything to be safe:
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/dashboard run build
pnpm --filter @workspace/admin-portal run build
pnpm --filter @workspace/website run build

# Restart the API
pm2 restart farmtrac-api

# Nginx picks up static file changes automatically (no reload needed)
```

For a zero-downtime deploy of the API, pm2 handles graceful reloads:
```bash
pm2 reload farmtrac-api
```

---

## Mobile app — `EXPO_PUBLIC_DOMAIN`

The mobile app reads `EXPO_PUBLIC_DOMAIN` at **build time** to know where the API is.

For production EAS builds, set in `artifacts/mobile/eas.json` or as an EAS secret:
```
EXPO_PUBLIC_DOMAIN=bdefarmtrac.co.uk
```

For development (pointing at the VPS from your phone):
```
EXPO_PUBLIC_DOMAIN=bdefarmtrac.co.uk
```

---

## Database note

The Replit PostgreSQL database is **colocated with your Replit app** in North America. For a UK VPS deployment, you have two options:

1. **Keep using Replit DB** — the VPS API connects to it over the internet. Adds ~50–100ms latency per query. Fine for an early-stage product.
2. **Migrate to a UK PostgreSQL** — e.g. Supabase EU-West, Neon EU-West, or Hetzner managed Postgres. Run `pg_dump` / `pg_restore` to migrate. Only worth doing once you have paying customers.

For now, option 1 is fine.

---

## Cost summary (monthly)

| Item | Cost |
|------|------|
| Hetzner CX22 (London) | ~£4.50 |
| SSL certificate (Let's Encrypt) | Free |
| Domain (bdefarmtrac.co.uk, already registered) | Already paid |
| **Total** | **~£4.50/mo** |

---

## Checklist before going live

- [ ] DNS A record pointing at VPS IP
- [ ] SSL certificate issued by Certbot
- [ ] API health check returns 200
- [ ] LIS B2C endpoint returns 400 (not 404/ENOTFOUND) from the VPS
- [ ] Dashboard loads at `https://bdefarmtrac.co.uk/dashboard/`
- [ ] Farm Settings → LIS → Test Connection succeeds with test user credentials
- [ ] Clerk production domain added and publishable key updated in `.env.production`
- [ ] `LIS_USE_SANDBOX_API=true` while testing, remove before real farmers use it
