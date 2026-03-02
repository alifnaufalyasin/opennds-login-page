#!/usr/bin/env tsx

/**
 * Password Hash Generator
 * 
 * This script generates a bcrypt hash for a given password.
 * Run: npx tsx scripts/generate-hash.ts
 */

import { hashPassword } from '../src/lib/users.js'

async function generateHash() {
  const password = process.argv[2] || 'admin'
  const hash = await hashPassword(password)
  
  console.log('==========================================')
  console.log('Password Hash Generator')
  console.log('==========================================')
  console.log(`Password: "${password}"`)
  console.log(`Hash: ${hash}`)
  console.log('==========================================')
  console.log('\nNote: bcrypt generates a different hash each time')
  console.log('due to a random salt, but all hashes will verify')
  console.log('correctly against the original password.')
  console.log('\nUsage: npx tsx scripts/generate-hash.ts [password]')
  console.log('Example: npx tsx scripts/generate-hash.ts mypassword')
  
  process.exit(0)
}

generateHash().catch((error) => {
  console.error('Error generating hash:', error)
  process.exit(1)
})
