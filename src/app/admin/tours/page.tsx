export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Tour } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import DeleteTourButton from '@/components/admin/DeleteTourButton'

async function getTours(): Promise<Tour[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false })
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
        <div className="space-y-3">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between hover:border-ocean-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                {tour.images[0] ? (
                  <img
                    src={tour.images[0]}
                    alt={tour.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-ocean-50 flex items-center justify-center text-2xl shrink-0">
                    🗺️
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{tour.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {tour.category} · {tour.duration} · {formatPrice(tour.price)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    tour.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tour.is_active ? 'Active' : 'Inactive'}
                </span>
                <Link
                  href={`/admin/tours/${tour.id}/dates`}
                  className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
                >
                  Dates
                </Link>
                <Link
                  href={`/admin/tours/${tour.id}`}
                  className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
                >
                  Edit
                </Link>
                <DeleteTourButton tourId={tour.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
