import { NextRequest } from 'next/server'
import { generateSessionToken } from '@/lib/auth'

const SESSION_COOKIE = 'admin_session'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Invalid password' }, { status: 401 })
  }

  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    return Response.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const token = await generateSessionToken(secret)

  const response = Response.json({ ok: true })
  const headers = new Headers(response.headers)
  headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`
  )

  return new Response(response.body, {
    status: 200,
    headers,
  })
}
