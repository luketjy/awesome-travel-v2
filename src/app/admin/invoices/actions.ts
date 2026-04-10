'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/invoices')
  redirect('/admin/invoices')
}
