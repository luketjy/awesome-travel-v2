import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Delivery Policy | Awesome Travel & Tour',
}

export default function DeliveryPolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-ocean-700 via-ocean-600 to-teal-500 text-white py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold">Delivery Policy</h1>
            <p className="text-ocean-200 text-sm mt-2">Last Updated: 6 April 2026</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-10 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Nature of Service</h2>
            <p className="leading-relaxed">
              All products sold are service-based, including walking tours, guided tours, and travel-related
              services. No physical goods will be delivered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Method</h2>
            <p className="leading-relaxed">
              Upon successful payment, customers will receive booking confirmation via email or messaging
              platforms. This confirmation serves as proof of purchase and booking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Service Fulfilment</h2>
            <p className="leading-relaxed">
              Services are delivered on the scheduled date and time stated in the booking confirmation.
              Customers are required to attend at the designated meeting point.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Proof of Delivery</h2>
            <p className="leading-relaxed">
              Service delivery may be evidenced by booking records, attendance records, communication logs,
              or other reasonable documentation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Customer Responsibility</h2>
            <p className="leading-relaxed">
              Customers are responsible for attending the service at the specified time and location.
              Failure to do so will be treated as a no-show.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
