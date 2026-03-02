#!/usr/bin/env tsx

/**
 * Database Setup Script
 * 
 * This script initializes the database with some sample users for testing.
 * Run: npx tsx scripts/setup-db.ts
 */

import { initDatabase } from '../src/lib/db.js'
import { createUser, generateUsers } from '../src/lib/users.js'

async function setup() {
  console.log('🚀 Initializing database...')
  
  try {
    // Initialize database schema
    await initDatabase()
    console.log('✅ Database schema created')
    
    // Create an admin user
    console.log('\n📝 Creating admin user...')
    await createUser({
      username: 'admin',
      password: 'admin',
      expired_time: null, // Infinite access
      expiration_duration: null
    })
    console.log('✅ Admin user created (username: admin, password: admin)')
    
    // Create some test users with duration-based expiration
    console.log('\n📝 Creating test users...')
    await createUser({
      username: 'testuser',
      password: 'test123',
      expired_time: null,
      expiration_duration: '1week'
    })
    console.log('✅ Test user created (username: testuser, password: test123, expires: 1 week from first login)')
    
    // Generate bulk users with duration-based expiration
    console.log('\n📝 Generating bulk users...')
    await generateUsers(5, 'guest', '1day')
    console.log('✅ Generated 5 guest users (guest1/guest1 to guest5/guest5, expires: 1 day from first login)')
    
    console.log('\n🎉 Database setup complete!')
    console.log('\n📋 Summary:')
    console.log('   - Admin user: admin/admin (infinite access)')
    console.log('   - Test user: testuser/test123 (expires 1 week after first login)')
    console.log('   - Guest users: guest1/guest1 to guest5/guest5 (expires 1 day after first login)')
    console.log('\n🌐 Access the admin panel at: http://localhost:3000/admin/login')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

setup()
