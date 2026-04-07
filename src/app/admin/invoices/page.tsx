export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  customer_email: string
  tour_name: string
  tour_date: string | null
  num_pax: number
  total_price: number
  payment_status: string
  email_sent: boolean
  created_at: string
}

async function getInvoices(): Promise<Invoice[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Invoice[]
}

function formatDate(str: string) {
  return new Intl.DateTimeFormat('en-SG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(str))
}

function formatSGD(n: number) {
  return new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(n)
}

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        <span className="text-sm text-gray-500">{invoices.length} total</span>
      </div>

      {invoices.length === 0 ? (
        <p className="text-gray-500">No invoices yet. They are created automatically when a payment is confirmed.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Invoice</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Tour</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Email</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 font-semibold">
                    {inv.invoice_number}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{inv.customer_name}</p>
                    <p className="text-xs text-gray-400">{inv.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{inv.tour_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(inv.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    {formatSGD(inv.total_price)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      inv.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {inv.email_sent ? (
                      <span className="text-green-500 text-xs">Sent</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/invoices/${inv.id}`}
                      className="text-xs text-ocean-600 hover:text-ocean-700 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
