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
  'beach': 'Beach',
  'cruise': 'Cruise',
  'wildlife': 'Wildlife',
  'historical': 'Historical',
  'luxury': 'Luxury',
  'budget': 'Budget',
  'honeymoon': 'Honeymoon',
  'family': 'Family',
  'pilgrimage': 'Pilgrimage',
}

const difficultyLabels: Record<string, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  challenging: 'Challenging',
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  challenging: 'bg-red-100 text-red-700',
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

  const isWorldwide = tour.tour_type === 'worldwide'

  return (
    <>
      <Header />
      <main className="flex-1 bg-warm-50">
        {/* Hero image */}
        <div className="relative h-72 sm:h-96 bg-ocean-100 overflow-hidden">
          {tour.images[0] ? (
            <img src={tour.images[0]} alt={tour.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-ocean-100 to-ocean-200">🗺️</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-10 text-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <Link href="/tours" className="text-white/70 hover:text-white text-sm transition-colors">Tours</Link>
                <span className="text-white/40">/</span>
                <span className="text-white/90 text-sm">{tour.name}</span>
              </div>
              <span className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">
                {categoryLabels[tour.category] ?? tour.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-sm">{tour.name}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap gap-6 text-sm text-gray-600">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Duration</p>
                <p className="font-semibold text-gray-800 mt-0.5">{tour.duration}</p>
              </div>
              {isWorldwide && tour.destination && (
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Destination</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{tour.destination}</p>
                </div>
              )}
              {!isWorldwide && (
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Price per pax</p>
                  <p className="font-semibold text-ocean-600 text-lg mt-0.5">
                    {formatPrice(tour.price)}
                  </p>
                </div>
              )}
              {isWorldwide && tour.difficulty && (
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Difficulty</p>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-0.5 ${difficultyColors[tour.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                    {difficultyLabels[tour.difficulty] ?? tour.difficulty}
                  </span>
                </div>
              )}
              {isWorldwide && (tour.min_pax || tour.max_pax) && (
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">Group Size</p>
                  <p className="font-semibold text-gray-800 mt-0.5">
                    {tour.min_pax && tour.max_pax
                      ? `${tour.min_pax}–${tour.max_pax} pax`
                      : tour.min_pax
                      ? `Min ${tour.min_pax} pax`
                      : `Max ${tour.max_pax} pax`}
                  </p>
                </div>
              )}
            </div>

            {/* Suitability tags */}
            {isWorldwide && tour.suitability_tags && tour.suitability_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tour.suitability_tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-ocean-50 text-ocean-600 border border-ocean-100 px-3 py-1.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-3">About this {isWorldwide ? 'package' : 'tour'}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {tour.description}
              </p>
            </div>

            {/* Highlights */}
            {isWorldwide && tour.highlights && tour.highlights.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 text-lg mb-4">Highlights</h2>
                <ul className="space-y-3">
                  {tour.highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-ocean-50 text-ocean-500 mt-0.5 shrink-0 text-xs font-bold">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inclusions / Exclusions */}
            {isWorldwide && (tour.inclusions?.length || tour.exclusions?.length) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tour.inclusions && tour.inclusions.length > 0 && (
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                    <h3 className="font-semibold text-green-800 text-sm mb-3">Inclusions</h3>
                    <ul className="space-y-2">
                      {tour.inclusions.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-green-700 text-sm">
                          <span className="shrink-0 mt-0.5">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tour.exclusions && tour.exclusions.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                    <h3 className="font-semibold text-red-800 text-sm mb-3">Exclusions</h3>
                    <ul className="space-y-2">
                      {tour.exclusions.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-red-700 text-sm">
                          <span className="shrink-0 mt-0.5">✕</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {/* Image gallery */}
            {tour.images.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-800 text-lg mb-3">Photos</h2>
                <ImageGallery images={tour.images} tourName={tour.name} />
              </div>
            )}
          </div>

          {/* Booking / Enquiry panel */}
          <div className="lg:col-span-1 scroll-mt-24" id="book">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
              {tour.enquiry_only ? (
                /* Enquiry CTA */
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center mx-auto">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                      <path d="M4 6h20v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                      <path d="M4 6l10 9 10-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-base">Interested in this package?</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Contact us to customise your trip and get a detailed quote.
                    </p>
                  </div>
                  {isWorldwide && tour.pricing_options && (
                    <div className="bg-ocean-50 rounded-xl p-4 text-left space-y-2">
                      <p className="text-xs font-semibold text-ocean-600 uppercase tracking-wide mb-2">Pricing (per pax)</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Twin Sharing</span>
                        <span className="font-semibold text-gray-800">{formatPrice(tour.pricing_options.twin_sharing)}</span>
                      </div>
                      {tour.pricing_options.single_supplement != null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Single Supplement</span>
                          <span className="font-semibold text-gray-800">+{formatPrice(tour.pricing_options.single_supplement)}</span>
                        </div>
                      )}
                      {tour.pricing_options.child_rate != null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Child Rate</span>
                          <span className="font-semibold text-gray-800">{formatPrice(tour.pricing_options.child_rate)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <Link
                    href="/contact"
                    className="block w-full bg-ocean-500 hover:bg-ocean-600 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-all text-center hover:shadow-md active:scale-[0.98]"
                  >
                    Contact Us to Book
                  </Link>
                </div>
              ) : (
                /* Date booking panel */
                <>
                  {isWorldwide && tour.pricing_options && (
                    <div className="bg-ocean-50 rounded-xl p-4 mb-5 space-y-2">
                      <p className="text-xs font-semibold text-ocean-600 uppercase tracking-wide mb-2">Pricing (per pax)</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Twin Sharing</span>
                        <span className="font-semibold text-gray-800">{formatPrice(tour.pricing_options.twin_sharing)}</span>
                      </div>
                      {tour.pricing_options.single_supplement != null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Single Supplement</span>
                          <span className="font-semibold text-gray-800">+{formatPrice(tour.pricing_options.single_supplement)}</span>
                        </div>
                      )}
                      {tour.pricing_options.child_rate != null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Child Rate</span>
                          <span className="font-semibold text-gray-800">{formatPrice(tour.pricing_options.child_rate)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <h2 className="font-bold text-gray-800 text-lg mb-4">Select a Date</h2>

                  {availableDates.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-sm">
                        No available dates right now.
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Check back soon!</p>
                    </div>
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
                              <span className="text-ocean-500 text-sm font-semibold group-hover:translate-x-0.5 transition-transform">Book →</span>
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
                            className="group flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-ocean-400 hover:bg-ocean-50 transition-all"
                          >
                            {inner}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Itinerary — full width below grid */}
        {isWorldwide && tour.itinerary && tour.itinerary.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 pb-16">
            <h2 className="font-bold text-gray-800 text-2xl mb-8">Day-by-Day Itinerary</h2>
            <div className="space-y-0">
              {tour.itinerary.map((day: { day: number; title: string; description: string }, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-ocean-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {day.day}
                    </div>
                    {i < tour.itinerary!.length - 1 && (
                      <div className="w-0.5 flex-1 bg-ocean-100 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="font-semibold text-gray-800 mt-2">{day.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{day.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
