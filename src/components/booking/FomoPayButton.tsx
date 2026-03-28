'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  bookingId: string
  paid: boolean
  configured: boolean
}

export default function FomoPayButton({ bookingId, paid, configured }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function startPayment() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/payments/fomopay/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = (await res.json()) as {
        redirectUrl?: string
        paid?: boolean
        error?: string
      }

      if (res.ok && data.paid) {
        router.push(`/booking/confirmation?bookingId=${encodeURIComponent(bookingId)}`)
        router.refresh()
        return
      }
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl
        return
      }
      setError(data.error ?? 'Could not start payment.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (paid) {
    return (
      <p className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl py-3 px-4">
        Payment received — thank you!
      </p>
    )
  }

  if (!configured) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl py-3 px-4">
        Online payment is not configured yet. Add FOMO Pay credentials to the server environment to
        enable checkout.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={startPayment}
        disabled={loading}
        className="w-full bg-ocean-600 hover:bg-ocean-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
      >
        {loading ? 'Redirecting to secure payment…' : 'Pay securely with FOMO Pay'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">
        You will complete payment on FOMO Pay&apos;s hosted page (cards, PayNow, e-wallets, and more
        depending on your account).
      </p>
    </div>
  )
}
