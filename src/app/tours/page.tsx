export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TourCard from '@/components/tours/TourCard'
import TourFilters from '@/components/tours/TourFilters'
import { createServerClient } from '@/lib/supabase/server'
import { Tour } from '@/lib/types'

interface PageProps {
  searchParams: Promise<{ category?: string; price?: string }>
}

async function getTours(category?: string, price?: string): Promise<Tour[]> {
  const supabase = createServerClient()
  let query = supabase.from('tours').select('*').eq('is_active', true)

  if (category) query = query.eq('category', category)

  if (price) {
    const [min, max] = price.split('-').map(Number)
    query = query.gte('price', min).lte('price', max)
  }

  const { data } = await query.order('name')
  return data ?? []
}

export default async function ToursPage({ searchParams }: PageProps) {
  const { category, price } = await searchParams
  const tours = await getTours(category, price)

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-ocean-700 via-ocean-600 to-teal-500 text-white py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-ocean-200 text-sm font-semibold uppercase tracking-widest mb-2">Singapore &amp; Beyond</p>
            <h1 className="text-4xl font-bold mb-2">All Tours</h1>
            <p className="text-ocean-100 text-lg">Find and book your perfect experience</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
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
