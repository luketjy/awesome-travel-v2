import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    name, description, price, category, duration, images,
    tour_type, destination, highlights, inclusions, exclusions,
    itinerary, difficulty, min_pax, max_pax, pricing_options,
    suitability_tags, enquiry_only,
  } = body

  if (!name || !description || !price || !category || !duration) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (tour_type === 'worldwide' && !destination) {
    return Response.json({ error: 'Destination is required for worldwide packages' }, { status: 400 })
  }

  const supabase = createServerClient()
  const slug = slugify(name)

  const { data, error } = await supabase
    .from('tours')
    .insert({
      name, slug, description,
      price: Number(price),
      category, duration,
      images: images ?? [],
      tour_type: tour_type ?? 'local',
      destination: destination ?? null,
      highlights: highlights ?? null,
      inclusions: inclusions ?? null,
      exclusions: exclusions ?? null,
      itinerary: itinerary ?? null,
      difficulty: difficulty ?? null,
      min_pax: min_pax ? Number(min_pax) : null,
      max_pax: max_pax ? Number(max_pax) : null,
      pricing_options: pricing_options ?? null,
      suitability_tags: suitability_tags ?? null,
      enquiry_only: enquiry_only ?? false,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
