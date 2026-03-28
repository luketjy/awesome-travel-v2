export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createServerClient } from '@/lib/supabase/server'
import { isFomoPayConfigured } from '@/lib/fomopay/config'
import {
  isOrderPaidAtGateway,
  resolveOrderForBooking,
} from '@/lib/fomopay/client'
import ReturnPageRefresh from '@/components/booking/ReturnPageRefresh'

interface PageProps {
  searchParams: Promise<{ bookingId?: string }>
}

export default async function PaymentReturnPage({ searchParams }: PageProps) {
  const { bookingId } = await searchParams
  if (!bookingId) redirect('/tours')

  const supabase = createServerClient()

  let booking = (
    await supabase
      .from('bookings')
      .select(
        `
        *,
        tour_date:tour_dates ( tour:tours ( name ) )
      `
      )
      .eq('id', bookingId)
      .single()
  ).data

  if (!booking) redirect('/tours')

  const fomoId = (booking as { fomo_order_id?: string | null }).fomo_order_id
  const payStatus = (booking as { payment_status?: string }).payment_status ?? 'unpaid'

  if (isFomoPayConfigured() && payStatus !== 'paid') {
    try {
      const order = await resolveOrderForBooking(bookingId, fomoId)

      if (order) {
        const treatAsPaid = await isOrderPaidAtGateway(order)

        if (treatAsPaid) {
          await supabase
            .from('bookings')
            .update({
              fomo_order_id: order.id,
              payment_status: 'paid',
              status: 'confirmed',
            })
            .eq('id', bookingId)
        } else if (
          order.status === 'FAIL' ||
          order.status === 'ERROR' ||
          order.status === 'CLOSED'
        ) {
          await supabase
            .from('bookings')
            .update({ fomo_order_id: order.id, payment_status: 'failed' })
            .eq('id', bookingId)
        }
      }
    } catch {
      // keep DB state; webhook may update later
    }

    const { data: refreshed } = await supabase
      .from('bookings')
      .select('payment_status, fomo_order_id')
      .eq('id', bookingId)
      .single()
    if (refreshed) {
      booking = {
        ...booking,
        payment_status: refreshed.payment_status,
        fomo_order_id: refreshed.fomo_order_id,
      }
    }
  }

  const finalPay = (booking as { payment_status?: string }).payment_status ?? 'unpaid'
  const tourName =
    (booking as { tour_date?: { tour?: { name?: string } } }).tour_date?.tour?.name ?? 'your tour'

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          {finalPay === 'paid' ? (
            <>
              <div className="text-5xl mb-4">✓</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment successful</h1>
              <p className="text-gray-600 mb-8">
                Thank you! Your payment for {tourName} is confirmed.
              </p>
            </>
          ) : finalPay === 'failed' ? (
            <>
              <div className="text-5xl mb-4">✕</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment did not complete</h1>
              <p className="text-gray-600 mb-8">
                The payment was cancelled or declined. You can try again from your booking summary.
              </p>
            </>
          ) : (
            <>
              <ReturnPageRefresh />
              <div className="text-5xl mb-4">…</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing payment</h1>
              <p className="text-gray-600 mb-6">
                Your bank or wallet may still be confirming the payment. This page refreshes every few
                seconds for up to two minutes. You can also open your booking summary — it will update
                when we receive confirmation from the payment gateway.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                In UAT / sandbox, status can lag on FOMO Pay&apos;s side. If it never clears, confirm
                your app uses the same environment as your credentials (set{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">FOMO_PAY_API_BASE</code> if FOMO gave
                you a separate test host) and that your public site URL matches where you are testing.
              </p>
            </>
          )}

          <Link
            href={`/booking/confirmation?bookingId=${encodeURIComponent(bookingId)}`}
            className="inline-block w-full bg-ocean-600 hover:bg-ocean-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Back to booking summary
          </Link>

          <Link href="/tours" className="block mt-4 text-ocean-600 hover:text-ocean-700 text-sm font-medium">
            Browse more tours
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
