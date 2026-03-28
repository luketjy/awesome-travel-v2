'use client'

import { useState, useEffect } from 'react'
import { Booking } from '@/lib/types'
import { formatDate, formatPrice, formatDateTime } from '@/lib/utils'

export default function BookingsTable() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((r) => r.json())
      .then((data) => {
        setBookings(data)
        setLoading(false)
      })
  }, [])

  const statusColors: Record<string, string> = {
    pending: 'bg-sandy-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const payColors: Record<string, string> = {
    unpaid: 'bg-gray-100 text-gray-700',
    pending: 'bg-amber-100 text-amber-900',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  if (loading) return <p className="text-gray-500 text-sm">Loading bookings…</p>
  if (bookings.length === 0) return <p className="text-gray-500 text-sm">No bookings yet.</p>

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Customer</th>
            <th className="px-4 py-3 text-left">Tour</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-right">Pax</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Payment</th>
            <th className="px-4 py-3 text-left">Booked At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{b.customer_name}</p>
                <p className="text-gray-500 text-xs">{b.customer_email}</p>
                <p className="text-gray-500 text-xs">{b.customer_phone}</p>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {(b.tour_date as { tour?: { name: string } } | undefined)?.tour?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {b.tour_date?.date ? formatDate(b.tour_date.date) : '—'}
              </td>
              <td className="px-4 py-3 text-right text-gray-700">{b.num_pax}</td>
              <td className="px-4 py-3 text-right font-medium text-gray-800">
                {formatPrice(b.total_price)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[b.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {b.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    payColors[(b.payment_status as string) ?? 'unpaid'] ??
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {(b.payment_status as string) ?? 'unpaid'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {formatDateTime(b.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
