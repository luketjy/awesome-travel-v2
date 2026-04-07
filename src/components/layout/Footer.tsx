import Link from 'next/link'
import SiteLogo from '@/components/layout/SiteLogo'

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, '')
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}` : null
  const contactUrl = process.env.NEXT_PUBLIC_CONTACT_URL?.trim() ?? whatsappHref

  return (
    <footer className="bg-ocean-700 text-ocean-100 pt-14 pb-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 pb-10">

          {/* Brand */}
          <div className="sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-3">
              <SiteLogo variant="onDark" className="h-14 w-14" />
              <span className="font-bold text-white text-lg leading-tight">
                SG Awesome
                <br />
                <span className="text-ocean-200 text-sm font-normal">Travels &amp; Tours</span>
              </span>
            </Link>
            <p className="text-ocean-200 text-sm leading-relaxed max-w-xs">
              Your gateway to unforgettable experiences in Singapore and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Explore</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/tours" className="hover:text-white transition-colors">All Tours</Link></li>
              <li><Link href="/booking" className="hover:text-white transition-colors">Book a Tour</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Legal</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund &amp; Cancellation</Link></li>
              <li><Link href="/delivery-policy" className="hover:text-white transition-colors">Delivery Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Get in Touch</p>
            <ul className="space-y-3 text-sm">
              {contactUrl && (
                <li>
                  <a
                    href={contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M13.6 2.4A7.93 7.93 0 0 0 8 0a7.99 7.99 0 0 0-6.91 11.99L0 16l4.11-1.08A7.99 7.99 0 0 0 16 8c0-2.14-.83-4.14-2.4-5.6zM8 14.63a6.63 6.63 0 0 1-3.38-.93l-.24-.14-2.44.64.65-2.38-.16-.25A6.62 6.62 0 0 1 8 1.37c1.77 0 3.43.69 4.68 1.94A6.56 6.56 0 0 1 14.63 8c0 3.65-2.97 6.63-6.63 6.63zm3.63-4.96c-.2-.1-1.18-.58-1.36-.65-.18-.07-.32-.1-.45.1-.13.2-.51.65-.62.78-.11.13-.23.15-.43.05-.2-.1-.84-.31-1.6-.99a6 6 0 0 1-1.11-1.37c-.11-.2-.01-.3.09-.4l.3-.34c.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.45-1.08-.62-1.47-.16-.4-.33-.34-.45-.35h-.39c-.13 0-.35.05-.53.25-.18.2-.7.69-.7 1.67s.72 1.93.82 2.07c.1.13 1.41 2.16 3.42 3.03.48.21.85.33 1.14.42.48.15.92.13 1.26.08.38-.06 1.18-.48 1.35-.95.16-.47.16-.87.11-.95-.05-.08-.18-.13-.38-.23z" fill="currentColor" />
                    </svg>
                    WhatsApp Us
                  </a>
                </li>
              )}
              <li className="text-ocean-300 text-xs leading-relaxed">
                Based in Singapore.<br />
                Tours available daily.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-ocean-600 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ocean-300">
          <p>© {new Date().getFullYear()} Awesome Travel and Tour Pte. Ltd. (UEN 202519348N). All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refunds</Link>
            <Link href="/delivery-policy" className="hover:text-white transition-colors">Delivery</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
