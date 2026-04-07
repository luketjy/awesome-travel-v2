import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Terms & Conditions | Awesome Travel & Tour',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-ocean-700 via-ocean-600 to-teal-500 text-white py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold">Terms &amp; Conditions</h1>
            <p className="text-ocean-200 text-sm mt-1">Awesome Travel and Tour Pte. Ltd. &nbsp;·&nbsp; UEN 202519348N</p>
            <p className="text-ocean-200 text-sm mt-1">Last Updated: 6 April 2026</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-10 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">General</h2>
            <p className="leading-relaxed">
              These Terms and Conditions govern all bookings, purchases, and participation in tours and
              services provided by Awesome Travel and Tour Pte. Ltd. By making a booking or payment
              through our website or payment links, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Bookings and Confirmation</h2>
            <p className="leading-relaxed">
              All bookings are subject to availability. A booking is confirmed only upon successful
              payment. Customers will receive confirmation via email or messaging platforms. Customers
              are responsible for ensuring that all booking details provided are accurate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Payment Terms</h2>
            <p className="leading-relaxed">
              Full payment is required at the time of booking unless otherwise stated. Payments may be
              made via approved payment methods. By making payment, you confirm that you are the
              authorised user of the payment method or have obtained permission from the authorised user.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to Itinerary</h2>
            <p className="leading-relaxed">
              We reserve the right to modify tour routes, timing, or itinerary due to weather, safety
              concerns, or operational requirements. Such changes do not entitle customers to refunds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Customer Responsibilities</h2>
            <p className="leading-relaxed">
              Customers agree to follow all instructions provided by guides or staff and to behave in a
              respectful and lawful manner. We reserve the right to refuse participation or remove any
              customer without refund if their behaviour is unsafe or disruptive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the fullest extent permitted by law, the Company shall not be liable for any injury,
              loss, damage, delay, or inconvenience arising from participation in our tours. Participation
              is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Force Majeure</h2>
            <p className="leading-relaxed">
              We shall not be liable for failure or delay in performance due to events beyond our
              control, including natural disasters, government actions, or transportation disruptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Governing Law</h2>
            <p className="leading-relaxed">
              These Terms shall be governed by the laws of Singapore. Any disputes shall be subject to
              the jurisdiction of the courts of Singapore.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
