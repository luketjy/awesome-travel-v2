export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { renderInvoiceHtml } from '@/lib/invoice/template'
import InvoicePrintButton from '@/components/admin/InvoicePrintButton'
import InvoiceDeleteButton from '@/components/admin/InvoiceDeleteButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminInvoiceDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: inv } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()

  if (!inv) notFound()

  const tourDateStr = inv.tour_date
    ? new Intl.DateTimeFormat('en-SG', { day: '2-digit', month: 'short', year: 'numeric' }).format(
        new Date(inv.tour_date + 'T00:00:00')
      )
    : '—'

  const invoiceDateStr = new Intl.DateTimeFormat('en-SG', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(inv.created_at))

  const html = renderInvoiceHtml({
    invoiceNumber:  inv.invoice_number,
    invoiceDate:    invoiceDateStr,
    paymentStatus:  inv.payment_status === 'paid' ? 'paid' : 'pending',
    customerName:   inv.customer_name,
    customerEmail:  inv.customer_email,
    customerPhone:  inv.customer_phone ?? '',
    tourName:       inv.tour_name,
    tourDate:       tourDateStr,
    numPax:         inv.num_pax,
    unitPrice:      Number(inv.unit_price),
    totalPrice:     Number(inv.total_price),
    transactionRef: inv.transaction_ref ?? null,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/invoices" className="text-sm text-ocean-600 hover:text-ocean-700 font-medium">
            ← Invoices
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-mono font-semibold text-gray-700">{inv.invoice_number}</span>
        </div>
        <div className="flex items-center gap-3">
          <InvoiceDeleteButton id={inv.id} invoiceNumber={inv.invoice_number} />
          <InvoicePrintButton iframeId="invoice-frame" />
        </div>
      </div>

      {/* Render invoice HTML in an iframe for accurate preview and printing */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <iframe
          id="invoice-frame"
          srcDoc={html}
          title={`Invoice ${inv.invoice_number}`}
          className="w-full"
          style={{ height: '900px', border: 'none' }}
        />
      </div>
    </div>
  )
}
