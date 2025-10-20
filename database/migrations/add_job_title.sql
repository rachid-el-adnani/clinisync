-- Migration: Add job_title column to users table
-- This allows custom staff roles like 'Therapist', 'Receptionist', etc.

USE physical_therapy_saas;

ALTER TABLE users 
ADD COLUMN job_title VARCHAR(100) NULL COMMENT 'Custom role like Therapist, Receptionist, etc.' 
AFTER role;

-- Update existing staff to have default job titles
UPDATE users 
SET job_title = CASE 
    WHEN role = 'system_admin' THEN 'System Administrator'
    WHEN role = 'clinic_admin' THEN 'Clinic Administrator'
    WHEN role = 'staff' THEN 'Therapist'
    ELSE 'Staff'
END
WHERE job_title IS NULL;

