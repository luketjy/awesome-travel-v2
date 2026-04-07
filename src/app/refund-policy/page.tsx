import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Refund & Cancellation Policy | Awesome Travel & Tour',
}

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-ocean-700 via-ocean-600 to-teal-500 text-white py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold">Refund &amp; Cancellation Policy</h1>
            <p className="text-ocean-200 text-sm mt-2">Last Updated: 6 April 2026</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-10 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">General Policy</h2>
            <p className="leading-relaxed">
              All bookings are non-refundable once confirmed unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Walking Tours</h2>
            <p className="leading-relaxed">
              Walking tour bookings are non-refundable. Requests for rescheduling may be considered on a
              case-by-case basis and are subject to availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Package and Private Tours</h2>
            <p className="leading-relaxed">
              Cancellation policies for package or private tours may vary and will be stated at the time
              of booking. Unless otherwise specified, bookings are non-refundable once confirmed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">No-Show and Late Arrival</h2>
            <p className="leading-relaxed">
              Customers who fail to attend or arrive more than 15 minutes late will be considered a
              no-show. No refunds will be provided in such cases.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes by Company</h2>
            <p className="leading-relaxed">
              If we cancel or are unable to deliver a service due to operational reasons, we may offer
              rescheduling or alternative arrangements at our discretion.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
