import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Privacy & Data Protection Policy | Awesome Travel & Tour',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-warm-50">
        <div className="bg-gradient-to-br from-ocean-800 via-ocean-700 to-teal-500 text-white py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold">Privacy &amp; Data Protection Policy</h1>
            <p className="text-ocean-200/80 text-sm mt-2">Last Updated: 6 April 2026</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-10 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Collection of Personal Data</h2>
            <p className="leading-relaxed">
              We collect personal data including name, contact details, and booking information for the
              purpose of processing bookings and providing services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Use of Personal Data</h2>
            <p className="leading-relaxed">
              Personal data will be used for booking confirmation, customer communication, service
              delivery, and compliance with legal requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Disclosure of Personal Data</h2>
            <p className="leading-relaxed">
              We may disclose personal data to payment providers and service partners strictly for the
              purpose of fulfilling bookings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Protection</h2>
            <p className="leading-relaxed">
              We implement reasonable security measures to protect personal data from unauthorised access,
              use, or disclosure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Retention of Data</h2>
            <p className="leading-relaxed">
              We retain personal data only for as long as necessary to fulfil the purposes outlined or
              as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Customer Rights</h2>
            <p className="leading-relaxed">
              Customers may request access to or correction of their personal data by contacting us.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
