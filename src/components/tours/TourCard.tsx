import Link from 'next/link'
import { Tour } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

interface Props {
  tour: Tour
}

const categoryLabels: Record<string, string> = {
  'island-hopping': 'Island Hopping',
  'city-tour': 'City Tour',
  'adventure': 'Adventure',
  'cultural': 'Cultural',
  'food-tour': 'Food Tour',
}

export default function TourCard({ tour }: Props) {
  return (
    <Link href={`/tours/${tour.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-ocean-200 transition-all">
        <div className="relative h-48 overflow-hidden bg-ocean-50">
          {tour.images[0] ? (
            <img
              src={tour.images[0]}
              alt={tour.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🗺️</div>
          )}
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-ocean-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {categoryLabels[tour.category] ?? tour.category}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-base group-hover:text-ocean-600 transition-colors line-clamp-1">
            {tour.name}
          </h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{tour.description}</p>

          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-xs text-gray-400">From</p>
              <p className="font-bold text-ocean-600 text-lg">{formatPrice(tour.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-sm font-medium text-gray-700">{tour.duration}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
