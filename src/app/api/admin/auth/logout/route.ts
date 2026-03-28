const SESSION_COOKIE = 'admin_session'

export async function POST() {
  const headers = new Headers()
  headers.set(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`
  )
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
}
