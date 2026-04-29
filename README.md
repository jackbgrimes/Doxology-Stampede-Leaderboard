# Stampede 2026 — Live Leaderboard

Dark neon space-themed live leaderboard with admin score entry panel.

## URLs
- `/` — Public leaderboard (embed this in Webflow)
- `/admin` — Password-protected score entry

---

## Setup (one time)

### 1. Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `stampede-2026`)
3. Add a **Web App** → copy the config values
4. In the left sidebar → **Build** → **Realtime Database** → Create database → Start in **test mode**

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase values:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_PASSWORD=yourpassword
```

### 3. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

When prompted, add all `VITE_*` environment variables from your `.env.local`.

Or: push to GitHub and connect the repo in [vercel.com](https://vercel.com) — it auto-deploys on every push.

### 4. Embed in Webflow

In Webflow, add an **Embed** element and paste:

```html
<iframe
  src="https://YOUR-VERCEL-URL.vercel.app"
  style="width:100%;height:100vh;border:none;background:#050508;"
  allow="autoplay"
></iframe>
```

---

## Using the Admin Panel

1. Go to `https://your-app.vercel.app/admin`
2. Enter your password (default: `stampede2026` — change in env vars)
3. Select a Day from the sidebar
4. Adjust scores using the +/− buttons or type directly
5. Click **Save Scores** — the public board updates instantly

---

## Scoring Categories
- Outdoor Games
- Lobby Games
- Stage Games
- First Time Guests
- Spirit
- Donations

## Teams
- 🔴 Red
- 🔵 Blue
- 🟢 Green
- 🟡 Yellow
