-- Migration: Add Patient Portal, Treatment Plans, and Notifications
-- Date: 2025-11-07

USE physical_therapy_saas;

-- ============================================
-- PATIENT PORTAL USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_portal_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_portal_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TREATMENT PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS treatment_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    patient_id INT NOT NULL,
    therapist_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    diagnosis TEXT,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_treatment_clinic (clinic_id),
    INDEX idx_treatment_patient (patient_id),
    INDEX idx_treatment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TREATMENT GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS treatment_goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    treatment_plan_id INT NOT NULL,
    goal_text TEXT NOT NULL,
    target_date DATE NULL,
    is_achieved BOOLEAN DEFAULT FALSE,
    achieved_date DATE NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id) ON DELETE CASCADE,
    INDEX idx_goal_plan (treatment_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EXERCISE LIBRARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_library (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NULL,  -- NULL = system-wide exercise, NOT NULL = clinic-specific
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    video_url VARCHAR(500) NULL,
    image_url VARCHAR(500) NULL,
    body_part VARCHAR(100),
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    INDEX idx_exercise_clinic (clinic_id),
    INDEX idx_exercise_body_part (body_part)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRESCRIBED EXERCISES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prescribed_exercises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    treatment_plan_id INT NOT NULL,
    exercise_id INT NOT NULL,
    sets INT DEFAULT 3,
    reps INT DEFAULT 10,
    frequency_per_week INT DEFAULT 3,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercise_library(id) ON DELETE CASCADE,
    INDEX idx_prescribed_plan (treatment_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROGRESS NOTES TABLE (SOAP Notes)
-- ============================================
CREATE TABLE IF NOT EXISTS progress_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    session_id INT NOT NULL,
    patient_id INT NOT NULL,
    therapist_id INT NOT NULL,
    treatment_plan_id INT NULL,
    subjective TEXT,  -- Patient's complaints/feelings
    objective TEXT,   -- Therapist's observations/measurements
    assessment TEXT,  -- Clinical judgment
    plan TEXT,        -- Next steps
    pain_level INT NULL,  -- 0-10 scale
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(id) ON DELETE SET NULL,
    INDEX idx_progress_clinic (clinic_id),
    INDEX idx_progress_session (session_id),
    INDEX idx_progress_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    recipient_type ENUM('patient', 'staff') NOT NULL,
    recipient_id INT NOT NULL,  -- patient_id or user_id
    notification_type ENUM('appointment_reminder', 'appointment_confirmation', 'cancellation', 'rescheduling', 'exercise_reminder', 'balance_due', 'general') NOT NULL,
    channel ENUM('email', 'sms', 'push', 'in_app') NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed', 'cancelled') DEFAULT 'pending',
    scheduled_for TIMESTAMP NOT NULL,
    sent_at TIMESTAMP NULL,
    error_message TEXT NULL,
    related_session_id INT NULL,
    metadata JSON NULL,  -- Store additional data like phone numbers, email addresses, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (related_session_id) REFERENCES sessions(id) ON DELETE SET NULL,
    INDEX idx_notification_clinic (clinic_id),
    INDEX idx_notification_status (status),
    INDEX idx_notification_scheduled (scheduled_for),
    INDEX idx_notification_recipient (recipient_type, recipient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTIFICATION SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    channels JSON NOT NULL,  -- ["email", "sms"] etc.
    timing_hours INT NOT NULL,  -- Hours before event (24, 48, etc.)
    template TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    INDEX idx_settings_clinic (clinic_id),
    UNIQUE KEY unique_clinic_notification_type (clinic_id, notification_type, timing_hours)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- APPOINTMENT BOOKING REQUESTS TABLE (Patient Portal)
-- ============================================
CREATE TABLE IF NOT EXISTS booking_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    patient_id INT NOT NULL,
    preferred_therapist_id INT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    approved_by INT NULL,
    approved_session_id INT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (preferred_therapist_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_session_id) REFERENCES sessions(id) ON DELETE SET NULL,
    INDEX idx_booking_clinic (clinic_id),
    INDEX idx_booking_patient (patient_id),
    INDEX idx_booking_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA: Default System-Wide Exercises
-- ============================================
INSERT INTO exercise_library (clinic_id, name, description, instructions, body_part, difficulty) VALUES
(NULL, 'Shoulder Flexion', 'Improves shoulder mobility and strength', 'Raise arms forward and up over head. Lower slowly. Repeat.', 'shoulder', 'beginner'),
(NULL, 'Knee Extension', 'Strengthens quadriceps muscles', 'Sit in chair. Straighten knee fully. Hold 5 seconds. Lower slowly.', 'knee', 'beginner'),
(NULL, 'Ankle Pumps', 'Reduces swelling and improves circulation', 'Point toes down, then pull toes up toward shin. Repeat 10 times.', 'ankle', 'beginner'),
(NULL, 'Wall Push-ups', 'Strengthens chest and arms', 'Stand arms length from wall. Lean in, bend elbows, push back. Repeat.', 'upper_body', 'beginner'),
(NULL, 'Hamstring Stretch', 'Improves hamstring flexibility', 'Sit with leg extended. Reach toward toes. Hold 30 seconds.', 'leg', 'beginner'),
(NULL, 'Hip Abduction', 'Strengthens hip muscles', 'Lie on side. Lift top leg up. Hold 5 seconds. Lower slowly.', 'hip', 'intermediate'),
(NULL, 'Cat-Cow Stretch', 'Improves spinal mobility', 'On hands and knees. Arch back (cow), then round back (cat). Repeat.', 'spine', 'beginner'),
(NULL, 'Calf Raises', 'Strengthens calf muscles', 'Stand holding support. Rise up on toes. Hold 2 seconds. Lower slowly.', 'leg', 'beginner');

-- ============================================
-- SEED DATA: Default Notification Settings
-- ============================================
-- These will be added when a clinic is created (via backend logic)
-- Example templates for each clinic would include:
-- - 24-hour appointment reminder
-- - 48-hour appointment reminder  
-- - Cancellation notification
-- - Rescheduling notification

