#!/usr/bin/env tsx

/**
 * Migration Script Runner
 * 
 * This script runs database migrations to add the expiration_duration column
 * Run: npx tsx scripts/run-migration.ts
 */

import { pool } from '../src/lib/db.js'

async function runMigration() {
  console.log('🚀 Running database migration...')
  
  const client = await pool.connect()
  
  try {
    // Add expiration_duration column if it doesn't exist
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS expiration_duration VARCHAR(50)
    `)
    console.log('✅ Added expiration_duration column')
    
    // Add comment to the column
    await client.query(`
      COMMENT ON COLUMN users.expiration_duration IS 'Duration string (e.g., 1hour, 1day, 1week, infinite) - expiration starts from first login'
    `).catch((err) => {
      // Comments might fail in some PostgreSQL setups, but that's okay
      console.log('ℹ️  Could not add column comment (non-critical):', err.message)
    })
    
    console.log('✅ Migration completed successfully!')
    console.log('\nℹ️  Note: Existing users with expired_time will keep their absolute expiration.')
    console.log('   New users will use the expiration_duration to start expiration from first login.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
