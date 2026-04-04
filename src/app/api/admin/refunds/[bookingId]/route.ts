import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import {
  resolveOrderForBooking,
  createRefundTransaction,
  getTransaction,
  listOrderTransactions,
  FomoPayApiError,
} from '@/lib/fomopay/client'
import type { FomoRefundRequest } from '@/lib/fomopay/types'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await ctx.params

  const supabase = createServerClient()
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, payment_status, fomo_order_id, total_price')
    .eq('id', bookingId)
    .single()

  if (fetchErr || !booking) {
    return Response.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (booking.payment_status !== 'paid') {
    return Response.json(
      { error: `Cannot refund a booking with status '${booking.payment_status}'` },
      { status: 409 }
    )
  }

  const order = await resolveOrderForBooking(bookingId, booking.fomo_order_id)
  if (!order) {
    return Response.json({ error: 'No FomoPay order found for this booking' }, { status: 404 })
  }

  // Allow partial refund amount via request body; default to full booking amount
  let refundAmount: string
  try {
    const body = await req.json().catch(() => ({})) as { amount?: string }
    if (body.amount) {
      const parsed = parseFloat(body.amount)
      if (!isFinite(parsed) || parsed <= 0) {
        return Response.json({ error: 'Invalid amount' }, { status: 400 })
      }
      refundAmount = parsed.toFixed(2)
    } else {
      refundAmount = parseFloat(String(booking.total_price)).toFixed(2)
    }
  } catch {
    refundAmount = parseFloat(String(booking.total_price)).toFixed(2)
  }

  const transactionNo = `REFUND-${bookingId.slice(0, 8)}-${Date.now()}`

  const refundBody: FomoRefundRequest = {
    type: 'REFUND',
    transactionNo,
    amount: refundAmount,
    currencyCode: 'SGD',
    subject: `Refund for booking ${bookingId.slice(0, 8)}`,
  }

  try {
    const refund = await createRefundTransaction(order.id, refundBody)

    // Verify the refund transaction status
    let refundStatus = refund.status
    if (refundStatus !== 'SUCCESS' && refundStatus !== 'CREATED') {
      return Response.json(
        { error: `Refund created but status is ${refundStatus}`, refund },
        { status: 502 }
      )
    }

    // Query the transaction for final status if needed
    if (refundStatus === 'SUCCESS' || refund.id) {
      try {
        const tx = await getTransaction(order.id, refund.id)
        refundStatus = tx.status
      } catch {
        // use the status from creation response
      }
    }

    // Update booking status
    const paymentStatus = refundStatus === 'SUCCESS' ? 'refunded' : 'pending_refund'
    await supabase
      .from('bookings')
      .update({ payment_status: paymentStatus })
      .eq('id', bookingId)

    return Response.json({
      refundId: refund.id,
      transactionNo: refund.transactionNo,
      amount: refund.amount,
      status: refundStatus,
      paymentStatus,
    })
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

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await ctx.params

  const supabase = createServerClient()
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, fomo_order_id, payment_status')
    .eq('id', bookingId)
    .single()

  if (fetchErr || !booking) {
    return Response.json({ error: 'Booking not found' }, { status: 404 })
  }

  const order = await resolveOrderForBooking(bookingId, booking.fomo_order_id)
  if (!order) {
    return Response.json({ error: 'No FomoPay order found' }, { status: 404 })
  }

  // Return the refund transaction(s) for this order
  const refunds = await listOrderTransactions(order.id, { type: 'REFUND' })

  return Response.json({ orderId: order.id, orderStatus: order.status, refunds })
}
