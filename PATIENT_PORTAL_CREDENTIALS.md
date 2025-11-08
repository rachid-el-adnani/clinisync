# 🔐 Patient Portal Login Credentials

## ✅ Ready to Use Patient Accounts

I've created patient portal accounts for you to test with:

### Patient Portal Login #1
- **URL:** http://localhost:5173/patient-portal/login
- **Email:** `michael.brown@email.com`
- **Password:** `Patient123!`
- **Patient Name:** Michael Brown

### Patient Portal Login #2
- **URL:** http://localhost:5173/patient-portal/login
- **Email:** `sarah.davis@email.com`
- **Password:** `Patient123!`
- **Patient Name:** Sarah Davis

### Patient Portal Login #3
- **URL:** http://localhost:5173/patient-portal/login
- **Email:** `david.wilson@email.com`
- **Password:** `Patient123!`
- **Patient Name:** David Wilson

---

## 📋 Available Patients in Database

Here are all the patients you can create portal accounts for:

| ID | Name | Email | Portal Status |
|----|------|-------|---------------|
| 1 | Michael Brown | michael.brown@email.com | ✅ Active |
| 2 | Sarah Davis | sarah.davis@email.com | ✅ Active |
| 3 | David Wilson | david.wilson@email.com | ✅ Active |
| 4 | Emma Martinez | emma.martinez@email.com | ❌ Not Created |

---

## 🛠️ How to Create More Patient Portal Accounts

### Method 1: Using MySQL Command Line
```sql
USE physical_therapy_saas;

-- Create portal account for patient ID 2 (Sarah Davis)
INSERT INTO patient_portal_users (patient_id, email, password_hash) 
VALUES (
  2,  -- Change this to the patient ID
  'sarah.davis@email.com',  -- Patient's email
  '$2a$10$kuZjy0xb/9OXJmDkLbebdu2v72dY1F8hMVCtl3SmDIxbX6yi8EG8y'  -- Password: Patient123!
);
```

### Method 2: Run the SQL file
```bash
cd /Users/reladnani/Desktop/doc
mysql -u root physical_therapy_saas < CREATE_PATIENT_PORTAL_USER.sql
```

---

## 🔑 Default Passwords

All demo accounts use the same password for simplicity:
- **Password:** `Patient123!`
- **Hashed:** `$2a$10$kuZjy0xb/9OXJmDkLbebdu2v72dY1F8hMVCtl3SmDIxbX6yi8EG8y`

---

## 🧪 What You Can Test in Patient Portal

1. ✅ **Login** - Use any of the credentials above
2. ✅ **Dashboard** - View upcoming and past appointments
3. ✅ **Treatment Plans** - See your treatment plans with goals and exercises
4. ✅ **Goals Tracking** - View treatment goals and progress
5. ✅ **Exercise Programs** - See prescribed exercises with sets/reps/frequency
6. ✅ **Profile** - View and update patient information
7. ✅ **Sessions** - See all scheduled therapy sessions

---

## 👨‍⚕️ Staff/Admin Login (Existing)

For comparison, here are the staff credentials:

### System Admin
- **Email:** `admin@system.com`
- **Password:** `Admin123!`

### Clinic Admins (Sample Data)
- **Email:** `admin@downtown-pt.com`
- **Password:** `Admin123!`

---

## 🎯 Next Steps

1. **Login as Patient:** http://localhost:5173/patient-portal/login
2. **Login as Staff:** http://localhost:5173/login
3. **Create Treatment Plan:** Go to Dashboard → Treatment Plans → New Treatment Plan
4. **Configure Notifications:** Go to Dashboard → Notifications

Enjoy testing! 🚀

