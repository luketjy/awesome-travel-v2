import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/auth'

const SESSION_COOKIE = 'admin_session'

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) return false
  return verifySessionToken(token, secret)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminPage = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'
  const isAdminApi = pathname.startsWith('/api/admin')
  const isAuthApi = pathname.startsWith('/api/admin/auth')

  if (isAdminPage && !isLoginPage) {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    if (!(await isValidSession(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  if (isAdminApi && !isAuthApi) {
    const token = request.cookies.get(SESSION_COOKIE)?.value
    if (!(await isValidSession(token))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
