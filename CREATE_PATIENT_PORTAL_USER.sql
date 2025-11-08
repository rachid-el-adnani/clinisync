-- ============================================
-- CREATE PATIENT PORTAL USER
-- ============================================
-- This script creates a patient portal account for an existing patient
-- Password: Patient123! (hashed with bcrypt)

USE physical_therapy_saas;

-- Step 1: Find an existing patient to give portal access
-- (This shows the first patient from clinic 1 as an example)
SELECT id, first_name, last_name, email 
FROM patients 
WHERE clinic_id = 1 
LIMIT 5;

-- Step 2: Create patient portal login for patient ID 1
-- Change the patient_id and email as needed based on Step 1 results
INSERT INTO patient_portal_users (patient_id, email, password_hash) 
VALUES (
  1,  -- Change this to the patient ID you want to give portal access
  'patient@example.com',  -- Change this to the patient's email
  '$2a$10$kuZjy0xb/9OXJmDkLbebdu2v72dY1F8hMVCtl3SmDIxbX6yi8EG8y'  -- Password: Patient123!
);

-- Step 3: Verify the patient portal user was created
SELECT ppu.id, ppu.email, p.first_name, p.last_name, p.clinic_id
FROM patient_portal_users ppu
JOIN patients p ON ppu.patient_id = p.id;

-- ============================================
-- LOGIN CREDENTIALS
-- ============================================
-- Portal URL: http://localhost:5173/patient-portal/login
-- Email: patient@example.com (or the email you set above)
-- Password: Patient123!
-- ============================================

-- NOTES:
-- 1. Make sure the email matches or use the patient's actual email from the patients table
-- 2. Each patient can only have ONE portal account (patient_id is UNIQUE)
-- 3. If you get "Duplicate entry" error, the patient already has a portal account

