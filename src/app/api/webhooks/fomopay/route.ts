import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getOrderById, isOrderPaidAtGateway } from '@/lib/fomopay/client'
import { verifyFomoWebhook } from '@/lib/fomopay/webhook'
import type { FomoWebhookPayload } from '@/lib/fomopay/types'
import { createInvoice } from '@/lib/invoice/create'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const auth =
    req.headers.get('x-fomopay-authorization') ??
    req.headers.get('X-FOMOPay-Authorization') ??
    req.headers.get('X-Fomopay-Authorization')

  const verified = verifyFomoWebhook(rawBody, auth)
  if (!verified.ok) {
    return Response.json({ error: verified.reason }, { status: 401 })
  }

  let payload: FomoWebhookPayload
  try {
    payload = JSON.parse(rawBody) as FomoWebhookPayload
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (!payload.orderId || !payload.orderNo) {
    return Response.json({ error: 'invalid_payload' }, { status: 400 })
  }

  let order
  try {
    order = await getOrderById(payload.orderId)
  } catch {
    return Response.json({ error: 'order_query_failed' }, { status: 502 })
  }

  if (order.orderNo !== payload.orderNo) {
    return Response.json({ error: 'order_mismatch' }, { status: 400 })
  }

  const bookingId = order.orderNo
  const saleSucceeded = await isOrderPaidAtGateway(order, payload.transactionId)

  const supabase = createServerClient()

  const updates: {
    fomo_order_id: string
    payment_status: string
    status?: string
  } = {
    fomo_order_id: order.id,
    payment_status: 'pending',
  }

  if (saleSucceeded) {
    updates.payment_status = 'paid'
    updates.status = 'confirmed'
  } else if (order.status === 'FAIL' || order.status === 'ERROR' || order.status === 'CLOSED') {
    updates.payment_status = 'failed'
  }

  const { data: updatedRows, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select('id')

  if (error) {
    console.error('[fomopay webhook] supabase update', error.message)
    return Response.json({ error: 'update_failed' }, { status: 500 })
  }

  if (!updatedRows?.length) {
    console.error(
      '[fomopay webhook] no booking matched id (check orderNo vs bookings.id):',
      bookingId
    )
    return Response.json({ error: 'booking_not_found' }, { status: 500 })
  }

  if (saleSucceeded) {
    // Fire-and-forget — do not let invoice errors fail the webhook response
    createInvoice(bookingId).catch((err) =>
      console.error('[fomopay webhook] createInvoice error', err)
    )
  }

  return new Response(null, { status: 200 })
}
