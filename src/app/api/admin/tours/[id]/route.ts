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
  const {
    name, description, price, category, duration, images, is_active,
    tour_type, destination, highlights, inclusions, exclusions,
    itinerary, difficulty, min_pax, max_pax, pricing_options,
    suitability_tags, enquiry_only,
  } = body

  const updates: Record<string, unknown> = {
    description,
    price: price !== undefined ? Number(price) : undefined,
    category,
    duration,
    images,
    is_active,
    updated_at: new Date().toISOString(),
    tour_type,
    destination,
    highlights,
    inclusions,
    exclusions,
    itinerary,
    difficulty,
    min_pax: min_pax !== undefined ? (min_pax ? Number(min_pax) : null) : undefined,
    max_pax: max_pax !== undefined ? (max_pax ? Number(max_pax) : null) : undefined,
    pricing_options,
    suitability_tags,
    enquiry_only,
  }

  if (name) {
    updates.name = name
    updates.slug = slugify(name)
  }

  // Remove keys that were not sent (undefined), but keep null values to allow clearing fields
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

    // Get booking IDs so we can delete dependent invoices first
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .in('tour_date_id', dateIds)

    if (bookings && bookings.length > 0) {
      const bookingIds = bookings.map((b) => b.id)

      // Delete invoices before bookings (FK constraint)
      const { error: invoicesErr } = await supabase
        .from('invoices')
        .delete()
        .in('booking_id', bookingIds)

      if (invoicesErr) return Response.json({ error: invoicesErr.message }, { status: 500 })
    }

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
