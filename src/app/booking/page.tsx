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
      <main className="flex-1 bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Book Your Tour</h1>
          <p className="text-gray-500 text-sm mb-8">
            Fill in your details and confirm your booking.
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <BookingForm tour={tour} tourDate={tourDateWithSpots} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
