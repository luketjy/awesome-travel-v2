'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tour, TourDate } from '@/lib/types'
import { formatPrice, formatDate } from '@/lib/utils'

interface Props {
  tour: Tour
  tourDate: TourDate
}

export default function BookingForm({ tour, tourDate }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const availableSpots = tourDate.capacity - tourDate.booked_pax

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    numPax: 1,
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  function set(field: keyof typeof form, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const totalPrice = tour.price * form.numPax

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tourDateId: tourDate.id,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        numPax: form.numPax,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      router.push(`/booking/confirmation?bookingId=${data.bookingId}`)
    } else {
      setError(data.error ?? 'Booking failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Summary */}
      <div className="bg-ocean-50 rounded-xl border border-ocean-100 p-4 space-y-1">
        <p className="font-semibold text-ocean-700">{tour.name}</p>
        <p className="text-sm text-gray-600">📅 {formatDate(tourDate.date)}</p>
        <p className="text-sm text-gray-600">⏱ {tour.duration}</p>
        <p className="text-sm text-gray-500">{availableSpots} spot(s) available</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          value={form.customerName}
          onChange={(e) => set('customerName', e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          value={form.customerEmail}
          onChange={(e) => set('customerEmail', e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          type="tel"
          value={form.customerPhone}
          onChange={(e) => set('customerPhone', e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          placeholder="+65 9123 4567"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
        <input
          type="number"
          min={1}
          max={availableSpots}
          value={form.numPax}
          onChange={(e) => set('numPax', parseInt(e.target.value, 10) || 1)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
        />
      </div>

      {/* Total */}
      <div className="bg-sandy-50 rounded-xl border border-sandy-200 px-4 py-3 flex justify-between items-center">
        <span className="text-gray-700 font-medium">Total</span>
        <span className="text-ocean-600 font-bold text-xl">{formatPrice(totalPrice)}</span>
      </div>

      {/* Terms agreement */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-ocean-500 shrink-0"
        />
        <span className="text-sm text-gray-600">
          I have read and agree to the{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-ocean-600 underline hover:text-ocean-700">
            Terms &amp; Conditions
          </a>
          ,{' '}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-ocean-600 underline hover:text-ocean-700">
            Privacy Policy
          </a>
          , and{' '}
          <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="text-ocean-600 underline hover:text-ocean-700">
            Refund Policy
          </a>
          .
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !agreedToTerms}
        className="w-full bg-ocean-500 hover:bg-ocean-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
      >
        {loading ? 'Processing…' : 'Confirm Booking'}
      </button>
    </form>
  )
}
