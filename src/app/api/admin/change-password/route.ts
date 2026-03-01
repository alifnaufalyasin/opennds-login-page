import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername, updateUser } from '@/lib/users'
import { verifyAdminToken } from '@/lib/auth'
import { initDatabase } from '@/lib/db'

// Initialize database on first request
let dbInitialized = false

async function ensureDatabase() {
  if (!dbInitialized) {
    await initDatabase()
    dbInitialized = true
  }
}

// POST /api/admin/change-password - Change admin password
export async function POST(request: NextRequest) {
  try {
    await ensureDatabase()
    
    // Verify admin token
    const token = request.cookies.get('admin-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const payload = await verifyAdminToken(token)
    if (!payload || payload.username !== 'admin') {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { newPassword } = body
    
    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: 'New password must be at least 4 characters' },
        { status: 400 }
      )
    }
    
    // Get admin user
    const user = await getUserByUsername('admin')
    if (!user) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }
    
    // Update password (no old password verification required)
    await updateUser(user.id, {
      password: newPassword
    })
    
    return NextResponse.json({ 
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Error changing admin password:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
