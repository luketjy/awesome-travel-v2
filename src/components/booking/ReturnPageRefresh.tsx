'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Polls server render while payment status may still be updating (webhook / UAT delay). */
export default function ReturnPageRefresh() {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh()
    }, 4000)
    const stop = setTimeout(() => clearInterval(id), 120_000)
    return () => {
      clearInterval(id)
      clearTimeout(stop)
    }
  }, [router])

  return null
}
