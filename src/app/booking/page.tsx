export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BookingForm from '@/components/booking/BookingForm'
import { createServerClient } from '@/lib/supabase/server'

interface PageProps {
  searchParams: Promise<{ tourId?: string; dateId?: string }>
}

export default async function BookingPage({ searchParams }: PageProps) {
  const { tourId, dateId } = await searchParams

  if (!tourId || !dateId) redirect('/tours')

  const supabase = createServerClient()

  const [{ data: tour }, { data: tourDate }] = await Promise.all([
    supabase.from('tours').select('*').eq('id', tourId).eq('is_active', true).single(),
    supabase.from('tour_dates').select('*').eq('id', dateId).eq('tour_id', tourId).single(),
  ])

  if (!tour || !tourDate) notFound()

  const tourDateWithSpots = {
    ...tourDate,
    available_spots: tourDate.capacity - tourDate.booked_pax,
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-warm-50">
        {/* Slim header strip */}
        <div className="bg-gradient-to-r from-ocean-700 to-ocean-600 text-white py-6 px-4">
          <div className="max-w-lg mx-auto">
            <p className="text-ocean-200 text-xs font-semibold uppercase tracking-widest mb-1">Booking</p>
            <h1 className="text-xl font-bold">Book Your Tour</h1>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-ocean-500 text-white text-xs font-bold flex items-center justify-center">1</span>
              <span className="text-sm font-medium text-ocean-600">Details</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">2</span>
              <span className="text-sm font-medium text-gray-400">Confirm</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-bold flex items-center justify-center">3</span>
              <span className="text-sm font-medium text-gray-400">Pay</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <BookingForm tour={tour} tourDate={tourDateWithSpots} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
