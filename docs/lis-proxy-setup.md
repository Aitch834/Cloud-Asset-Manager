# LIS UK Proxy — Setup Guide

The LIS (Livestock Information Service) API is only reachable from UK-based
infrastructure. This proxy runs on a cheap UK VPS and forwards LIS calls from
your Replit app through UK infrastructure.

```
Replit API server  →  UK proxy (£2–3/mo VPS)  →  LIS API
```

Everything else (dashboard, admin portal, mobile, database) stays on Replit.
No migration needed.

---

## What you need

- A cheap UK VPS (see options below) — **£2–3/mo**
- About 20 minutes

---

## Step 1 — Get a UK VPS

Any of these work. All offer GBP billing and London/UK datacenters:

| Provider | Plan | Cost | Link |
|----------|------|------|------|
| **DigitalOcean** | Basic Droplet (1 vCPU, 1 GB) | ~£4/mo | [cloud.digitalocean.com](https://cloud.digitalocean.com) → Create Droplet → **London** |
| **Vultr** | Cloud Compute (1 vCPU, 1 GB) | ~£3.50/mo | [my.vultr.com](https://my.vultr.com) → Deploy → London |
| **Fasthosts** | Cloud Server | ~£3/mo GBP | [fasthosts.co.uk](https://www.fasthosts.co.uk) (UK-native, GBP only) |
| **Hostinger** | KVM1 | ~£3/mo | [hostinger.co.uk](https://www.hostinger.co.uk/vps-hosting) → UK datacenter |

**DigitalOcean is recommended** — simple UI, GBP billing, London datacenter, £4/mo credit on signup.

When creating the server, pick **Ubuntu 24.04** and add your SSH public key.

---

## Step 2 — Deploy the proxy

SSH into the VPS:

```bash
ssh root@<VPS_IP>
```

Install Node.js and clone just the proxy:

```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs git

# Install pm2 globally
npm install -g pm2

# Clone your repo and go to the proxy folder
git clone https://github.com/YOUR_ORG/bde-farm-trac.git /opt/lis-proxy
cd /opt/lis-proxy/lis-proxy

# Install dependencies
npm install --omit=dev
```

---

## Step 3 — Configure environment variables

```bash
cp .env.example .env
nano .env
```

Fill in:

```bash
PORT=3001

# A long random string — you'll also add this to Replit Secrets as LIS_PROXY_SECRET
PROXY_SECRET=generate-a-long-random-string-here

# Copy from Replit Secrets panel
LIS_SUBSCRIPTION_KEY=your-subscription-key-here

# Copy from Replit Secrets panel
LIS_B2C_CLIENT_ID=your-client-id-here

# Primary client secret from LIS Developer Hub → My Apps → Client Secrets.
# Required for confidential app registrations — without it Azure AD returns AADSTS50105.
LIS_B2C_CLIENT_SECRET=your-primary-client-secret-here

# Set to true while testing with sandbox credentials
LIS_USE_SANDBOX_API=true
```

To generate a good random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Secure the file:
```bash
chmod 600 .env
```

---

## Step 4 — Start with pm2

```bash
cd /opt/lis-proxy/lis-proxy

# Start the proxy loading the .env file
pm2 start index.js --name lis-proxy --node-args="--env-file=/opt/lis-proxy/lis-proxy/.env"

# Or with dotenv (if --env-file not available on Node 18):
# PORT=3001 PROXY_SECRET=... pm2 start index.js --name lis-proxy

# Save and enable on reboot
pm2 save
pm2 startup   # follow the printed command
```

Check it's running:
```bash
pm2 status
curl http://localhost:3001/healthz
```

You should see:
```json
{
  "ok": true,
  "sandbox": true,
  "subscriptionKeyConfigured": true,
  "timestamp": "2026-06-10T..."
}
```

---

## Step 5 — Open the firewall port

By default most VPS providers block all ports except 22 (SSH). Open port 3001:

**DigitalOcean:** Networking → Firewalls → Create Firewall → Inbound rule: TCP port 3001, Source: your Replit outbound IPs (or `0.0.0.0/0` initially to test, then lock down).

**UFW (on the server):**
```bash
ufw allow 3001/tcp
ufw enable
```

---

## Step 6 — Add secrets to Replit

Go to your Replit project → **Secrets** panel and add:

| Secret name | Value |
|-------------|-------|
| `LIS_PROXY_URL` | `http://<VPS_IP>:3001` |
| `LIS_PROXY_SECRET` | The same random string you put in the proxy's `.env` |

> **Optional but recommended:** Set up a subdomain like `lis-proxy.bdefarmtrac.co.uk`
> pointing at the VPS IP, then use `https://lis-proxy.bdefarmtrac.co.uk` as the URL
> (requires adding nginx + Certbot to the VPS — see the VPS deployment guide).
> For testing, plain `http://IP:3001` is fine.

---

## Step 7 — Restart the Replit API server

In Replit, restart the **API Server** workflow. The API will pick up the new
`LIS_PROXY_URL` and `LIS_PROXY_SECRET` env vars automatically.

---

## Step 8 — Test it

Open `https://your-replit-app.replit.app/dashboard/` → Farm Settings → LIS tab
→ enter the test credentials → **Test Connection**.

With the proxy running, it should return **Connected** instead of the "UK infrastructure only" error.

**Test credentials (sandbox):**
- Username: `bdefarmtrac-testcphholder1@livestockinformationb2cprod.onmicrosoft.com`
- Password: `JTp9iBtbkuH3sHQE`

---

## How it works

```
Dashboard/App
    ↓  (HTTPS)
Replit API server  (artifacts/api-server)
    ↓  sets LIS_PROXY_URL → http://<UK VPS>:3001
    ↓  sends X-Proxy-Secret header
UK LIS Proxy  (lis-proxy/index.js)
    ↓  forwards to B2C / CLA API
LIS API  (api.sandbox.cla.livestockinformation.org.uk)
```

The proxy:
- Forwards `POST /lis/token` → Azure B2C ROPC token exchange
- Forwards `POST /lis/token/refresh` → B2C refresh token exchange  
- Forwards `POST /lis/cla/*` → CLA API (adds `Ocp-Apim-Subscription-Key` header server-side, so the key never leaves UK infrastructure)
- Rejects requests without the correct `X-Proxy-Secret` header

---

## Updating the proxy

When you push changes to the proxy code:

```bash
ssh root@<VPS_IP>
cd /opt/lis-proxy
git pull origin main
cd lis-proxy
npm install --omit=dev
pm2 restart lis-proxy
```

---

## Switching to production LIS

When you're ready to go live (real farmers, real movements):

1. On the VPS: edit `.env` and set `LIS_USE_SANDBOX_API=` (remove or leave blank) and restart: `pm2 restart lis-proxy`
2. In Replit Secrets: remove or set `LIS_USE_SANDBOX_API=` to blank
3. Check the proxy health: `curl http://<VPS_IP>:3001/healthz` — `"sandbox": false` confirms production mode

---

## Monthly cost summary

| Item | Cost |
|------|------|
| UK VPS (DigitalOcean Basic, London) | ~£4/mo |
| Everything else stays on Replit | £0 extra |
| **Total additional cost** | **~£4/mo** |
