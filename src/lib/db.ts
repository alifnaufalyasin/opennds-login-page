import { Pool } from 'pg'

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/opennds',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Initialize database schema
export async function initDatabase() {
  const client = await pool.connect()
  try {
    // Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_login TIMESTAMP,
        last_login TIMESTAMP,
        expired_time TIMESTAMP,
        expiration_duration VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Add expiration_duration column if it doesn't exist (for existing databases)
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS expiration_duration VARCHAR(50)
    `).catch(() => {
      // Ignore if column already exists
    })
    
    // Create index on username for faster lookups (ignore if exists)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `).catch(() => {
      // Ignore if index already exists
    })
    
    console.log('Database initialized successfully')
  } catch (error: unknown) {
    // Ignore if table already exists
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      console.log('Database already initialized')
      return
    }
    console.error('Error initializing database:', error)
    throw error
  } finally {
    client.release()
  }
}

export { pool }
