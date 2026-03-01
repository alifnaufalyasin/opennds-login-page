import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/users'
import { initDatabase } from '@/lib/db'

// Initialize database on first request
let dbInitialized = false

async function ensureDatabase() {
  if (!dbInitialized) {
    await initDatabase()
    dbInitialized = true
  }
}

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
  try {
    await ensureDatabase()
    const body = await request.json()
    const { username, password } = body
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    const user = await authenticateUser(username, password)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials or expired account' },
        { status: 401 }
      )
    }
    
    // Return user without password
    return NextResponse.json({ 
      user: { ...user, password: undefined },
      message: 'Authentication successful'
    })
  } catch (error) {
    console.error('Error authenticating user:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
