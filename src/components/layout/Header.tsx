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

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
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
              className={`text-sm font-medium transition-colors relative pb-0.5 ${
                pathname === link.href
                  ? 'text-ocean-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-ocean-500 after:rounded-full'
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
          className="sm:hidden flex items-center justify-center h-11 w-11 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-ocean-600 bg-ocean-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-1">
            <Link
              href="/tours"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center bg-ocean-500 hover:bg-ocean-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
