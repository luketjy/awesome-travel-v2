'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { TOUR_CATEGORIES } from '@/lib/types'

const PRICE_RANGES = [
  { label: 'Any price', value: '' },
  { label: 'Under $50', value: '0-50' },
  { label: '$50 – $100', value: '50-100' },
  { label: '$100 – $200', value: '100-200' },
  { label: '$200+', value: '200-99999' },
]

export default function TourFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') ?? ''
  const currentPrice = searchParams.get('price') ?? ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const hasFilters = currentCategory || currentPrice

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-40">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
        <select
          value={currentCategory}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500"
        >
          <option value="">All categories</option>
          {TOUR_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-40">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Price range</label>
        <select
          value={currentPrice}
          onChange={(e) => updateFilter('price', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500"
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={() => {
            router.push(pathname)
          }}
          className="text-sm text-ocean-600 hover:text-ocean-700 font-medium py-2"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
