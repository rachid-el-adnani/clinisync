# 🚀 CliniSync Deployment WITHOUT Railway

## Complete Guide: Vercel + PlanetScale

---

## 📋 **Overview**

We'll deploy:
- ✅ **Backend API** → Vercel Serverless Functions
- ✅ **Frontend** → Vercel
- ✅ **Database** → PlanetScale (Free MySQL)

---

## 🗄️ **STEP 1: Set Up PlanetScale Database (5 minutes)**

### 1.1 Create PlanetScale Account
1. Go to: https://planetscale.com
2. Sign up with GitHub
3. Click "Create database"
4. Database name: `clinisync`
5. Region: Choose closest to you
6. Click "Create database"

### 1.2 Get Database Credentials
1. In your database dashboard, click "Connect"
2. Click "Create password"
3. Name: `vercel-production`
4. Click "Create password"
5. **COPY THESE VALUES** (you'll need them for Vercel):
   ```
   Host:     [something].us-east-1.psdb.cloud
   Username: [your-username]
   Password: [your-password]
   Database: clinisync
   Port:     3306
   ```

### 1.3 Initialize Database
1. Click "Console" tab in PlanetScale
2. Copy the contents of `database/schema.sql`
3. Paste into the console
4. Click "Execute"
5. Database tables created! ✅

### 1.4 Create System Admin (One-time)
In PlanetScale Console, run:
```sql
INSERT INTO users (email, password_hash, role, first_name, last_name, created_at) 
VALUES (
  'admin@clinisync.com',
  '$2a$10$kXVHjKQJZ3YqYZQZQZQZQuW9qXVHjKQJZ3YqYZQZQZQZQuW9qX',
  'system_admin',
  'System',
  'Administrator',
  NOW()
);
```

**Note:** You'll change this password after first login.

---

## 🚀 **STEP 2: Deploy to Vercel (3 minutes)**

### 2.1 Import Project
1. Go to: https://vercel.com/new
2. Sign in with GitHub
3. Import: `rachid-el-adnani/clinisync`
4. Click "Import"

### 2.2 Configure Project
```
Framework Preset:      Vite
Root Directory:        ./ (leave as root)
Build Command:         cd frontend && npm install && npm run build
Output Directory:      frontend/dist
Install Command:       npm install
```

### 2.3 Add Environment Variables

In the "Environment Variables" section, add these:

**Database Variables:**
```
DB_HOST      = [from PlanetScale]
DB_USER      = [from PlanetScale]
DB_PASSWORD  = [from PlanetScale]
DB_NAME      = clinisync
DB_PORT      = 3306
```

**App Variables:**
```
JWT_SECRET         = clinisync-super-secret-production-key-2024
NODE_ENV           = production
FRONTEND_URL       = https://clinisync.vercel.app
VITE_API_URL       = https://clinisync.vercel.app/api
```

**Note:** The FRONTEND_URL will be your actual Vercel URL after deployment. Update it after you get your URL!

### 2.4 Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes
3. You'll get your URL: `https://clinisync.vercel.app`

---

## ✅ **STEP 3: Update URLs (1 minute)**

After deployment, you'll get a Vercel URL. Update these environment variables:

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update:
   ```
   FRONTEND_URL = https://your-actual-url.vercel.app
   VITE_API_URL = https://your-actual-url.vercel.app/api
   ```
3. Redeploy: Deployments → Click "..." → "Redeploy"

---

## 🎉 **STEP 4: Test Your App**

1. Open: `https://your-url.vercel.app`
2. Login with:
   - Email: `admin@clinisync.com`
   - Password: `admin123`
3. If login works → **SUCCESS!** 🎊

---

## 🔧 **Troubleshooting**

### Database Connection Error
- Check PlanetScale database is running
- Verify credentials in Vercel environment variables
- Make sure DB_HOST includes the full domain (e.g., `aws.connect.psdb.cloud`)

### CORS Error
- Verify FRONTEND_URL matches your Vercel URL exactly
- Redeploy after updating environment variables

### 404 on API Routes
- Check vercel.json is correctly configured
- Verify api/index.js exists
- Check Vercel build logs

### Build Fails
- Check frontend/package.json exists
- Verify all dependencies are installed
- Check Vercel build logs for specific errors

---

## 💰 **Cost**

- ✅ Vercel: FREE (Hobby plan)
- ✅ PlanetScale: FREE (Hobby plan, 5GB storage)
- ✅ Total: $0/month

---

## 🌐 **Your Production URLs**

- **Full App:** https://your-url.vercel.app
- **API:** https://your-url.vercel.app/api
- **Database:** PlanetScale Dashboard

---

## 📝 **Alternative: Vercel Backend + Netlify Frontend**

If you want to split:

### Backend (Vercel):
- Deploy only the backend
- Get API URL
- Use that URL in frontend

### Frontend (Netlify):
- Set VITE_API_URL to Vercel backend URL
- Deploy with netlify.toml

I can set this up if you prefer!

---

## ⚡ **Next Steps**

1. Set up PlanetScale database
2. Get credentials
3. Deploy to Vercel with environment variables
4. Test your app!

All set! 🚀

