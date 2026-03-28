import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tourDateId, customerName, customerEmail, customerPhone, numPax } = body

  if (!tourDateId || !customerName || !customerEmail || !customerPhone || !numPax) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (typeof numPax !== 'number' || numPax < 1) {
    return Response.json({ error: 'Invalid number of guests' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Fetch the date with its tour price
  const { data: dateRow, error: dateErr } = await supabase
    .from('tour_dates')
    .select('*, tour:tours(price)')
    .eq('id', tourDateId)
    .single()

  if (dateErr || !dateRow) {
    return Response.json({ error: 'Tour date not found' }, { status: 404 })
  }

  if (!dateRow.is_active) {
    return Response.json({ error: 'This date is no longer available' }, { status: 409 })
  }

  const availableSpots = dateRow.capacity - dateRow.booked_pax
  if (numPax > availableSpots) {
    return Response.json(
      { error: `Only ${availableSpots} spot(s) available` },
      { status: 409 }
    )
  }

  const tourPrice = (dateRow.tour as { price: number } | null)?.price ?? 0
  const totalPrice = tourPrice * numPax

  // Use the atomic RPC
  const { data, error } = await supabase.rpc('create_booking', {
    p_tour_date_id: tourDateId,
    p_customer_name: customerName,
    p_customer_email: customerEmail,
    p_customer_phone: customerPhone,
    p_num_pax: numPax,
    p_total_price: totalPrice,
  })

  if (error) {
    if (error.message.includes('INSUFFICIENT_CAPACITY')) {
      return Response.json({ error: 'Not enough spots available' }, { status: 409 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ bookingId: data }, { status: 201 })
}
