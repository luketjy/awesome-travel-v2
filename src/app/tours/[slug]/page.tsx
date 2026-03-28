export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createServerClient } from '@/lib/supabase/server'
import { TourDate } from '@/lib/types'
import { formatPrice, formatDate } from '@/lib/utils'
import ImageGallery from '@/components/tours/ImageGallery'

type Props = { params: Promise<{ slug: string }> }

const categoryLabels: Record<string, string> = {
  'island-hopping': 'Island Hopping',
  'city-tour': 'City Tour',
  'adventure': 'Adventure',
  'cultural': 'Cultural',
  'food-tour': 'Food Tour',
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: tour } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!tour) notFound()

  const { data: dates } = await supabase
    .from('tour_dates')
    .select('*')
    .eq('tour_id', tour.id)
    .eq('is_active', true)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date')

  const availableDates: TourDate[] = (dates ?? []).map((d) => ({
    ...d,
    available_spots: d.capacity - d.booked_pax,
  }))

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero image */}
        <div className="relative h-64 sm:h-80 bg-ocean-100 overflow-hidden">
          {tour.images[0] ? (
            <img src={tour.images[0]} alt={tour.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">🗺️</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 py-5 text-white">
            <span className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full mb-2 inline-block">
              {categoryLabels[tour.category] ?? tour.category}
            </span>
            <h1 className="text-3xl font-bold">{tour.name}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-6 text-sm text-gray-600">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Duration</p>
                <p className="font-semibold text-gray-800 mt-0.5">{tour.duration}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Price per pax</p>
                <p className="font-semibold text-ocean-600 text-lg mt-0.5">
                  {formatPrice(tour.price)}
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-gray-800 text-lg mb-2">About this tour</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {tour.description}
              </p>
            </div>

            {/* Image gallery */}
            {tour.images.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-800 text-lg mb-3">Photos</h2>
                <ImageGallery images={tour.images} tourName={tour.name} />
              </div>
            )}
          </div>

          {/* Booking panel */}
          <div className="lg:col-span-1 scroll-mt-24" id="book">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-24">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Select a Date</h2>

              {availableDates.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No available dates right now. Check back soon!
                </p>
              ) : (
                <div className="space-y-2">
                  {availableDates.map((d) => {
                    const isFull = (d.available_spots ?? 0) <= 0
                    const inner = (
                      <>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{formatDate(d.date)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {isFull ? 'Fully booked' : `${d.available_spots} spots left`}
                          </p>
                        </div>
                        {!isFull && (
                          <span className="text-ocean-500 text-sm font-semibold">Book →</span>
                        )}
                      </>
                    )
                    return isFull ? (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                      >
                        {inner}
                      </div>
                    ) : (
                      <Link
                        key={d.id}
                        href={`/booking?tourId=${tour.id}&dateId=${d.id}`}
                        className="flex items-center justify-between p-3 rounded-xl border border-ocean-200 hover:border-ocean-400 hover:bg-ocean-50 transition-all"
                      >
                        {inner}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
