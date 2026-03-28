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

async function getActiveTours(): Promise<Tour[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('tours')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(24)
  return data ?? []
}

export default async function HomePage() {
  const tours = await getActiveTours()
  const featuredGrid = tours.slice(0, 6)

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroTourCarousel tours={tours} />

        {/* Explore tours grid */}
        {featuredGrid.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-bold text-gray-900">Explore Our Tours</h2>
                  <p className="text-gray-500 mt-2 max-w-2xl">
                    Hand-picked experiences to discover Singapore&apos;s rich culture and heritage.
                  </p>
                </div>
                <Link
                  href="/tours"
                  className="text-ocean-600 hover:text-ocean-700 font-medium text-sm shrink-0 self-center sm:self-auto"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredGrid.map((tour, i) => (
                  <ScrollReveal key={tour.id} index={i}>
                    <TourCard tour={tour} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us — story */}
        <section className="py-16 px-4 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Why Choose Us?</h2>
            <div className="max-w-none text-gray-700 leading-relaxed space-y-5 text-base">
              <p>
                At Awesome Travel & Tour, we may be a new name in the travel industry, but our passion
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
              <p>
                Why choose Awesome Travel & Tour? Because we believe travel is always better with a guide
                who cares. With a guide, every sight becomes more meaningful, and every step of your
                journey turns into a story worth remembering.
              </p>
            </div>
            <p className="mt-10 text-center text-lg font-semibold text-ocean-700">
              Awesome Travel & Tour – Because Every Journey Deserves Care.
            </p>
          </div>
        </section>

        <HomeFaq />

        {/* CTA */}
        <section className="py-16 px-4 bg-ocean-600 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-ocean-100 mb-8 text-lg">
            Book your tour today and create memories that last a lifetime.
          </p>
          <Link
            href="/tours"
            className="bg-sandy-300 hover:bg-sandy-500 text-ocean-800 font-bold px-10 py-3 rounded-xl transition-colors"
          >
            Explore Tours
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
