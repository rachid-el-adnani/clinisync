#!/usr/bin/env node
/**
 * Database initialization script for production (Railway)
 * Run this once after deploying to Railway
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initProductionDatabase() {
  console.log('🚀 Starting production database initialization...\n');

  // Connection config for Railway MySQL
  const config = {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    multipleStatements: true
  };

  console.log(`📡 Connecting to MySQL at ${config.host}:${config.port}...`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL\n');

    // Read and execute schema
    console.log('📄 Reading schema.sql...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔨 Creating tables...');
    await connection.query(schema);
    console.log('✅ Tables created successfully\n');

    // Check if system admin already exists
    const [existingAdmin] = await connection.query(
      'SELECT * FROM users WHERE role = ? LIMIT 1',
      ['system_admin']
    );

    if (existingAdmin.length === 0) {
      console.log('👤 Creating system admin...');
      const bcrypt = require('bcryptjs');
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

    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update FRONTEND_URL environment variable in Railway');
    console.log('2. Deploy your frontend to Netlify');
    console.log('3. Update frontend API_BASE_URL to your Railway URL\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

initProductionDatabase();

