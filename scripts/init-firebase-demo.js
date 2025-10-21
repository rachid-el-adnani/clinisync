#!/usr/bin/env node
/**
 * Initialize Firebase with Demo Data
 * Run this once to set up demo data in Firebase
 */

const { collection, addDoc, Timestamp } = require('firebase/firestore');
const { db } = require('../src/config/firebase');
const bcrypt = require('bcryptjs');

async function initFirebaseDemo() {
  console.log('🔥 Initializing Firebase with demo data...\n');

  try {
    // Create System Admin
    console.log('👤 Creating system admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminRef = await addDoc(collection(db, 'users'), {
      email: 'admin@clinisync.com',
      password_hash: hashedPassword,
      role: 'system_admin',
      job_title: null,
      clinic_id: null,
      first_name: 'System',
      last_name: 'Administrator',
      is_active: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    console.log('✅ System admin created:', adminRef.id);

    // Create Demo Clinic
    console.log('\n🏥 Creating demo clinic...');
    const clinicRef = await addDoc(collection(db, 'clinics'), {
      name: 'Demo Wellness Center',
      primary_color: '#3B82F6',
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    console.log('✅ Demo clinic created:', clinicRef.id);

    // Create Clinic Admin
    console.log('\n👤 Creating clinic admin...');
    const clinicAdminRef = await addDoc(collection(db, 'users'), {
      email: 'admin@demowellness.com',
      password_hash: hashedPassword,
      role: 'clinic_admin',
      job_title: 'Clinic Administrator',
      clinic_id: clinicRef.id,
      first_name: 'Clinic',
      last_name: 'Admin',
      is_active: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    console.log('✅ Clinic admin created:', clinicAdminRef.id);

    // Create Demo Therapist
    console.log('\n👤 Creating demo therapist...');
    const therapistRef = await addDoc(collection(db, 'users'), {
      email: 'therapist@demowellness.com',
      password_hash: hashedPassword,
      role: 'staff',
      job_title: 'Physical Therapist',
      clinic_id: clinicRef.id,
      first_name: 'John',
      last_name: 'Therapist',
      is_active: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    console.log('✅ Demo therapist created:', therapistRef.id);

    // Create Demo Patient
    console.log('\n🤕 Creating demo patient...');
    const patientRef = await addDoc(collection(db, 'patients'), {
      clinic_id: clinicRef.id,
      first_name: 'Jane',
      last_name: 'Patient',
      email: 'jane.patient@example.com',
      phone: '555-1234',
      date_of_birth: '1990-01-01',
      address: '123 Main St',
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    console.log('✅ Demo patient created:', patientRef.id);

    // Create Demo Session
    console.log('\n📅 Creating demo session...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const sessionRef = await addDoc(collection(db, 'sessions'), {
      clinic_id: clinicRef.id,
      patient_id: patientRef.id,
      therapist_id: therapistRef.id,
      start_time: Timestamp.fromDate(tomorrow),
      duration_minutes: 60,
      status: 'scheduled',
      periodicity: 'Weekly',
      is_follow_up: false,
      parent_session_id: null,
      series_order: 0,
      notes: 'Initial evaluation session',
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    console.log('✅ Demo session created:', sessionRef.id);

    console.log('\n🎉 Firebase demo data initialized successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   System Admin: admin@clinisync.com / admin123');
    console.log('   Clinic Admin: admin@demowellness.com / admin123');
    console.log('   Therapist:    therapist@demowellness.com / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    process.exit(1);
  }
}

initFirebaseDemo();

