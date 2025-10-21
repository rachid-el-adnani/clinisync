#!/usr/bin/env node
/**
 * Simplified Railway database initialization
 * This script runs as part of the start command on first deployment
 */

const pool = require('../src/config/database');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function init() {
  console.log('🚀 Railway Database Initialization\n');
  
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Database connected\n');

    // Check if tables exist
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      console.log('📄 Creating database schema...');
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolons and execute each statement
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        await connection.query(statement);
      }
      console.log('✅ Database schema created\n');
    } else {
      console.log('ℹ️  Database schema already exists\n');
    }

    // Check if system admin exists
    const [admins] = await connection.query(
      'SELECT id FROM users WHERE role = ? LIMIT 1',
      ['system_admin']
    );

    if (admins.length === 0) {
      console.log('👤 Creating system admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        ['admin@clinisync.com', hashedPassword, 'system_admin', 'System', 'Administrator']
      );
      console.log('✅ System admin created: admin@clinisync.com / admin123\n');
    } else {
      console.log('ℹ️  System admin already exists\n');
    }

    console.log('🎉 Database ready!\n');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    if (connection) connection.release();
    
    // Don't fail the deployment - just log the error
    // The database might already be initialized
    console.log('⚠️  Continuing with server start...\n');
    process.exit(0);
  }
}

init();

