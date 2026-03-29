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

function IconMapPin() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="20" r="8" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 8C16.27 8 10 14.27 10 22c0 11.25 14 26 14 26s14-14.75 14-26C38 14.27 31.73 8 24 8z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 4.5V7l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function TourCard({ tour }: Props) {
  return (
    <Link href={`/tours/${tour.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-ocean-200 transition-all duration-200">
        <div className="relative h-48 overflow-hidden bg-ocean-50">
          {tour.images[0] ? (
            <img
              src={tour.images[0]}
              alt={tour.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ocean-200">
              <IconMapPin />
            </div>
          )}
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-ocean-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {categoryLabels[tour.category] ?? tour.category}
          </span>
          {tour.tour_type === 'worldwide' && tour.destination && (
            <span className="absolute top-3 right-3 bg-coral-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {tour.destination}
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-base group-hover:text-ocean-600 transition-colors line-clamp-1">
            {tour.name}
          </h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-relaxed">{tour.description}</p>

          {tour.suitability_tags && tour.suitability_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tour.suitability_tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs bg-ocean-50 text-ocean-600 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-400">From</p>
              <p className="font-bold text-ocean-600 text-lg">{formatPrice(tour.price)}</p>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <IconClock />
              <span className="text-sm font-medium">{tour.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
