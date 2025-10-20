/**
 * Database Initialization Script
 * 
 * This script initializes the database by executing the schema.sql file.
 * Run this script using: npm run init-db
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  console.log('Starting database initialization...\n');

  // Create connection without database selected
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');

    // Execute schema
    await connection.query(schema);

    console.log('✅ Database initialized successfully!\n');
    console.log('Database: physical_therapy_saas');
    console.log('Tables created:');
    console.log('  - clinics');
    console.log('  - users');
    console.log('  - patients');
    console.log('  - sessions\n');
    console.log('Sample data has been inserted for testing.\n');
    console.log('⚠️  IMPORTANT: Update the system_admin password hash in the users table before production use.\n');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run initialization
initializeDatabase();

