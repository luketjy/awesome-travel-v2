'use client'

import { useState, useEffect, useCallback } from 'react'

interface Props {
  images: string[]
  tourName: string
}

export default function ImageGallery({ images, tourName }: Props) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, prev, next])

  if (images.length === 0) return null

  return (
    <>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setCurrent(i); setOpen(true) }}
            className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ocean-500"
          >
            <img src={img} alt={`${tourName} photo ${i + 1}`} className="w-full h-full object-cover" />
            {i === 0 && images.length > 1 && (
              <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                1 / {images.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* Image */}
          <div
            className="relative max-w-4xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[current]}
              alt={`${tourName} photo ${current + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />

            {/* Counter */}
            <p className="text-center text-white/70 text-sm mt-3">
              {current + 1} / {images.length}
            </p>

            {/* Prev */}
            {images.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 bg-white/10 hover:bg-white/20 text-white rounded-full w-11 h-11 flex items-center justify-center text-xl transition-colors"
                aria-label="Previous image"
              >
                ‹
              </button>
            )}

            {/* Next */}
            {images.length > 1 && (
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 bg-white/10 hover:bg-white/20 text-white rounded-full w-11 h-11 flex items-center justify-center text-xl transition-colors"
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </div>

          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
