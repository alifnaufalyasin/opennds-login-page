import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'

// GET /api/admin/verify - Verify admin token
export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  
  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
  
  const payload = await verifyAdminToken(token)
  
  if (!payload) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
  
  return NextResponse.json({ 
    authenticated: true,
    user: { username: payload.username }
  })
}
