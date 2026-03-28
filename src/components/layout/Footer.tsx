import Link from 'next/link'
import SiteLogo from '@/components/layout/SiteLogo'

export default function Footer() {
  return (
    <footer className="bg-ocean-700 text-ocean-100 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 mb-2">
              <SiteLogo variant="onDark" className="h-14 w-14" />
              <span className="font-bold text-white text-lg leading-tight">
                SG Awesome
                <br />
                <span className="text-ocean-200 text-sm font-normal">Travels & Tours</span>
              </span>
            </Link>
            <p className="text-ocean-200 text-sm mt-1">
              Your gateway to unforgettable experiences.
            </p>
          </div>
          <div className="text-sm space-y-1">
            <p className="font-semibold text-white mb-2">Quick Links</p>
            <a href="/" className="block hover:text-white transition-colors">Home</a>
            <a href="/tours" className="block hover:text-white transition-colors">Tours</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-ocean-600 text-center text-xs text-ocean-300">
          © {new Date().getFullYear()} SG Awesome Travels & Tours. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
