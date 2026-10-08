# Railway-native Setup (No Docker)

## Setup Steps

1. **Add Environment Variables in Railway**
   - Go to Railway Dashboard → Your Service → Variables
   - Add: `DATABASE_URL` = `file:./db/custom.db`
   - Add: `BENCHLM_API_KEY` = `bld_free_OPI9S-a7dx-uww7_gv_Ggl7BmEDH5ypJOR_WLQhahME`

2. **Add Volume (for SQLite)**
   - Go to Railway → Settings → Volumes
   - Add Volume: Name=`db`, Mount Path=`/app/db`

3. **Redeploy**
   - Click Redeploy in Railway

## Why It Should Work

- Railway uses native Node.js (no Docker needed)
- Your `package.json` has proper `npm start` script
- `next.config.ts` has `output: "standalone"` for optimized builds

## Troubleshooting

If still blank:
1. Check browser console (F12) for frontend errors
2. Check Railway Logs tab for backend errors
3. Verify DATABASE_URL variable is set in Railway
