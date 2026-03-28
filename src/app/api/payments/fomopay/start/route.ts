import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getPublicAppUrl, isFomoPayConfigured } from '@/lib/fomopay/config'
import { createOrResumeHostedOrder, FomoPayApiError, getOrderById } from '@/lib/fomopay/client'

export const dynamic = 'force-dynamic'

function truncateSubject(s: string, max = 64): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1) + '…'
}

export async function POST(req: NextRequest) {
  if (!isFomoPayConfigured()) {
    return Response.json({ error: 'Payment is not configured' }, { status: 503 })
  }

  let body: { bookingId?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const bookingId = body.bookingId?.trim()
  if (!bookingId) {
    return Response.json({ error: 'bookingId is required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select(
      `
      *,
      tour_date:tour_dates ( tour:tours ( name ) )
    `
    )
    .eq('id', bookingId)
    .single()

  if (fetchErr) {
    if (fetchErr.code === 'PGRST116') {
      return Response.json({ error: 'Booking not found' }, { status: 404 })
    }
    return Response.json(
      { error: 'Could not load booking', detail: fetchErr.message },
      { status: 500 }
    )
  }
  if (!booking) {
    return Response.json({ error: 'Booking not found' }, { status: 404 })
  }

  const payStatus = (booking as { payment_status?: string }).payment_status ?? 'unpaid'
  if (payStatus === 'paid') {
    return Response.json({ error: 'This booking is already paid' }, { status: 409 })
  }

  const base = getPublicAppUrl()
  const notifyUrl = `${base}/api/webhooks/fomopay`
  const returnUrl = `${base}/booking/payment/return?bookingId=${encodeURIComponent(bookingId)}`
  const backUrl = `${base}/booking/confirmation?bookingId=${encodeURIComponent(bookingId)}`

  const tourName =
    (booking as { tour_date?: { tour?: { name?: string } } }).tour_date?.tour?.name ?? 'Tour'
  const subject = truncateSubject(`${tourName} — booking ${bookingId.slice(0, 8)}`)

  const totalPrice = Number((booking as { total_price: number }).total_price)
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    return Response.json({ error: 'Invalid booking amount' }, { status: 400 })
  }

  const amount = totalPrice.toFixed(2)

  const existingFomoId = (booking as { fomo_order_id?: string | null }).fomo_order_id
  if (existingFomoId && payStatus === 'pending') {
    try {
      const existing = await getOrderById(existingFomoId)
      if (existing.status === 'SUCCESS') {
        await supabase
          .from('bookings')
          .update({ payment_status: 'paid', status: 'confirmed', fomo_order_id: existing.id })
          .eq('id', bookingId)
        return Response.json({ paid: true })
      }
      if (existing.status === 'CREATED' && existing.url) {
        return Response.json({ redirectUrl: existing.url })
      }
    } catch {
      // fall through and create a new hosted session
    }
  }

  const orderBody = {
    mode: 'HOSTED',
    orderNo: bookingId,
    subject,
    description: `Booking ${bookingId}`,
    amount,
    currencyCode: 'SGD',
    notifyUrl,
    returnUrl,
    backUrl,
  }

  try {
    const created = await createOrResumeHostedOrder(orderBody)
    const { error: updErr } = await supabase
      .from('bookings')
      .update({ fomo_order_id: created.id, payment_status: 'pending' })
      .eq('id', bookingId)

    if (updErr) {
      console.error('[fomopay/start] could not save gateway ids:', updErr.message)
    }

    return Response.json({ redirectUrl: created.url })
  } catch (e) {
    if (e instanceof FomoPayApiError) {
      return Response.json(
        { error: e.message, detail: e.body },
        { status: e.status >= 400 && e.status < 600 ? e.status : 502 }
      )
    }
    throw e
  }
}
