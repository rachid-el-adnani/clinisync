/**
 * Password Hashing Utility
 * 
 * Use this script to generate bcrypt password hashes for manual user creation
 * Run: node src/scripts/hashPassword.js "YourPasswordHere"
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node src/scripts/hashPassword.js "your_password"');
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }

  console.log('\n===========================================');
  console.log('Password Hash Generated Successfully');
  console.log('===========================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('===========================================');
  console.log('\nUse this hash in your SQL INSERT statement:');
  console.log(`INSERT INTO users (clinic_id, role, email, password_hash, first_name, last_name)`);
  console.log(`VALUES (NULL, 'system_admin', 'admin@system.com', '${hash}', 'System', 'Admin');`);
  console.log('===========================================\n');
});

