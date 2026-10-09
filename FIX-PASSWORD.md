# 🔐 **DATABASE_URL Fix**

## ❌ **The Problem**
Your password contains special characters: `[#Govindu1231]`

The `#` symbol breaks PostgreSQL connection strings (it's a URL fragment marker).

---

## ✅ **Fix: URL-Encode the Password**

**Original:** `[#Govindu1231]`

**Encoded:** `%5B%23Govindu1231%5D`

| Character | Encoded |
|-----------|---------|
| `[` | `%5B` |
| `#` | `%23` |
| `]` | `%5D` |

---

## 🔧 **Step-by-Step**

### **1. Update DATABASE_URL in Vercel**

Go to: [Vercel Dashboard](https://vercel.com/dashboard) → Select **indicbench** → **Settings** → **Environment Variables**

Update `DATABASE_URL` to:

```
postgresql://postgres:%5B%23Govindu1231%5D@db.yekrfuvxxdilakdogfnl.supabase.co:5432/postgres
```

**Note:** Also add `?sslmode=require` at the end if not present:
```
postgresql://postgres:%5B%23Govindu1231%5D@db.yekrfuvxxdilakdogfnl.supabase.co:5432/postgres?sslmode=require
```

---

### **2. Redeploy in Vercel**

1. Go to **Deployments** tab
2. Click the **three dots (⋮)** on latest deployment
3. Select **Redeploy**

---

### **3. Test After 3-5 Minutes**

```bash
curl -s https://indicbench.vercel.app/api/db-check
```

**Expected Success:**
```json
{
  "status": "connected",
  "database": {
    "provider": "postgresql",
    "connection": "success"
  }
}
```

---

## ⚠️ **⚠️ SECURITY WARNING - PASSWORD EXPOSED ⚠️**

**Your password `[#Govindu1231]` has been exposed in this conversation and should be changed immediately.**

### **Change Supabase Database Password:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** → **Database**
4. Click **Edit** (pencil) next to Password
5. Generate a **new simple password** (letters + numbers only)
6. Update `DATABASE_URL` in Vercel with the new password

---

## ✅ **Quick Checklist**

- [ ] URL-encoded DATABASE_URL in Vercel
- [ ] Redeployed on Vercel
- [ ] Tested with `curl -s https://indicbench.vercel.app/api/db-check`
- [ ] Changed Supabase password (after testing succeeds)

Let me know once you've tested it! 🚀
