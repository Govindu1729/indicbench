# Railway Setup Guide

## Prerequisites
- Node.js 20+ (already on Railway)
- PostgreSQL database (Neon/Supabase)

## Setup Steps

1. **Create Project on Railway**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your repository

2. **Add Environment Variables**
   - DATABASE_URL: postgres://user:pass@host:5432/db
   - BENCHLM_API_KEY: your-key

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Important Notes
- Railway mounts volumes at `/data`
- Update DATABASE_URL to use PostgreSQL (not SQLite)
- Build command: `npm run build`
- Start command: `npm start`
