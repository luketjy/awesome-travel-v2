export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Tour } from '@/lib/types'
import TourReorderList from '@/components/admin/TourReorderList'

async function getTours(): Promise<Tour[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('tours')
    .select('*')
    .order('sort_order', { ascending: true })
  return data ?? []
}

export default async function AdminToursPage() {
  const tours = await getTours()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tours</h1>
        <Link
          href="/admin/tours/new"
          className="bg-ocean-500 hover:bg-ocean-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
        >
          + New Tour
        </Link>
      </div>

      {tours.length === 0 ? (
        <p className="text-gray-500">No tours yet. Create your first one!</p>
      ) : (
        <TourReorderList initialTours={tours} />
      )}
    </div>
  )
}
