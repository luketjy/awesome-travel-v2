import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const supabase = createServerClient()
  const { data, error } = await supabase.from('tours').select('*').eq('id', id).single()
  if (error) return Response.json({ error: error.message }, { status: 404 })
  return Response.json(data)
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const body = await req.json()
  const { name, description, price, category, duration, images, is_active } = body

  const updates: Record<string, unknown> = {
    description,
    price: price !== undefined ? Number(price) : undefined,
    category,
    duration,
    images,
    is_active,
    updated_at: new Date().toISOString(),
  }

  if (name) {
    updates.name = name
    updates.slug = slugify(name)
  }

  // Remove undefined keys
  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k])

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('tours')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const supabase = createServerClient()

  // Get all date IDs for this tour
  const { data: dates } = await supabase
    .from('tour_dates')
    .select('id')
    .eq('tour_id', id)

  if (dates && dates.length > 0) {
    const dateIds = dates.map((d) => d.id)

    // Delete bookings linked to those dates
    const { error: bookingsErr } = await supabase
      .from('bookings')
      .delete()
      .in('tour_date_id', dateIds)

    if (bookingsErr) return Response.json({ error: bookingsErr.message }, { status: 500 })
  }

  // Delete the tour (cascade deletes tour_dates)
  const { error } = await supabase.from('tours').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true })
}
