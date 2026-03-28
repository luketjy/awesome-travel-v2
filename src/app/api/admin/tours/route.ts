import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, price, category, duration, images } = body

  if (!name || !description || !price || !category || !duration) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServerClient()
  const slug = slugify(name)

  const { data, error } = await supabase
    .from('tours')
    .insert({ name, slug, description, price: Number(price), category, duration, images: images ?? [] })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
