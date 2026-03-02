import bcrypt from 'bcrypt'
import { pool } from './db'

export interface User {
  id: number
  username: string
  password: string
  first_login: Date | null
  last_login: Date | null
  expired_time: Date | null
  expiration_duration: string | null
  created_at: Date
  updated_at: Date
}

export interface CreateUserInput {
  username: string
  password: string
  expired_time?: Date | null
  expiration_duration?: string | null
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  const result = await pool.query(
    'SELECT * FROM users ORDER BY created_at DESC'
  )
  return result.rows
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  )
  return result.rows[0] || null
}

// Create a new user
export async function createUser(input: CreateUserInput): Promise<User> {
  const hashedPassword = await hashPassword(input.password)
  
  const result = await pool.query(
    `INSERT INTO users (username, password, expired_time, expiration_duration) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [input.username, hashedPassword, input.expired_time || null, input.expiration_duration || null]
  )
  
  return result.rows[0]
}

// Update user
export async function updateUser(id: number, input: Partial<CreateUserInput>): Promise<User> {
  const updates: string[] = []
  const values: unknown[] = []
  let paramCount = 1

  if (input.username) {
    updates.push(`username = $${paramCount}`)
    values.push(input.username)
    paramCount++
  }

  if (input.password) {
    const hashedPassword = await hashPassword(input.password)
    updates.push(`password = $${paramCount}`)
    values.push(hashedPassword)
    paramCount++
  }

  if (input.expired_time !== undefined) {
    updates.push(`expired_time = $${paramCount}`)
    values.push(input.expired_time)
    paramCount++
  }

  if (input.expiration_duration !== undefined) {
    updates.push(`expiration_duration = $${paramCount}`)
    values.push(input.expiration_duration)
    paramCount++
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const result = await pool.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  )

  return result.rows[0]
}

// Delete user
export async function deleteUser(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id])
  return result.rowCount ? result.rowCount > 0 : false
}

// Authenticate user and update login times
// Note: This function checks expiration time - expired users cannot login
// Expiration starts from first login, not from user creation
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = await getUserByUsername(username)
  
  if (!user) {
    return null
  }

  // Check if password is correct
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  // Check if user has expired (admin should never expire with expired_time = NULL)
  if (user.expired_time && new Date(user.expired_time) < new Date()) {
    return null
  }

  // Update login times
  const now = new Date()
  
  // On first login, calculate and set expiration time based on expiration_duration
  if (!user.first_login && user.expiration_duration && user.expiration_duration !== 'infinite') {
    const expirationTime = calculateExpirationTime(user.expiration_duration)
    
    await pool.query(
      `UPDATE users SET first_login = $1, last_login = $1, expired_time = $2 WHERE id = $3`,
      [now, expirationTime, user.id]
    )
  } else {
    // Regular login time update
    const updates = user.first_login 
      ? 'last_login = $1' 
      : 'first_login = $1, last_login = $1'

    await pool.query(
      `UPDATE users SET ${updates} WHERE id = $2`,
      [now, user.id]
    )
  }

  // Return updated user
  const updatedUser = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [user.id]
  )

  return updatedUser.rows[0]
}

// Generate multiple users with same username/password
export async function generateUsers(
  count: number,
  prefix: string,
  expirationDuration: string | null
): Promise<User[]> {
  const users: User[] = []
  
  for (let i = 1; i <= count; i++) {
    const username = `${prefix}${i}`
    const password = username // Same as username
    
    try {
      const user = await createUser({
        username,
        password,
        expired_time: null, // Will be set on first login
        expiration_duration: expirationDuration
      })
      users.push(user)
    } catch (error) {
      console.error(`Error creating user ${username}:`, error)
    }
  }
  
  return users
}

// Calculate expiration time based on duration
export function calculateExpirationTime(duration: string): Date | null {
  if (duration === 'infinite') {
    return null
  }

  const now = new Date()
  
  switch (duration) {
    case '1hour':
      return new Date(now.getTime() + 60 * 60 * 1000)
    case '12hours':
      return new Date(now.getTime() + 12 * 60 * 60 * 1000)
    case '1day':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case '3days':
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    case '1week':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case '1month':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}
