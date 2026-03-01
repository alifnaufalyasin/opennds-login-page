#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script initializes the database with some sample users for testing.
 * Run: node scripts/setup-db.js
 */

import { initDatabase } from '../src/lib/db.js'
import { createUser, generateUsers, calculateExpirationTime } from '../src/lib/users.js'

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
      password: 'admin123',
      expired_time: null // Infinite access
    })
    console.log('✅ Admin user created (username: admin, password: admin123)')
    
    // Create some test users
    console.log('\n📝 Creating test users...')
    await createUser({
      username: 'testuser',
      password: 'test123',
      expired_time: calculateExpirationTime('1week')
    })
    console.log('✅ Test user created (username: testuser, password: test123, expires: 1 week)')
    
    // Generate bulk users
    console.log('\n📝 Generating bulk users...')
    await generateUsers(5, 'guest', calculateExpirationTime('1day'))
    console.log('✅ Generated 5 guest users (guest1/guest1 to guest5/guest5, expires: 1 day)')
    
    console.log('\n🎉 Database setup complete!')
    console.log('\n📋 Summary:')
    console.log('   - Admin user: admin/admin123 (infinite access)')
    console.log('   - Test user: testuser/test123 (expires in 1 week)')
    console.log('   - Guest users: guest1/guest1 to guest5/guest5 (expires in 1 day)')
    console.log('\n🌐 Access the admin panel at: http://localhost:3000/admin')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

setup()
