# Perfect Platter — Fruit Platter Orders

Professional ordering site for **Perfect Platter** — small (₪150), medium (₪250), and party (₪400) platters with admin panel.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000 · Admin: http://localhost:3000/admin

Create `.env` from `.env.example` and set `ADMIN_PASSWORD`.

## Deploy to Netlify

1. Push this folder to **GitHub** (Git required for Netlify).
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**.
3. Select the repo. Build settings are read from `netlify.toml` automatically.
4. Under **Site configuration → Environment variables**, add:
   - `ADMIN_PASSWORD` = your secret admin password
   - `NEXT_PUBLIC_BUSINESS_NAME` = `Perfect Platter` (optional)
   - `RESEND_API_KEY` = your Resend API key (see **Email** below)
   - `FROM_EMAIL` = `Perfect Platter <orders@yourdomain.com>` (see **Email** below)
5. Deploy. Your site will be live at `https://your-site.netlify.app`.

## Email (order confirmations)

Confirmation emails are sent through [Resend](https://resend.com). Two env vars control it:

- **`RESEND_API_KEY`** — create at [resend.com/api-keys](https://resend.com/api-keys). If this is missing or invalid, no email is sent (the order still saves).
- **`FROM_EMAIL`** — the sender address, e.g. `Perfect Platter <orders@yourdomain.com>`.

To send to real customers you must **verify a sending domain**:

1. Go to [resend.com/domains](https://resend.com/domains) → **Add Domain** → enter your domain.
2. Add the **DKIM / SPF (TXT)** and **MX** records Resend shows you to your domain's DNS.
3. Wait for the status to turn **Verified** (usually minutes, sometimes up to a few hours).
4. Set `FROM_EMAIL` to an address on that domain and redeploy.

> Without a verified domain, the fallback sender `onboarding@resend.dev` only delivers to the email address that owns your Resend account — fine for testing, not for customers.

**Data on Netlify:** Orders, settings, and platter photos are stored in **Netlify Blobs** (no extra database setup).

**After deploy:** Log in at `https://your-site.netlify.app/admin`, upload platter photos, and confirm delivery days.

## Prices (default)

| Platter | Price |
|---------|-------|
| Small   | ₪150  |
| Medium  | ₪250  |
| Party   | ₪400  |

Change prices anytime in the admin panel.

## Customer flow

1. Choose platter size  
2. Tap fruits to remove (optional)  
3. Delivery day + **street address**, entrance, floor, note, phone  
4. Pay with cash or Bit  

## Admin

- View and update orders  
- Upload platter images  
- Toggle Wed / Thu / Fri delivery  
- Edit prices  

Default admin password (local only, if no `.env`): `fruit2026` — **change before going live.**
