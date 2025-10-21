-- Multi-Tenant Physical Therapy SaaS Platform Database Schema
-- Soft Multi-Tenancy Pattern with clinic_id discriminator column

DROP DATABASE IF EXISTS physical_therapy_saas;
CREATE DATABASE physical_therapy_saas;
USE physical_therapy_saas;

-- ============================================
-- TENANT TABLE: Stores clinic information
-- ============================================
CREATE TABLE clinics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',  -- Hex color for clinic branding
    is_active BOOLEAN DEFAULT TRUE,  -- Clinic activation status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USERS TABLE: Stores all staff/admin accounts
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NULL,  -- NULL only for system_admin role
    role ENUM('system_admin', 'clinic_admin', 'staff') NOT NULL,
    job_title VARCHAR(100) NULL,  -- Custom role like 'Therapist', 'Receptionist', etc.
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    INDEX idx_user_clinic (clinic_id),
    INDEX idx_user_email (email),
    INDEX idx_user_role (role),
    
    -- Constraint: system_admin must have NULL clinic_id, others must have non-NULL
    CONSTRAINT chk_clinic_id_role CHECK (
        (role = 'system_admin' AND clinic_id IS NULL) OR
        (role != 'system_admin' AND clinic_id IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PATIENTS TABLE: Stores patient PII
-- ============================================
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,  -- Tenant isolation: must be non-nullable
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    medical_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    INDEX idx_patient_clinic (clinic_id),
    INDEX idx_patient_name (last_name, first_name),
    INDEX idx_patient_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SESSIONS TABLE: Appointment/session scheduling
-- ============================================
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,  -- Tenant isolation: must be non-nullable
    patient_id INT NOT NULL,
    therapist_id INT NOT NULL,  -- References users table (staff or clinic_admin)
    start_time DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    periodicity ENUM('None', 'Weekly', 'BiWeekly', 'Monthly') DEFAULT 'None',
    is_follow_up BOOLEAN DEFAULT FALSE,
    parent_session_id INT NULL,  -- References the original session in a series
    series_order INT DEFAULT 0,  -- Order within the series (0 = initial session)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    
    INDEX idx_session_clinic (clinic_id),
    INDEX idx_session_patient (patient_id),
    INDEX idx_session_therapist (therapist_id),
    INDEX idx_session_start_time (start_time),
    INDEX idx_session_status (status),
    INDEX idx_session_parent (parent_session_id),
    INDEX idx_session_series (parent_session_id, series_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA: Create a system admin (for testing)
-- ============================================
-- Password: Admin123! (hashed with bcrypt)
-- Note: In production, create this manually with a secure password
INSERT INTO users (clinic_id, role, email, password_hash, first_name, last_name)
VALUES (
    NULL,
    'system_admin',
    'admin@system.com',
    '$2a$10$hZDJDo8YmjHRN/lho9seZOUnbECMyivLEBEYKvDvO49nG.tYx862.',
    'System',
    'Administrator'
);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample Clinic 1
INSERT INTO clinics (name) VALUES ('Downtown Physical Therapy');
SET @clinic1_id = LAST_INSERT_ID();

-- Sample Clinic 2
INSERT INTO clinics (name) VALUES ('Uptown Wellness Center');
SET @clinic2_id = LAST_INSERT_ID();

-- Sample Users for Clinic 1 (Password: Admin123!)
INSERT INTO users (clinic_id, role, email, password_hash, first_name, last_name)
VALUES 
    (@clinic1_id, 'clinic_admin', 'admin@downtown-pt.com', '$2a$10$hZDJDo8YmjHRN/lho9seZOUnbECMyivLEBEYKvDvO49nG.tYx862.', 'John', 'Doe'),
    (@clinic1_id, 'staff', 'therapist1@downtown-pt.com', '$2a$10$hZDJDo8YmjHRN/lho9seZOUnbECMyivLEBEYKvDvO49nG.tYx862.', 'Jane', 'Smith');

-- Sample Users for Clinic 2 (Password: Admin123!)
INSERT INTO users (clinic_id, role, email, password_hash, first_name, last_name)
VALUES 
    (@clinic2_id, 'clinic_admin', 'admin@uptown-wellness.com', '$2a$10$hZDJDo8YmjHRN/lho9seZOUnbECMyivLEBEYKvDvO49nG.tYx862.', 'Bob', 'Johnson'),
    (@clinic2_id, 'staff', 'therapist2@uptown-wellness.com', '$2a$10$hZDJDo8YmjHRN/lho9seZOUnbECMyivLEBEYKvDvO49nG.tYx862.', 'Alice', 'Williams');

-- Sample Patients for Clinic 1
INSERT INTO patients (clinic_id, first_name, last_name, email, phone, date_of_birth)
VALUES 
    (@clinic1_id, 'Michael', 'Brown', 'michael.brown@email.com', '555-0101', '1985-03-15'),
    (@clinic1_id, 'Sarah', 'Davis', 'sarah.davis@email.com', '555-0102', '1990-07-22');

-- Sample Patients for Clinic 2
INSERT INTO patients (clinic_id, first_name, last_name, email, phone, date_of_birth)
VALUES 
    (@clinic2_id, 'David', 'Wilson', 'david.wilson@email.com', '555-0201', '1978-11-05'),
    (@clinic2_id, 'Emma', 'Martinez', 'emma.martinez@email.com', '555-0202', '1992-01-30');

