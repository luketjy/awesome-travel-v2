'use client'

import Link from 'next/link'
import SiteLogo from '@/components/layout/SiteLogo'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin/bookings', label: 'Bookings', icon: '📋' },
  { href: '/admin/tours', label: 'Tours', icon: '🗺️' },
  { href: '/admin/invoices', label: 'Invoices', icon: '🧾' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="w-56 shrink-0 bg-ocean-700 min-h-screen flex flex-col">
      <div className="px-5 py-6 border-b border-ocean-600">
        <div className="flex items-center gap-3">
          <SiteLogo variant="onDark" className="h-10 w-10" />
          <div>
            <p className="text-white font-bold text-sm leading-tight">SG Awesome</p>
            <p className="text-ocean-200 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-ocean-500 text-white'
                  : 'text-ocean-100 hover:bg-ocean-600 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-ocean-600">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ocean-100 hover:bg-ocean-600 hover:text-white transition-colors mb-1"
        >
          <span>🌐</span> View Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ocean-100 hover:bg-ocean-600 hover:text-white transition-colors text-left"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}
