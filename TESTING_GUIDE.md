# ✅ CliniSync - Local Testing Guide

## 🎯 System is Ready!

### **Servers Running:**
- ✅ Backend API: `http://localhost:3000`
- ✅ Frontend: `http://localhost:5173`
- ✅ Database: MySQL (localhost:3306)

---

## 🔑 Login Credentials

### System Admin:
```
Email:    admin@example.com
Password: admin123
```

### Demo Clinic Admin:
```
Email:    admin@demopt.com
Password: admin123
```

### Demo Therapist:
```
Email:    therapist@demopt.com
Password: admin123
```

---

## 🧪 Test Clinic Deactivation Feature

### Step 1: Login as System Admin
1. Open: `http://localhost:5173`
2. Login with: `admin@example.com` / `admin123`

### Step 2: Go to Clinics
- Click "Clinics" in the sidebar

### Step 3: View Clinic Details
- Click on "Downtown Physical Therapy" (or any clinic)

### Step 4: Deactivate the Clinic
1. Click the red "Deactivate" button (with power icon)
2. Enter a reason (e.g., "Testing deactivation feature")
3. Click "Deactivate Clinic"
4. ✅ Clinic should be marked as inactive

### Step 5: Logout
- Click your profile → Logout

### Step 6: Login as Clinic Admin
1. Login with: `admin@demopt.com` / `admin123`
2. ✅ You should see the **Clinic Deactivated Page** with:
   - Warning alert
   - Deactivation reason
   - System admin contact info
   - Email button to contact admin
   - Logout option

### Step 7: Try to Navigate
- Try to go to `/dashboard`, `/patients`, `/schedule`
- ✅ You should always be redirected back to the deactivated page

### Step 8: Reactivate (as System Admin)
1. Logout from clinic admin
2. Login as system admin (`admin@example.com`)
3. Go to Clinics → Click the clinic
4. Click green "Activate" button
5. ✅ Clinic is reactivated

### Step 9: Test Normal Access
1. Logout
2. Login as clinic admin again
3. ✅ You should now have normal access to all pages

---

## ✨ Features Implemented

### Clinic Deactivation:
- ✅ System admins can activate/deactivate clinics
- ✅ Deactivation reason stored
- ✅ Clinic admins and staff blocked when clinic is inactive
- ✅ System admins never affected by clinic deactivation
- ✅ Beautiful deactivation page with contact info
- ✅ One-click email to system admin
- ✅ Auto-redirect on all routes when deactivated

### Role-Based Access:
- ✅ System Admin: Full access to everything
- ✅ Clinic Admin: Manage their clinic, patients, staff, sessions
- ✅ Staff (Therapist): View assigned patients and sessions
- ✅ Staff (Secretary): Can create patients

---

## 🔧 Troubleshooting

### If you see CORS errors:
- Check that frontend is on `http://localhost:5173`
- Backend should allow this origin (already configured)

### If login fails:
- Check database has users: `mysql -u root physical_therapy_saas -e "SELECT * FROM users;"`
- Verify password is `admin123` (hashed in database)

### If clinic deactivation doesn't work:
- Check `is_active` column exists: `mysql -u root physical_therapy_saas -e "DESCRIBE clinics;"`
- Should show `is_active` as `tinyint(1)` with default `1`

---

## 📝 Database State

### Current Users:
- 1 System Admin
- 2 Clinic Admins  
- 2 Staff Members

### Current Clinics:
- 2 Clinics (both active by default)

---

## 🎉 Ready to Test!

Open your browser: **http://localhost:5173**

Start with system admin login and test the deactivation feature!

