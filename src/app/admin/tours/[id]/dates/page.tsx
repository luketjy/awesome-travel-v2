export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/supabase/server'
import DateSlotManager from '@/components/admin/DateSlotManager'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function TourDatesPage({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()
  const { data: tour } = await supabase.from('tours').select('name').eq('id', id).single()

  if (!tour) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/tours"
          className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
        >
          ← Back to Tours
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">
          Manage Dates — {tour.name}
        </h1>
      </div>
      <DateSlotManager tourId={id} />
    </div>
  )
}
