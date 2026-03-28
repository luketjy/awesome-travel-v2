export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createServerClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import FomoPayButton from '@/components/booking/FomoPayButton'
import { isFomoPayConfigured } from '@/lib/fomopay/config'

interface PageProps {
  searchParams: Promise<{ bookingId?: string }>
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { bookingId } = await searchParams
  if (!bookingId) redirect('/tours')

  const supabase = createServerClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      tour_date:tour_dates (
        date,
        tour:tours ( name, duration )
      )
    `)
    .eq('id', bookingId)
    .single()

  if (!booking) redirect('/tours')

  const tourDate = booking.tour_date as { date: string; tour: { name: string; duration: string } } | null
  const paymentStatus = (booking as { payment_status?: string }).payment_status ?? 'unpaid'
  const payConfigured = isFomoPayConfigured()
  const isPaid = paymentStatus === 'paid'

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isPaid ? 'Booking confirmed' : 'Booking saved'}
          </h1>
          <p className="text-gray-500 mb-8">
            Thank you, {booking.customer_name}!
            {isPaid
              ? ' Your tour is booked and paid for.'
              : ' Complete payment below to secure your spot.'}
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left space-y-4 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-mono text-gray-700 text-xs">{booking.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tour</span>
              <span className="font-semibold text-gray-800">{tourDate?.tour?.name ?? '—'}</span>
            </div>
            {tourDate?.date && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="text-gray-800">{formatDate(tourDate.date)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Guests</span>
              <span className="text-gray-800">{booking.num_pax} pax</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-100 pt-3 mt-3">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="font-bold text-ocean-600 text-lg">
                {formatPrice(booking.total_price)}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <FomoPayButton
              bookingId={booking.id}
              paid={isPaid}
              configured={payConfigured}
            />
          </div>

          <Link href="/tours" className="text-ocean-600 hover:text-ocean-700 text-sm font-medium">
            ← Browse more tours
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
