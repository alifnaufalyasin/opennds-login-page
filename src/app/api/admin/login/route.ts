import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername, verifyPassword } from '@/lib/users'
import { initDatabase } from '@/lib/db'
import { signAdminToken } from '@/lib/auth'

// Initialize database on first request
let dbInitialized = false

async function ensureDatabase() {
  if (!dbInitialized) {
    await initDatabase()
    dbInitialized = true
  }
}

// POST /api/admin/login - Admin authentication
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
    
    // Only allow admin username
    if (username !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }
    
    const user = await getUserByUsername(username)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }
    
    // Verify password only - admin login does NOT check expiration
    // Admin should always be able to access the admin panel
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }
    
    // Create JWT token
    const token = await signAdminToken(username)
    
    // Set cookie
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: { username }
    })
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/' // Ensure cookie is accessible from all paths
    })
    
    return response
  } catch (error) {
    console.error('Error during admin login:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
