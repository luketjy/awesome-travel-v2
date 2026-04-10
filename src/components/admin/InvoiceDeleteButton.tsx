'use client'

import { useTransition } from 'react'
import { deleteInvoice } from '@/app/admin/invoices/actions'

export default function InvoiceDeleteButton({ id, invoiceNumber }: { id: string; invoiceNumber: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) return
    startTransition(() => deleteInvoice(id))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
