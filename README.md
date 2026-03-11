# Sovereign FIRE Command Center

Personal FIRE & debt payoff dashboard. PWA — installable on iPhone from Safari.

## Deploy to Vercel (5 min)

### Option A: GitHub → Vercel (recommended, auto-deploys on changes)

1. Create a free account at github.com and vercel.com
2. Create a new GitHub repo, upload this folder's contents
3. Go to vercel.com → "Add New Project" → import your repo
4. Vercel auto-detects Vite — just click Deploy
5. You get a URL like `sovereign-fire.vercel.app`

### Option B: Vercel CLI (fastest)

```bash
npm install -g vercel
cd sovereign-app
npm install
vercel
```

Follow the prompts. Done in ~2 minutes.

## Install on iPhone as PWA

1. Open your deployed URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

It now lives on your home screen like a native app — opens full screen, no browser chrome.

## Local development

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Data persistence

All inputs save automatically to your device's localStorage.
Clearing browser data will reset to defaults — but your Vercel app URL is permanent.

## Updating defaults

Edit `src/constants.js` → `DEFAULT_DEBTS` and `DEFAULT_FIRE` to change starting values.
After editing, push to GitHub and Vercel auto-deploys.
