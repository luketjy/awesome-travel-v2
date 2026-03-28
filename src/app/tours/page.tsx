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
        <div className="bg-gradient-to-r from-ocean-600 to-teal-400 text-white py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-1">All Tours</h1>
            <p className="text-ocean-100">Find and book your perfect experience</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <Suspense>
            <TourFilters />
          </Suspense>

          {tours.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-medium">No tours match your filters.</p>
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
