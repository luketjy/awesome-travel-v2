'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Tour, TOUR_CATEGORIES } from '@/lib/types'

interface Props {
  tour?: Tour
}

export default function TourForm({ tour }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(tour?.images ?? [])

  const [form, setForm] = useState({
    name: tour?.name ?? '',
    description: tour?.description ?? '',
    price: tour?.price?.toString() ?? '',
    category: tour?.category ?? '',
    duration: tour?.duration ?? '',
    is_active: tour?.is_active ?? true,
  })

  function set(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)

    const uploaded: string[] = []
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        uploaded.push(data.url)
      } else {
        const data = await res.json()
        setError(data.error ?? 'Upload failed')
      }
    }

    setImages((prev) => [...prev, ...uploaded])
    setUploading(false)
    // Reset file input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  function moveImage(from: number, to: number) {
    setImages((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      duration: form.duration,
      images,
      is_active: form.is_active,
    }

    const url = tour ? `/api/admin/tours/${tour.id}` : '/api/admin/tours'
    const method = tour ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/admin/tours')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tour Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          required
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (SGD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <input
            type="text"
            value={form.duration}
            onChange={(e) => set('duration', e.target.value)}
            required
            placeholder="e.g. 4 hours, 1 day"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white"
        >
          <option value="">Select a category</option>
          {TOUR_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Image uploader */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>

        {/* Preview grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            {images.map((url, i) => (
              <div key={url} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i - 1)}
                      className="bg-white/90 text-gray-800 rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-white"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {i < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i + 1)}
                      className="bg-white/90 text-gray-800 rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-white"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-ocean-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 border-2 border-dashed border-gray-300 hover:border-ocean-400 text-gray-500 hover:text-ocean-600 rounded-xl px-5 py-3 text-sm font-medium transition-colors disabled:opacity-50 w-full justify-center"
        >
          {uploading ? (
            <>
              <span className="animate-spin">⏳</span> Uploading…
            </>
          ) : (
            <>
              <span>📷</span> Upload Images
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 mt-1.5">
          First image is the cover. Hover over images to reorder or remove.
        </p>
      </div>

      {tour && (
        <div className="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set('is_active', e.target.checked)}
            className="w-4 h-4 accent-ocean-500"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Active (visible to public)
          </label>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-ocean-500 hover:bg-ocean-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Saving…' : tour ? 'Save Changes' : 'Create Tour'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/tours')}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
