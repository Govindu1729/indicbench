# Railway Deployment Guide

## ✅ Railway-native Setup (No Docker)

### Step 1: Railway Configuration

1. Go to [Railway Dashboard](https://railway.app)
2. Create new project → "Deploy from GitHub"
3. Select your repository

### Step 2: Environment Variables

Go to **Variables** tab in Railway and add:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | `file:./db/custom.db` |

### Step 3: Volume (For SQLite)

1. Go to **Settings** → **Volumes**
2. Add volume:
   - **Name:** `db`
   - **Mount Path:** `/app/db`

### Step 4: Redeploy

Click **Redeploy** to start fresh build.

---

## 🚨 Key Notes

- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Port:** Railway auto-detects 3000
- **Database:** SQLite requires volume mount at `/app/db`

## ❌ If Still Failing

Check **Logs** tab for:
- `npm ERR!` → Dependency issue
- `Prisma Client not generated` → Run `prisma generate` locally
- `EADDRINUSE` → Port conflict (Railway handles this)
