'use client'

import { useState, useEffect } from 'react'
import { Booking } from '@/lib/types'
import { formatDate, formatPrice, formatDateTime } from '@/lib/utils'

type RefundState =
  | { phase: 'idle' }
  | { phase: 'confirm' }
  | { phase: 'loading' }
  | { phase: 'success'; message: string }
  | { phase: 'error'; message: string }

function RefundButton({ booking, onRefunded }: { booking: Booking; onRefunded: (id: string) => void }) {
  const [state, setState] = useState<RefundState>({ phase: 'idle' })

  async function doRefund() {
    setState({ phase: 'loading' })
    try {
      const res = await fetch(`/api/admin/refunds/${booking.id}`, { method: 'POST' })
      const data = await res.json() as { refundId?: string; amount?: string; status?: string; error?: string }
      if (res.ok) {
        setState({ phase: 'success', message: `Refunded SGD ${data.amount ?? booking.total_price} · ${data.status}` })
        onRefunded(booking.id)
      } else {
        setState({ phase: 'error', message: data.error ?? 'Refund failed' })
      }
    } catch {
      setState({ phase: 'error', message: 'Network error' })
    }
  }

  if (state.phase === 'idle') {
    return (
      <button
        onClick={() => setState({ phase: 'confirm' })}
        className="text-xs px-2 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
      >
        Refund
      </button>
    )
  }

  if (state.phase === 'confirm') {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-xs text-gray-600">Refund {formatPrice(booking.total_price)}?</p>
        <div className="flex gap-1">
          <button
            onClick={doRefund}
            className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={() => setState({ phase: 'idle' })}
            className="text-xs px-2 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (state.phase === 'loading') {
    return <p className="text-xs text-gray-500">Processing…</p>
  }

  if (state.phase === 'success') {
    return <p className="text-xs text-green-700">{state.message}</p>
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-red-600">{state.message}</p>
      <button
        onClick={() => setState({ phase: 'idle' })}
        className="text-xs text-gray-500 underline"
      >
        Dismiss
      </button>
    </div>
  )
}

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

  function handleRefunded(id: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, payment_status: 'refunded' } : b))
    )
  }

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
    pending_refund: 'bg-orange-100 text-orange-800',
    refunded: 'bg-purple-100 text-purple-800',
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
            <th className="px-4 py-3 text-left">Actions</th>
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
              <td className="px-4 py-3">
                {b.payment_status === 'paid' && (
                  <RefundButton booking={b} onRefunded={handleRefunded} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
