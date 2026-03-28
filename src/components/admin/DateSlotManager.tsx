'use client'

import { useState, useEffect, useCallback } from 'react'
import { TourDate } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface Props {
  tourId: string
}

export default function DateSlotManager({ tourId }: Props) {
  const [dates, setDates] = useState<TourDate[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ date: '', capacity: '' })

  const fetchDates = useCallback(async () => {
    const res = await fetch(`/api/admin/tours/${tourId}/dates`)
    if (res.ok) {
      const data = await res.json()
      setDates(data)
    }
    setLoading(false)
  }, [tourId])

  useEffect(() => { fetchDates() }, [fetchDates])

  async function addDate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setAdding(true)

    const res = await fetch(`/api/admin/tours/${tourId}/dates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: form.date, capacity: Number(form.capacity) }),
    })

    if (res.ok) {
      setForm({ date: '', capacity: '' })
      fetchDates()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to add date')
    }
    setAdding(false)
  }

  async function deleteDate(dateId: string) {
    if (!confirm('Remove this date slot?')) return

    const res = await fetch(`/api/admin/tours/${tourId}/dates?dateId=${dateId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      fetchDates()
    } else {
      const data = await res.json()
      alert(data.error ?? 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addDate} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            required
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
          <input
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
            required
            placeholder="Max pax"
            className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="bg-ocean-500 hover:bg-ocean-600 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
        >
          {adding ? 'Adding…' : 'Add Date'}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading dates…</p>
      ) : dates.length === 0 ? (
        <p className="text-gray-500 text-sm">No dates added yet.</p>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
          {dates.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-800 text-sm">{formatDate(d.date)}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {d.booked_pax} / {d.capacity} booked
                  {d.booked_pax >= d.capacity && (
                    <span className="ml-2 text-coral-500 font-medium">Full</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => deleteDate(d.id)}
                disabled={d.booked_pax > 0}
                title={d.booked_pax > 0 ? 'Cannot delete — has bookings' : 'Remove date'}
                className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
