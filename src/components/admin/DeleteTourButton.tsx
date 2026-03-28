'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteTourButton({ tourId }: { tourId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Deactivate this tour? It will no longer appear on the public site.')) return
    setLoading(true)
    const res = await fetch(`/api/admin/tours/${tourId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error ?? 'Failed to delete')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 font-medium"
    >
      {loading ? '…' : 'Delete'}
    </button>
  )
}
