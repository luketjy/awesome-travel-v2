export const dynamic = 'force-dynamic'

import BookingsTable from '@/components/admin/BookingsTable'

export default function AdminBookingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bookings</h1>
      <BookingsTable />
    </div>
  )
}
