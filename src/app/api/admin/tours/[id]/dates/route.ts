import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('tour_dates')
    .select('*')
    .eq('tour_id', id)
    .order('date', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const { date, capacity } = await req.json()

  if (!date || !capacity) {
    return Response.json({ error: 'Missing date or capacity' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('tour_dates')
    .insert({ tour_id: id, date, capacity: Number(capacity) })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { id: tourId } = await ctx.params
  const { searchParams } = new URL(req.url)
  const dateId = searchParams.get('dateId')

  if (!dateId) {
    return Response.json({ error: 'Missing dateId' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Prevent deletion if bookings exist
  const { data: dateRow } = await supabase
    .from('tour_dates')
    .select('booked_pax')
    .eq('id', dateId)
    .eq('tour_id', tourId)
    .single()

  if (dateRow && dateRow.booked_pax > 0) {
    return Response.json(
      { error: 'Cannot delete a date that already has bookings' },
      { status: 409 }
    )
  }

  const { error } = await supabase
    .from('tour_dates')
    .delete()
    .eq('id', dateId)
    .eq('tour_id', tourId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
