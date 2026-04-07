import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { ids } = body

  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
    return Response.json({ error: 'ids must be an array of strings' }, { status: 400 })
  }

  const supabase = createServerClient()

  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from('tours')
      .update({ sort_order: i })
      .eq('id', ids[i])

    if (error) return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
