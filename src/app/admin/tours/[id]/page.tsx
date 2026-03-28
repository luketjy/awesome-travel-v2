export const dynamic = 'force-dynamic'

import { createServerClient } from '@/lib/supabase/server'
import TourForm from '@/components/admin/TourForm'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function EditTourPage({ params }: Props) {
  const { id } = await params
  const supabase = createServerClient()
  const { data: tour } = await supabase.from('tours').select('*').eq('id', id).single()

  if (!tour) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Tour</h1>
      <TourForm tour={tour} />
    </div>
  )
}
