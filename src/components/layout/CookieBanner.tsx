'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-4 sm:py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          We use cookies to improve your experience. By continuing, you agree to our{' '}
          <Link href="/privacy-policy" className="text-ocean-600 underline hover:text-ocean-700 transition-colors">
            Privacy Policy
          </Link>
          . Under Singapore&apos;s PDPA, you may decline non-essential cookies.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-ocean-500 hover:bg-ocean-600 text-white rounded-lg transition-colors font-medium"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
