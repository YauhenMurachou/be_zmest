# Quick Deployment Guide

## 🚀 Fastest Way: Railway (5 minutes)

1. **Go to [railway.app](https://railway.app)** and sign up with GitHub

2. **Create New Project** → "Deploy from GitHub repo" → Select your repo

3. **Add PostgreSQL:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway auto-creates `DATABASE_URL`

4. **Add Environment Variables:**
   - Go to your service → "Variables"
   - Add:
     ```
     JWT_SECRET=<generate-with-command-below>
     JWT_EXPIRES_IN=604800
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend.com
     ```

5. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Deploy:** Railway auto-deploys on push to main branch

7. **Run Migrations:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   railway run npm run migrate
   ```

**Your API URL:** `https://your-project.up.railway.app`

---

## 🎨 Alternative: Render (Free Tier)

1. **Go to [render.com](https://render.com)** and sign up

2. **New Web Service:**
   - Connect GitHub repo
   - Build: `npm install && npm run build`
   - Start: `npm run migrate && npm start`
   - Plan: Free

3. **Add PostgreSQL:**
   - New → PostgreSQL → Free plan
   - Copy Internal Database URL

4. **Environment Variables:**
   ```
   DATABASE_URL=<internal-database-url>
   JWT_SECRET=<your-secret>
   JWT_EXPIRES_IN=604800
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.com
   PORT=10000
   ```

**Your API URL:** `https://your-app.onrender.com`

---

## 🔗 Connect Frontend

### 1. Set Frontend URL in Backend

In your backend environment variables:
```
FRONTEND_URL=https://your-frontend-domain.com
```

For local development:
```
FRONTEND_URL=http://localhost:3000
```

### 2. Update Frontend Code

```typescript
// .env in your frontend project
REACT_APP_API_URL=https://your-backend-url.up.railway.app
// or
VITE_API_URL=https://your-backend-url.up.railway.app
// or  
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app

// API client example
const API_URL = process.env.REACT_APP_API_URL;

fetch(`${API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

### 3. Test Connection

```bash
# Health check
curl https://your-backend-url.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## ✅ Post-Deployment Checklist

- [ ] API health check works
- [ ] Can register user
- [ ] Can login and get token
- [ ] Can create post (with token)
- [ ] Frontend can connect (no CORS errors)
- [ ] Database migrations completed

---

## 🆘 Troubleshooting

**CORS Error?**
- Set `FRONTEND_URL` environment variable
- Restart backend service

**Database Error?**
- Check `DATABASE_URL` is set
- Run migrations: `railway run npm run migrate`

**Can't Connect?**
- Check service is running (not sleeping)
- Verify URL is correct
- Check environment variables

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

