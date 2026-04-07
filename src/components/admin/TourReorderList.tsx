'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Tour } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import DeleteTourButton from '@/components/admin/DeleteTourButton'

export default function TourReorderList({ initialTours }: { initialTours: Tour[] }) {
  const [tours, setTours] = useState(initialTours)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragId = useRef<string | null>(null)

  async function handleDrop(targetId: string) {
    setDragOverId(null)
    if (!dragId.current || dragId.current === targetId) return

    const from = tours.findIndex((t) => t.id === dragId.current)
    const to = tours.findIndex((t) => t.id === targetId)
    if (from === -1 || to === -1) return

    const reordered = [...tours]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setTours(reordered)

    setStatus('saving')
    const res = await fetch('/api/admin/tours/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((t) => t.id) }),
    })
    if (res.ok) {
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } else {
      setStatus('idle')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 min-h-[24px]">
        <p className="text-xs text-gray-400">Drag rows to reorder. Order here controls what appears first on the main page.</p>
        {status === 'saving' && <span className="text-xs text-gray-400">Saving…</span>}
        {status === 'saved' && <span className="text-xs text-green-600">Saved</span>}
      </div>

      <div className="space-y-3">
        {tours.map((tour) => (
          <div
            key={tour.id}
            draggable
            onDragStart={() => { dragId.current = tour.id }}
            onDragEnd={() => setDragOverId(null)}
            onDragOver={(e) => { e.preventDefault(); setDragOverId(tour.id) }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={() => handleDrop(tour.id)}
            className={`bg-white rounded-xl border px-5 py-4 flex items-center justify-between transition-colors cursor-grab active:cursor-grabbing active:opacity-50 ${
              dragOverId === tour.id
                ? 'border-ocean-400 bg-ocean-50'
                : 'border-gray-200 hover:border-ocean-300'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* drag handle */}
              <svg className="text-gray-300 shrink-0 select-none" width="14" height="20" viewBox="0 0 14 20" fill="currentColor" aria-hidden="true">
                <circle cx="4" cy="4" r="1.5" />
                <circle cx="10" cy="4" r="1.5" />
                <circle cx="4" cy="10" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="4" cy="16" r="1.5" />
                <circle cx="10" cy="16" r="1.5" />
              </svg>

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
                  {tour.tour_type === 'worldwide' && (
                    <span className="inline-block text-xs bg-coral-100 text-coral-700 px-1.5 py-0.5 rounded mr-1.5 font-medium">
                      Worldwide
                    </span>
                  )}
                  {tour.category} · {tour.duration} · {formatPrice(tour.price)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  tour.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
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
    </div>
  )
}
