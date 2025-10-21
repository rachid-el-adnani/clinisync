# 🚀 CliniSync Deployment Guide

## Railway (Backend) + Netlify (Frontend)

### **Backend Deployment (Railway)**

#### 1. Create Railway Project
- Go to [railway.app/new](https://railway.app/new)
- Deploy from GitHub repo: `rachid-el-adnani/clinisync`

#### 2. Add MySQL Database
- Click "+ New" → "Database" → "Add MySQL"
- Railway automatically provides MySQL environment variables

#### 3. Configure Environment Variables
Add these to your Node.js service (not MySQL):
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://your-app.netlify.app
PORT=3000
```

#### 4. Generate Domain
- Go to Settings → Domains → "Generate Domain"
- Copy your Railway URL (e.g., `https://clinisync-production.up.railway.app`)

#### 5. Initialize Database

**Method 1 - Automatic (Recommended):**
1. In Railway → Your Node.js service → Settings
2. Find "Custom Start Command"
3. Change to: `npm run start:railway`
4. Click "Deploy"
5. Check logs to confirm database initialization
6. After confirmation, change back to `npm start` (optional - start:railway is safe to keep)

**Method 2 - Manual via Dashboard:**
1. Temporarily change start command to: `npm run init-prod-db && npm start`
2. Deploy and watch logs
3. Change back to `npm start`

**Default System Admin Credentials:**
- Email: `admin@clinisync.com`
- Password: `admin123`

---

### **Frontend Deployment (Netlify)**

#### 1. Deploy to Netlify
- Go to [netlify.com](https://netlify.com)
- New site from Git → Select `rachid-el-adnani/clinisync`

#### 2. Build Settings
```
Base directory:      frontend
Build command:       npm run build
Publish directory:   frontend/dist
```

#### 3. Environment Variable
Add in Netlify → Site settings → Environment variables:
```
VITE_API_URL=https://your-railway-url.up.railway.app/api
```

#### 4. Update Railway CORS
Go back to Railway → Environment variables → Update:
```
FRONTEND_URL=https://your-app.netlify.app
```

#### 5. Redeploy Both
- Redeploy Railway service
- Redeploy Netlify site

---

## 🎉 Your App is Live!

**Frontend:** `https://your-app.netlify.app`  
**Backend API:** `https://your-railway-url.up.railway.app`

### Test Your Deployment
```bash
# Test backend health
curl https://your-railway-url.up.railway.app/health

# Test login (from frontend)
# Navigate to: https://your-app.netlify.app
# Login with: admin@clinisync.com / admin123
```

---

## 📝 Post-Deployment Checklist

- [ ] Backend deployed on Railway
- [ ] MySQL database initialized
- [ ] Railway domain generated
- [ ] Frontend deployed on Netlify
- [ ] VITE_API_URL configured in Netlify
- [ ] FRONTEND_URL configured in Railway
- [ ] Both services redeployed
- [ ] Login tested
- [ ] Create a clinic tested
- [ ] Change default admin password

---

## 🔧 Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` in Railway matches your Netlify URL exactly
- Redeploy Railway after changing environment variables

### Database Connection Failed
- Check MySQL service is running in Railway
- Verify MySQL environment variables are present
- Run `railway run npm run init-prod-db` if database is empty

### 404 on Frontend Routes
- Add `_redirects` file to `frontend/public/`:
  ```
  /*    /index.html   200
  ```

### API Not Found
- Verify `VITE_API_URL` in Netlify environment variables
- Ensure it ends with `/api`
- Check Railway service is deployed and running

