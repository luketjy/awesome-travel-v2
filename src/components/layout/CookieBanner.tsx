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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-ocean-700 text-ocean-100 border-t border-ocean-600 shadow-lg px-4 py-4 sm:py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm leading-relaxed">
          We use cookies to improve your experience. By continuing, you agree to our{' '}
          <Link href="/privacy-policy" className="underline hover:text-white transition-colors">
            Privacy Policy
          </Link>
          . Under Singapore&apos;s PDPA, you may decline non-essential cookies.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-1.5 text-sm border border-ocean-400 rounded hover:bg-ocean-700 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-1.5 text-sm bg-teal-500 hover:bg-teal-400 text-white rounded transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
