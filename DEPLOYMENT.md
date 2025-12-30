# Deployment Guide

This guide covers deploying the backend API to free hosting platforms and connecting it with your frontend.

## Free Hosting Options

### Option 1: Railway (Recommended - Easiest) 🚂

**Pros:**
- Free tier with $5 credit/month
- Automatic deployments from GitHub
- Built-in PostgreSQL database
- Simple setup

**Steps:**

1. **Sign up at [railway.app](https://railway.app)** (use GitHub)

2. **Create a new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL database:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically create a `DATABASE_URL` environment variable

4. **Configure environment variables:**
   - Go to your service → "Variables"
   - Add these variables:
     ```
     JWT_SECRET=your-very-secure-random-string-min-32-chars
     JWT_EXPIRES_IN=604800
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-domain.com
     ```
   - **Important:** Generate a secure JWT_SECRET:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

5. **Deploy:**
   - Railway will automatically detect the project and deploy
   - Wait for deployment to complete
   - Your API will be available at: `https://your-project-name.up.railway.app`

6. **Run migrations:**
   - Go to your service → "Deployments" → Click on the latest deployment
   - Open "Deploy Logs"
   - Or use Railway CLI:
     ```bash
     npm install -g @railway/cli
     railway login
     railway link
     railway run npm run migrate
     ```

**Your API URL:** `https://your-project-name.up.railway.app`

---

### Option 2: Render 🎨

**Pros:**
- Free tier available
- Automatic SSL
- PostgreSQL add-on available

**Steps:**

1. **Sign up at [render.com](https://render.com)** (use GitHub)

2. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name:** `be-zmest-api`
     - **Environment:** `Node`
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm run migrate && npm start`
     - **Plan:** Free

3. **Add PostgreSQL database:**
   - Click "New +" → "PostgreSQL"
   - Name it `be-zmest-db`
   - Plan: Free
   - Copy the "Internal Database URL"

4. **Configure environment variables:**
   - In your Web Service → "Environment"
   - Add:
     ```
     DATABASE_URL=<paste-internal-database-url>
     JWT_SECRET=<generate-secure-random-string>
     JWT_EXPIRES_IN=604800
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-domain.com
     PORT=10000
     ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (first deploy takes ~5 minutes)

**Your API URL:** `https://be-zmest-api.onrender.com`

**Note:** Free tier services spin down after 15 minutes of inactivity. First request may take ~30 seconds.

---

### Option 3: Fly.io 🪰

**Pros:**
- Generous free tier
- Global edge locations
- Fast cold starts

**Steps:**

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up and login:**
   ```bash
   fly auth signup
   fly auth login
   ```

3. **Initialize Fly app:**
   ```bash
   fly launch
   ```
   - Follow prompts (don't deploy yet)

4. **Create PostgreSQL database:**
   ```bash
   fly postgres create --name be-zmest-db
   fly postgres attach be-zmest-db
   ```

5. **Set secrets:**
   ```bash
   fly secrets set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   fly secrets set JWT_EXPIRES_IN=604800
   fly secrets set NODE_ENV=production
   fly secrets set FRONTEND_URL=https://your-frontend-domain.com
   ```

6. **Deploy:**
   ```bash
   fly deploy
   ```

7. **Run migrations:**
   ```bash
   fly ssh console
   npm run migrate
   exit
   ```

**Your API URL:** `https://your-app-name.fly.dev`

---

### Option 4: Supabase + Vercel/Netlify (Serverless)

**For serverless deployment:**

1. **Database:** Use [Supabase](https://supabase.com) (free PostgreSQL)
2. **Backend:** Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

**Note:** Requires code modifications for serverless functions.

---

## Database Setup (If using external database)

### Supabase (Free PostgreSQL)

1. **Sign up at [supabase.com](https://supabase.com)**
2. **Create a new project**
3. **Get connection string:**
   - Go to Project Settings → Database
   - Copy "Connection string" → "URI"
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
4. **Use this as your `DATABASE_URL`**

### Neon (Free PostgreSQL)

1. **Sign up at [neon.tech](https://neon.tech)**
2. **Create a new project**
3. **Copy connection string from dashboard**
4. **Use as `DATABASE_URL`**

---

## Connecting Frontend

### 1. Update CORS Configuration

Your backend already supports CORS. Set the `FRONTEND_URL` environment variable:

```env
FRONTEND_URL=https://your-frontend-domain.com
```

Or for local development:
```env
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend API Configuration

In your frontend code, create an API client:

**JavaScript/TypeScript:**
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.com';

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  // Auth methods
  async register(data: { email: string; username: string; password: string }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async login(data: { email: string; password: string }) {
    const result = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    return result;
  },
  
  // Post methods
  async getPosts(limit = 50, offset = 0) {
    return this.request(`/api/posts?limit=${limit}&offset=${offset}`);
  },
  
  async createPost(data: { title: string; content: string }) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
```

**React Example:**
```typescript
// .env
REACT_APP_API_URL=https://your-backend-url.com

// In your component
import { apiClient } from './api';

const MyComponent = () => {
  const handleLogin = async () => {
    try {
      const result = await apiClient.login({
        email: 'user@example.com',
        password: 'password123',
      });
      console.log('Logged in:', result.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  // ...
};
```

### 3. Environment Variables for Frontend

Create `.env` in your frontend project:

```env
REACT_APP_API_URL=https://your-backend-url.up.railway.app
# or
VITE_API_URL=https://your-backend-url.up.railway.app
# or
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
```

---

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Health check endpoint works: `https://your-api-url.com/health`
- [ ] Test registration: `POST /api/auth/register`
- [ ] Test login: `POST /api/auth/login`
- [ ] Test protected endpoint: `GET /api/auth/me` (with token)
- [ ] CORS configured for frontend domain
- [ ] Environment variables set correctly
- [ ] JWT_SECRET is secure and random
- [ ] Frontend can connect to API

---

## Testing Deployed API

### Using cURL:

```bash
# Health check
curl https://your-api-url.com/health

# Register
curl -X POST https://your-api-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login
curl -X POST https://your-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Using Postman:

1. Create a new collection
2. Set base URL: `https://your-api-url.com`
3. Test all endpoints
4. Save token from login response
5. Use token in Authorization header for protected routes

---

## Troubleshooting

### CORS Errors

**Problem:** Frontend can't connect due to CORS

**Solution:**
1. Set `FRONTEND_URL` environment variable to your frontend domain
2. For local development: `FRONTEND_URL=http://localhost:3000`
3. Restart the backend service

### Database Connection Errors

**Problem:** Can't connect to database

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check if database is running (for cloud providers)
3. Ensure database allows connections from your hosting IP
4. For Supabase/Neon: Check connection pooling settings

### Migration Errors

**Problem:** Tables not created

**Solution:**
1. Manually run migrations:
   ```bash
   # Railway
   railway run npm run migrate
   
   # Render
   # Use Render Shell or add to start command
   
   # Fly.io
   fly ssh console
   npm run migrate
   ```

### Port Issues

**Problem:** Service won't start

**Solution:**
- Railway: Uses `PORT` automatically
- Render: Set `PORT=10000` in environment variables
- Fly.io: Configured in `fly.toml`

---

## Recommended Setup

**For beginners:** Railway (easiest, all-in-one)

**For more control:** Render (good free tier, easy setup)

**For performance:** Fly.io (fast, global)

**Database:** Use the built-in PostgreSQL from your hosting provider, or Supabase/Neon for separate database

---

## Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong JWT_SECRET** - Generate with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **Set FRONTEND_URL** - Restrict CORS to your frontend domain in production
4. **Use HTTPS** - All free hosting providers provide SSL automatically
5. **Keep dependencies updated** - Regularly run `npm audit`

---

## Quick Start Commands

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test API after deployment
curl https://your-api-url.com/health

# Check environment variables (Railway)
railway variables

# View logs (Railway)
railway logs

# View logs (Render)
# Go to dashboard → Logs tab
```

---

## Support

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Fly.io Docs: https://fly.io/docs

