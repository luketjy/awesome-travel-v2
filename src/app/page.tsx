export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import TourCard from '@/components/tours/TourCard'
import HeroTourCarousel from '@/components/home/HeroTourCarousel'
import HomeFaq from '@/components/home/HomeFaq'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { createServerClient } from '@/lib/supabase/server'
import { Tour } from '@/lib/types'

async function getLocalTours(): Promise<Tour[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('tours')
    .select('*')
    .eq('is_active', true)
    .or('tour_type.eq.local,tour_type.is.null')
    .order('sort_order', { ascending: true })
    .limit(6)
  return data ?? []
}

async function getWorldwideTours(): Promise<Tour[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('tours')
    .select('*')
    .eq('is_active', true)
    .eq('tour_type', 'worldwide')
    .order('sort_order', { ascending: true })
    .limit(6)
  return data ?? []
}

async function getAllActiveTours(): Promise<Tour[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('tours')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(24)
  return data ?? []
}

const features = [
  {
    title: 'Born & Raised Local',
    description: "Every corner of Singapore holds a story. Our local guides bring them to life with knowledge you won't find in any guidebook.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 3C8.48 3 4 7.48 4 13c0 7.75 10 18 10 18s10-10.25 10-18c0-5.52-4.48-10-10-10zm0 13.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Senior-Friendly Travel',
    description: 'Safe, thoughtfully paced itineraries crafted for comfort and peace of mind — so families can relax knowing their loved ones are in good hands.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM7 20c0-3.87 3.13-7 7-7s7 3.13 7 7v1H7v-1z" fill="currentColor" />
        <path d="M20 13.5l1.5 6M22 15h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Guided Every Step',
    description: 'With a guide who genuinely cares, every sight becomes more meaningful and every moment of your journey becomes a story worth telling.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M4 20V8l10-4 10 4v12l-10 4L4 20z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M14 4v16M4 8l10 4 10-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const stats = [
  { value: '4-hr', label: 'Walking tours', icon: '🚶' },
  { value: '5★', label: 'Guest experience', icon: '⭐' },
  { value: 'EN & 中文', label: 'Bilingual guides', icon: '🗣️' },
  { value: 'Worldwide', label: 'Destinations', icon: '🌏' },
]

export default async function HomePage() {
  const [allTours, localTours, worldwideTours] = await Promise.all([
    getAllActiveTours(),
    getLocalTours(),
    getWorldwideTours(),
  ])

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroTourCarousel tours={allTours} />

        {/* Stats trust bar */}
        <div className="bg-ocean-700 text-white relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center flex flex-col items-center gap-1">
                <span className="text-lg">{s.icon}</span>
                <p className="text-xl font-bold text-sandy-300">{s.value}</p>
                <p className="text-ocean-200/80 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Local tours grid */}
        {localTours.length > 0 && (
          <section className="py-20 px-4 bg-warm-50">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                <div className="text-center sm:text-left">
                  <p className="text-ocean-500 text-sm font-semibold uppercase tracking-widest mb-2">Discover Singapore</p>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Explore Our Tours</h2>
                  <p className="text-gray-500 mt-3 max-w-2xl text-lg">
                    Hand-picked experiences to discover Singapore&apos;s rich culture and heritage.
                  </p>
                </div>
                <Link
                  href="/tours?type=local"
                  className="inline-flex items-center gap-1.5 text-ocean-600 hover:text-ocean-700 font-semibold text-sm shrink-0 self-center sm:self-auto bg-ocean-50 hover:bg-ocean-100 px-4 py-2 rounded-full transition-colors"
                >
                  View all
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {localTours.map((tour, i) => (
                  <ScrollReveal key={tour.id} index={i}>
                    <TourCard tour={tour} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Worldwide packages section */}
        {worldwideTours.length > 0 && (
          <section className="py-20 px-4 bg-gradient-to-b from-warm-50 via-ocean-50/30 to-warm-50">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                <div className="text-center sm:text-left">
                  <p className="text-ocean-500 text-sm font-semibold uppercase tracking-widest mb-2">
                    International Travel
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Worldwide Packages</h2>
                  <p className="text-gray-500 mt-3 max-w-2xl text-lg">
                    Multi-day international tours for families, seniors, and every kind of traveller.
                  </p>
                </div>
                <Link
                  href="/tours?type=worldwide"
                  className="inline-flex items-center gap-1.5 text-ocean-600 hover:text-ocean-700 font-semibold text-sm shrink-0 self-center sm:self-auto bg-ocean-50 hover:bg-ocean-100 px-4 py-2 rounded-full transition-colors"
                >
                  View all packages
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {worldwideTours.map((tour, i) => (
                  <ScrollReveal key={tour.id} index={i}>
                    <TourCard tour={tour} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-ocean-500 text-sm font-semibold uppercase tracking-widest mb-2">Our Promise</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-lg">
                We don&apos;t just run tours — we create journeys worth remembering.
              </p>
            </div>

            {/* Feature pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
              {features.map((f) => (
                <div key={f.title} className="bg-warm-50 rounded-2xl p-8 border border-gray-100 text-center hover:shadow-md hover:border-ocean-200/50 transition-all duration-300 group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-50 to-ocean-100 text-ocean-600 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>

            {/* Story prose */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-warm-50 rounded-3xl p-8 sm:p-12 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Story</h3>
                <div className="text-gray-600 leading-relaxed space-y-5 text-base">
                  <p>
                    At Awesome Travel &amp; Tour, we may be a new name in the travel industry, but our passion
                    for travel is lifelong. To us, travel is more than just a holiday – it is a lifestyle
                    choice, a chance to refresh one&apos;s spirit, and a way to find new motivation when life
                    feels tough. We believe that everyone, regardless of age, deserves the joy of discovering
                    the world.
                  </p>
                  <p>
                    The inspiration to start this agency came from my own family. When my parents wanted to
                    visit their ancestral hometown in China, I realised how meaningful such journeys are for
                    seniors – yet how difficult it can be for their children, busy with careers and family
                    commitments, to accompany them. That&apos;s when I decided to dedicate part of my agency to
                    serving senior travellers, creating safe, thoughtful, and well-planned tours that allow
                    them to travel with confidence and peace of mind.
                  </p>
                  <p>
                    But our love for travel doesn&apos;t stop there. As Singaporeans born and bred locally, we
                    are passionate about sharing our home with visitors from around the world. Many say
                    Singapore is small and has little to offer – but join us on one of our 4-hour walking
                    tours, and you&apos;ll see how every corner has a story. With our local guides, you&apos;ll
                    discover hidden gems, cultural tales, and living history that turns stone and brick into
                    experiences that truly come alive.
                  </p>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                  <p className="text-xl font-semibold text-ocean-700 italic">
                    &ldquo;Because Every Journey Deserves Care.&rdquo;
                  </p>
                  <p className="text-sm text-gray-400 mt-2">— Awesome Travel &amp; Tour</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HomeFaq />

        {/* CTA */}
        <section className="py-24 px-4 bg-gradient-to-br from-ocean-800 via-ocean-700 to-teal-500 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-sandy-300 blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal-300 blur-3xl" />
          </div>
          <div className="max-w-2xl mx-auto relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">Ready for Your Next Adventure?</h2>
            <p className="text-ocean-100 mb-10 text-lg leading-relaxed">
              Book your tour today and create memories that last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/tours"
                className="inline-flex items-center justify-center bg-sandy-300 hover:bg-sandy-500 text-ocean-800 font-bold px-10 py-3.5 rounded-xl transition-all hover:shadow-lg active:scale-[0.98]"
              >
                Explore Tours
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border-2 border-white/30 hover:border-white/60 text-white font-bold px-10 py-3.5 rounded-xl transition-all hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
