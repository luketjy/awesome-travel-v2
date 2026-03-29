'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Tour, TOUR_CATEGORIES, ItineraryDay, PricingOptions } from '@/lib/types'

interface Props {
  tour?: Tour
}

const SUITABILITY_PRESETS = [
  'Family-Friendly',
  'Senior-Friendly',
  'Honeymoon',
  'Solo',
  'Budget',
  'Luxury',
]

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
    tour_type: tour?.tour_type ?? 'local',
    destination: tour?.destination ?? '',
    difficulty: tour?.difficulty ?? '',
    min_pax: tour?.min_pax?.toString() ?? '',
    max_pax: tour?.max_pax?.toString() ?? '',
    enquiry_only: tour?.enquiry_only ?? false,
  })

  const [highlights, setHighlights] = useState<string[]>(tour?.highlights ?? [])
  const [highlightInput, setHighlightInput] = useState('')
  const [inclusions, setInclusions] = useState<string[]>(tour?.inclusions ?? [''])
  const [exclusions, setExclusions] = useState<string[]>(tour?.exclusions ?? [''])
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(tour?.itinerary ?? [])
  const [suitabilityTags, setSuitabilityTags] = useState<string[]>(tour?.suitability_tags ?? [])
  const [suitabilityInput, setSuitabilityInput] = useState('')
  const [pricingOptions, setPricingOptions] = useState<PricingOptions>(
    tour?.pricing_options ?? { twin_sharing: 0 }
  )

  function set(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Highlights
  function addHighlight() {
    const val = highlightInput.trim()
    if (val && !highlights.includes(val)) {
      setHighlights((prev) => [...prev, val])
    }
    setHighlightInput('')
  }
  function removeHighlight(i: number) {
    setHighlights((prev) => prev.filter((_, idx) => idx !== i))
  }

  // Suitability tags
  function addSuitabilityTag(tag: string) {
    const val = tag.trim()
    if (val && !suitabilityTags.includes(val)) {
      setSuitabilityTags((prev) => [...prev, val])
    }
    setSuitabilityInput('')
  }
  function removeSuitabilityTag(i: number) {
    setSuitabilityTags((prev) => prev.filter((_, idx) => idx !== i))
  }

  // Inclusions
  function updateInclusion(i: number, val: string) {
    setInclusions((prev) => prev.map((v, idx) => (idx === i ? val : v)))
  }
  function addInclusion() {
    setInclusions((prev) => [...prev, ''])
  }
  function removeInclusion(i: number) {
    setInclusions((prev) => prev.filter((_, idx) => idx !== i))
  }

  // Exclusions
  function updateExclusion(i: number, val: string) {
    setExclusions((prev) => prev.map((v, idx) => (idx === i ? val : v)))
  }
  function addExclusion() {
    setExclusions((prev) => [...prev, ''])
  }
  function removeExclusion(i: number) {
    setExclusions((prev) => prev.filter((_, idx) => idx !== i))
  }

  // Itinerary
  function addDay() {
    setItinerary((prev) => [...prev, { day: prev.length + 1, title: '', description: '' }])
  }
  function updateDay(i: number, field: keyof ItineraryDay, val: string | number) {
    setItinerary((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)))
  }
  function removeDay(i: number) {
    setItinerary((prev) =>
      prev.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 }))
    )
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

    const isWorldwide = form.tour_type === 'worldwide'

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      duration: form.duration,
      images,
      is_active: form.is_active,
      enquiry_only: form.enquiry_only,
      tour_type: form.tour_type,
      destination: isWorldwide ? form.destination || null : null,
      difficulty: isWorldwide ? form.difficulty || null : null,
      min_pax: isWorldwide && form.min_pax ? Number(form.min_pax) : null,
      max_pax: isWorldwide && form.max_pax ? Number(form.max_pax) : null,
      highlights: isWorldwide ? highlights.filter(Boolean) : null,
      inclusions: isWorldwide ? inclusions.filter(Boolean) : null,
      exclusions: isWorldwide ? exclusions.filter(Boolean) : null,
      itinerary: isWorldwide ? itinerary : null,
      pricing_options: isWorldwide ? pricingOptions : null,
      suitability_tags: isWorldwide ? suitabilityTags : null,
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

  const isWorldwide = form.tour_type === 'worldwide'

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

      {/* Tour Type toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tour Type</label>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden w-fit">
          <button
            type="button"
            onClick={() => set('tour_type', 'local')}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              !isWorldwide
                ? 'bg-ocean-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Local Tour
          </button>
          <button
            type="button"
            onClick={() => set('tour_type', 'worldwide')}
            className={`px-5 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
              isWorldwide
                ? 'bg-ocean-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Worldwide Package
          </button>
        </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isWorldwide ? 'From Price (SGD)' : 'Price (SGD)'}
          </label>
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
            placeholder={isWorldwide ? 'e.g. 7 Days 6 Nights' : 'e.g. 4 hours, 1 day'}
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

      {/* Worldwide-only fields */}
      {isWorldwide && (
        <div className="space-y-5 border border-ocean-100 bg-ocean-50/40 rounded-xl p-5">
          <p className="text-xs font-semibold text-ocean-600 uppercase tracking-widest">Package Details</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.destination}
              onChange={(e) => set('destination', e.target.value)}
              placeholder="e.g. Tokyo, Japan"
              required={isWorldwide}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => set('difficulty', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-white"
              >
                <option value="">Not specified</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
              </select>
            </div>
            <div>
              {/* spacer */}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Pax</label>
              <input
                type="number"
                min="1"
                value={form.min_pax}
                onChange={(e) => set('min_pax', e.target.value)}
                placeholder="e.g. 10"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Pax</label>
              <input
                type="number"
                min="1"
                value={form.max_pax}
                onChange={(e) => set('max_pax', e.target.value)}
                placeholder="e.g. 40"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
          </div>

          {/* Pricing options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Options (SGD per person)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Twin Sharing <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingOptions.twin_sharing || ''}
                  onChange={(e) => setPricingOptions((p) => ({ ...p, twin_sharing: Number(e.target.value) }))}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Single Supplement</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingOptions.single_supplement ?? ''}
                  onChange={(e) => setPricingOptions((p) => ({ ...p, single_supplement: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Optional"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Child Rate</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricingOptions.child_rate ?? ''}
                  onChange={(e) => setPricingOptions((p) => ({ ...p, child_rate: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Optional"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Highlights</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addHighlight() }
                }}
                placeholder="Type and press Enter to add"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
              <button type="button" onClick={addHighlight} className="px-3 py-2 bg-ocean-500 text-white rounded-lg text-sm hover:bg-ocean-600">
                Add
              </button>
            </div>
            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {highlights.map((h, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-ocean-100 text-ocean-700 text-xs px-2.5 py-1 rounded-full">
                    {h}
                    <button type="button" onClick={() => removeHighlight(i)} className="hover:text-ocean-900 ml-0.5">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Suitability tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suitability</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={suitabilityInput}
                onChange={(e) => setSuitabilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSuitabilityTag(suitabilityInput) }
                }}
                placeholder="Type and press Enter"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
              <button type="button" onClick={() => addSuitabilityTag(suitabilityInput)} className="px-3 py-2 bg-ocean-500 text-white rounded-lg text-sm hover:bg-ocean-600">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {SUITABILITY_PRESETS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addSuitabilityTag(tag)}
                  disabled={suitabilityTags.includes(tag)}
                  className="text-xs border border-gray-300 text-gray-600 px-2.5 py-1 rounded-full hover:border-ocean-400 hover:text-ocean-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + {tag}
                </button>
              ))}
            </div>
            {suitabilityTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suitabilityTags.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 text-xs px-2.5 py-1 rounded-full">
                    {t}
                    <button type="button" onClick={() => removeSuitabilityTag(i)} className="hover:text-teal-900 ml-0.5">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Inclusions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Inclusions</label>
            <div className="space-y-2">
              {inclusions.map((val, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateInclusion(i, e.target.value)}
                    placeholder="e.g. Return airfare from Singapore"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                  <button type="button" onClick={() => removeInclusion(i)} className="px-2 text-gray-400 hover:text-red-500 text-sm">✕</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addInclusion} className="mt-2 text-sm text-ocean-600 hover:text-ocean-700 font-medium">
              + Add item
            </button>
          </div>

          {/* Exclusions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exclusions</label>
            <div className="space-y-2">
              {exclusions.map((val, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateExclusion(i, e.target.value)}
                    placeholder="e.g. Travel insurance"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                  <button type="button" onClick={() => removeExclusion(i)} className="px-2 text-gray-400 hover:text-red-500 text-sm">✕</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addExclusion} className="mt-2 text-sm text-ocean-600 hover:text-ocean-700 font-medium">
              + Add item
            </button>
          </div>

          {/* Itinerary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Itinerary</label>
            <div className="space-y-3">
              {itinerary.map((day, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ocean-600">Day {day.day}</span>
                    <button type="button" onClick={() => removeDay(i)} className="text-xs text-gray-400 hover:text-red-500">Remove</button>
                  </div>
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => updateDay(i, 'title', e.target.value)}
                    placeholder="Day title (e.g. Arrival in Tokyo)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                  <textarea
                    value={day.description}
                    onChange={(e) => updateDay(i, 'description', e.target.value)}
                    placeholder="What happens this day…"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none"
                  />
                </div>
              ))}
            </div>
            <button type="button" onClick={addDay} className="mt-2 text-sm text-ocean-600 hover:text-ocean-700 font-medium">
              + Add Day
            </button>
          </div>
        </div>
      )}

      {/* Image uploader */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>

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

      {/* Enquiry only toggle */}
      <div className="flex items-center gap-2">
        <input
          id="enquiry_only"
          type="checkbox"
          checked={form.enquiry_only}
          onChange={(e) => set('enquiry_only', e.target.checked)}
          className="w-4 h-4 accent-ocean-500"
        />
        <label htmlFor="enquiry_only" className="text-sm font-medium text-gray-700">
          Enquiry only (show &ldquo;Contact Us&rdquo; instead of online booking)
        </label>
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
