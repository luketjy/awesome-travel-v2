'use client'

import Link from 'next/link'
import SiteLogo from '@/components/layout/SiteLogo'
import TranslateToggle from '@/components/ui/TranslateToggle'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/tours', label: 'Tours' },
  { href: '/contact', label: 'Contact Us' },
]

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <SiteLogo className="h-11 w-11 sm:h-12 sm:w-12" />
          <div className="leading-tight min-w-0">
            <p className="font-bold text-ocean-600 text-sm truncate">SG Awesome</p>
            <p className="text-gray-500 text-xs truncate">Travels & Tours</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-ocean-600'
                  : 'text-gray-600 hover:text-ocean-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <TranslateToggle />
          <Link
            href="/tours"
            className="bg-ocean-500 hover:bg-ocean-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Book Now
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-gray-600"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm font-medium ${
                pathname === link.href ? 'text-ocean-600' : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/tours"
            onClick={() => setMenuOpen(false)}
            className="block bg-ocean-500 text-white text-sm font-semibold px-4 py-2 rounded-lg text-center"
          >
            Book Now
          </Link>
        </div>
      )}
    </header>
  )
}
