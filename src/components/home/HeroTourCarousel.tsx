'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { Tour } from '@/lib/types'

function excerpt(text: string, maxLen: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= maxLen) return t
  const cut = t.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + '…'
}

function contactHref(): string {
  const url = process.env.NEXT_PUBLIC_CONTACT_URL?.trim()
  if (url) return url
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, '')
  if (wa) return `https://wa.me/${wa}`
  return '/tours'
}

type Props = {
  tours: Tour[]
}

const AUTOPLAY_MS = 3000

export default function HeroTourCarousel({ tours }: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = tours.length

  const go = useCallback(
    (dir: -1 | 1) => {
      if (n <= 1) return
      setIndex((i) => (i + dir + n) % n)
    },
    [n]
  )

  useEffect(() => {
    if (n <= 1 || paused) return
    const t = setInterval(() => go(1), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [n, go, paused])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  if (n === 0) {
    return (
      <section className="relative min-h-[min(78vh,720px)] flex items-center justify-center bg-gradient-to-br from-ocean-800 via-ocean-700 to-teal-500 text-white px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sandy-200 font-semibold text-sm uppercase tracking-widest mb-3">
            Discover Singapore & Beyond
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
            Unforgettable Tours & Travel Experiences
          </h1>
          <p className="text-white/80 text-lg mb-8">
            New tours are on the way. Browse when they are live or get in touch.
          </p>
          <Link
            href="/tours"
            className="inline-flex items-center justify-center bg-coral-500 hover:bg-coral-400 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg"
          >
            Explore Tours
          </Link>
        </div>
      </section>
    )
  }

  const contact = contactHref()
  const isExternalContact = contact.startsWith('http') || contact.startsWith('mailto:') || contact.startsWith('tel:')

  return (
    <section
      className="relative min-h-[min(85vh,820px)] w-full overflow-hidden bg-ocean-900"
      aria-roledescription="carousel"
      aria-label="Featured tours"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {tours.map((tour, i) => {
        const active = i === index
        const hrefTour = `/tours/${tour.slug}`
        const hrefBook = `${hrefTour}#book`
        const bg = tour.images?.[0]

        return (
          <div
            key={tour.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              active ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
            }`}
            aria-hidden={!active}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}`}
          >
            <div className="absolute inset-0">
              {bg ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs */}
                  <img
                    src={bg}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    fetchPriority={i === 0 ? 'high' : 'low'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/20" aria-hidden />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden />
                </>
              ) : (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-ocean-800 to-teal-700"
                  aria-hidden
                />
              )}
            </div>

            <div className="relative z-[2] h-full min-h-[min(85vh,820px)] flex flex-col justify-end px-4 sm:px-10 lg:px-16 pb-28 sm:pb-24 pt-20">
              <div className="max-w-3xl">
                <p className="text-sandy-300 font-semibold text-sm uppercase tracking-widest mb-3">Featured Tour</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-sm mb-4">
                  {tour.name}
                </h1>
                <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-2xl mb-8 line-clamp-3">
                  {excerpt(tour.description, 240)}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={hrefTour}
                    className="inline-flex items-center justify-center bg-coral-500 hover:bg-coral-400 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm sm:text-base hover:shadow-lg active:scale-[0.98]"
                  >
                    See more
                  </Link>
                  <Link
                    href={hrefBook}
                    className="inline-flex items-center justify-center bg-white text-ocean-700 font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition-all text-sm sm:text-base hover:shadow-lg active:scale-[0.98]"
                  >
                    Book Now
                  </Link>
                  {isExternalContact ? (
                    <a
                      href={contact}
                      {...(contact.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-all text-sm sm:text-base"
                    >
                      Contact Us
                    </a>
                  ) : (
                    <Link
                      href={contact}
                      className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-all text-sm sm:text-base"
                    >
                      Contact Us
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {n > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white shadow-lg transition-all hover:bg-white/25 hover:scale-105 active:scale-95"
            aria-label="Previous tour"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white shadow-lg transition-all hover:bg-white/25 hover:scale-105 active:scale-95"
            aria-label="Next tour"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2"
            role="tablist"
            aria-label="Slide indicators"
          >
            {tours.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show tour ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
