import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers, createUser, updateUser, deleteUser, generateUsers, calculateExpirationTime } from '@/lib/users'
import { initDatabase } from '@/lib/db'
import { verifyAdminToken } from '@/lib/auth'

// Initialize database on first request
let dbInitialized = false

async function ensureDatabase() {
  if (!dbInitialized) {
    await initDatabase()
    dbInitialized = true
  }
}

// Verify admin authentication
async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin-token')?.value
  if (!token) return false
  
  const payload = await verifyAdminToken(token)
  return payload !== null && payload.username === 'admin'
}

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    await ensureDatabase()
    
    // Check authentication
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const users = await getAllUsers()
    
    // Remove password from response
    const sanitizedUsers = users.map(user => ({
      ...user,
      password: undefined
    }))
    
    return NextResponse.json({ users: sanitizedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user or generate multiple users
export async function POST(request: NextRequest) {
  try {
    await ensureDatabase()
    
    // Check authentication
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Check if this is a bulk generation request
    if (body.action === 'generate') {
      const { count, prefix, duration } = body
      
      if (!count || !prefix) {
        return NextResponse.json(
          { error: 'Count and prefix are required for generation' },
          { status: 400 }
        )
      }
      
      const expiredTime = calculateExpirationTime(duration || 'infinite')
      const users = await generateUsers(count, prefix, expiredTime)
      
      return NextResponse.json({ 
        users: users.map(user => ({
          ...user,
          password: undefined
        })),
        message: `Generated ${users.length} users`
      })
    }
    
    // Single user creation
    const { username, password, expired_time } = body
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    const user = await createUser({
      username,
      password,
      expired_time: expired_time ? new Date(expired_time) : null
    })
    
    return NextResponse.json({ 
      user: { ...user, password: undefined },
      message: 'User created successfully'
    })
  } catch (error: unknown) {
    console.error('Error creating user:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PUT /api/users - Update user
export async function PUT(request: NextRequest) {
  try {
    await ensureDatabase()
    
    // Check authentication
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { id, username, password, expired_time } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const user = await updateUser(id, {
      username,
      password,
      expired_time: expired_time === null ? null : (expired_time ? new Date(expired_time) : undefined)
    })
    
    return NextResponse.json({ 
      user: { ...user, password: undefined },
      message: 'User updated successfully'
    })
  } catch (error: unknown) {
    console.error('Error updating user:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users?id=123 - Delete user
export async function DELETE(request: NextRequest) {
  try {
    await ensureDatabase()
    
    // Check authentication
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const success = await deleteUser(parseInt(id))
    
    if (!success) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
