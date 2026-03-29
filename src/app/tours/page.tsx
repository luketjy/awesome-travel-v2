export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TourCard from '@/components/tours/TourCard'
import TourFilters from '@/components/tours/TourFilters'
import { createServerClient } from '@/lib/supabase/server'
import { Tour } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ category?: string; price?: string; type?: string; destination?: string }>
}

async function getTours(category?: string, price?: string, type?: string, destination?: string): Promise<Tour[]> {
  const supabase = createServerClient()
  let query = supabase.from('tours').select('*').eq('is_active', true)

  if (category) query = query.eq('category', category)

  if (price) {
    const [min, max] = price.split('-').map(Number)
    query = query.gte('price', min).lte('price', max)
  }

  if (type === 'local') {
    query = query.or('tour_type.eq.local,tour_type.is.null')
  } else if (type === 'worldwide') {
    query = query.eq('tour_type', 'worldwide')
  }

  if (destination) {
    query = query.ilike('destination', `%${destination}%`)
  }

  const { data } = await query.order('name')
  return data ?? []
}

const tabs = [
  { label: 'All', value: '' },
  { label: 'Local Tours', value: 'local' },
  { label: 'Worldwide Packages', value: 'worldwide' },
]

export default async function ToursPage({ searchParams }: PageProps) {
  const { category, price, type, destination } = await searchParams
  const tours = await getTours(category, price, type, destination)

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-ocean-700 via-ocean-600 to-teal-500 text-white py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-ocean-200 text-sm font-semibold uppercase tracking-widest mb-2">Singapore &amp; Worldwide</p>
            <h1 className="text-4xl font-bold mb-2">All Tours &amp; Packages</h1>
            <p className="text-ocean-100 text-lg">Find and book your perfect experience</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Type tabs */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => {
              const isActive = (type ?? '') === tab.value
              const params = new URLSearchParams()
              if (tab.value) params.set('type', tab.value)
              return (
                <Link
                  key={tab.value}
                  href={`/tours${params.toString() ? `?${params.toString()}` : ''}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-ocean-500 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-ocean-300 hover:text-ocean-600'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>

          <Suspense>
            <TourFilters />
          </Suspense>

          {tours.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4" aria-hidden="true">
                <circle cx="21" cy="21" r="13" stroke="currentColor" strokeWidth="2.5" />
                <path d="M31 31l9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <p className="font-medium text-gray-600">No tours match your filters.</p>
              <p className="text-sm mt-1">Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
