export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: string
  paymentStatus: 'paid' | 'pending'
  customerName: string
  customerEmail: string
  customerPhone: string
  tourName: string
  tourDate: string
  numPax: number
  unitPrice: number
  totalPrice: number
  transactionRef?: string | null
}

function formatSGD(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
  }).format(amount)
}

const LOGO_URL = 'https://www.sgawesometravel.com/logo.png'

const TERMS = [
  {
    title: 'Booking Confirmation',
    body: 'All bookings are confirmed only upon successful payment. An email or WhatsApp confirmation will be sent to the customer.',
  },
  {
    title: 'Authorisation of Payment',
    body: 'By making payment, the customer confirms that they are the authorised cardholder or have permission from the cardholder to complete this transaction.',
  },
  {
    title: 'No-Show & Late Policy',
    body: 'Customers who fail to show up or arrive late beyond 15 minutes may be considered a no-show. No refunds will be provided in such cases.',
  },
  {
    title: 'Cancellation Policy',
    body: 'All bookings are non-refundable unless otherwise stated. Any request for changes is subject to availability and approval.',
  },
  {
    title: 'Service Delivery',
    body: 'The services listed in this invoice will be delivered on the specified date and time. By attending the tour, the customer acknowledges that the service has been fulfilled.',
  },
  {
    title: 'Liability Disclaimer',
    body: 'Awesome Travel & Tour Pte. Ltd. shall not be liable for any indirect or consequential losses, including missed connections, personal loss, or travel disruptions.',
  },
  {
    title: 'Fraud & Disputes',
    body: 'In the event of any payment dispute or chargeback, this invoice, along with booking confirmation records, will be used as proof of transaction and service agreement. By proceeding with payment, the customer agrees to all Terms & Conditions stated above.',
  },
]

export function renderInvoiceHtml(data: InvoiceData): string {
  const {
    invoiceNumber, invoiceDate, paymentStatus,
    customerName, customerEmail, customerPhone,
    tourName, tourDate, numPax, unitPrice, totalPrice, transactionRef,
  } = data

  const statusColor = paymentStatus === 'paid' ? '#16a34a' : '#d97706'
  const statusLabel = paymentStatus === 'paid' ? 'Paid' : 'Pending'

  const termsRows = TERMS.map((t, i) => `
    <tr>
      <td style="padding:4px 0 0 0;font-size:12px;color:#374151;vertical-align:top;">
        <strong>${i + 1}. ${t.title}</strong><br/>
        <span style="margin-left:16px;display:inline-block;">• ${t.body}</span>
      </td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
<tr><td align="center">
<table width="680" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.08);">

  <!-- Header -->
  <tr>
    <td style="padding:32px 40px 24px 40px;border-bottom:2px solid #e5e7eb;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;">
            <div style="font-size:11px;color:#6b7280;">TAX INVOICE</div>
          </td>
          <td align="right" style="vertical-align:top;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;padding-right:16px;text-align:right;">
                  <div style="font-size:13px;font-weight:bold;color:#111827;line-height:1.6;">Awesome Travel &amp; Tour Pte. Ltd.</div>
                  <div style="font-size:12px;color:#374151;line-height:1.6;">202519348N</div>
                  <div style="font-size:12px;color:#374151;line-height:1.6;">awesometraveltoursingapore@gmail.com</div>
                  <div style="font-size:12px;color:#374151;line-height:1.6;">WA: +65 85484800</div>
                  <div style="font-size:12px;color:#374151;line-height:1.6;">www.sgawesometravel.com</div>
                </td>
                <td style="vertical-align:top;">
                  <img src="${LOGO_URL}" alt="Awesome Travel Logo" width="72" height="72" style="border-radius:50%;display:block;"/>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Invoice meta -->
  <tr>
    <td style="padding:24px 40px 0 40px;">
      <table cellpadding="0" cellspacing="4">
        <tr><td style="font-size:13px;padding-right:8px;"><strong>Invoice No:</strong></td><td style="font-size:13px;">${invoiceNumber}</td></tr>
        <tr><td style="font-size:13px;padding-right:8px;"><strong>Invoice Date:</strong></td><td style="font-size:13px;">${invoiceDate}</td></tr>
        <tr>
          <td style="font-size:13px;padding-right:8px;"><strong>Payment Status:</strong></td>
          <td style="font-size:13px;font-weight:bold;color:${statusColor};">${statusLabel}</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Bill To -->
  <tr>
    <td style="padding:20px 40px 0 40px;">
      <div style="font-size:13px;font-weight:bold;color:#111827;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;">Bill To</div>
      <table cellpadding="0" cellspacing="3">
        <tr><td style="font-size:13px;padding-right:8px;"><strong>Customer Name:</strong></td><td style="font-size:13px;">${customerName}</td></tr>
        <tr><td style="font-size:13px;padding-right:8px;"><strong>Email:</strong></td><td style="font-size:13px;">${customerEmail}</td></tr>
        <tr><td style="font-size:13px;padding-right:8px;"><strong>Phone:</strong></td><td style="font-size:13px;">${customerPhone || '—'}</td></tr>
      </table>
    </td>
  </tr>

  <!-- Booking Details -->
  <tr>
    <td style="padding:24px 40px 0 40px;">
      <div style="font-size:13px;font-weight:bold;color:#111827;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;">Booking Details</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #e5e7eb;">
            <th align="left"  style="font-size:12px;color:#6b7280;padding:6px 8px 8px 0;font-weight:600;">Description</th>
            <th align="left"  style="font-size:12px;color:#6b7280;padding:6px 8px 8px 8px;font-weight:600;">Date</th>
            <th align="center"style="font-size:12px;color:#6b7280;padding:6px 8px 8px 8px;font-weight:600;">Pax</th>
            <th align="right" style="font-size:12px;color:#6b7280;padding:6px 0  8px 8px;font-weight:600;">Unit Price (SGD)</th>
            <th align="right" style="font-size:12px;color:#6b7280;padding:6px 0  8px 8px;font-weight:600;">Amount (SGD)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="font-size:13px;padding:10px 8px 10px 0;color:#111827;">${tourName}</td>
            <td style="font-size:13px;padding:10px 8px;color:#374151;white-space:nowrap;">${tourDate}</td>
            <td align="center" style="font-size:13px;padding:10px 8px;color:#374151;">${numPax}</td>
            <td align="right" style="font-size:13px;padding:10px 0 10px 8px;color:#374151;">${formatSGD(unitPrice)}</td>
            <td align="right" style="font-size:13px;padding:10px 0 10px 8px;color:#111827;font-weight:600;">${formatSGD(totalPrice)}</td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>

  <!-- Payment Summary -->
  <tr>
    <td style="padding:24px 40px 0 40px;">
      <div style="font-size:13px;font-weight:bold;color:#111827;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">Payment Summary</div>
      <table cellpadding="0" cellspacing="4">
        <tr><td style="font-size:13px;padding-right:16px;color:#6b7280;">Subtotal:</td><td style="font-size:13px;">SGD ${formatSGD(totalPrice)}</td></tr>
        <tr><td style="font-size:13px;padding-right:16px;color:#6b7280;">GST (if applicable):</td><td style="font-size:13px;">Included</td></tr>
        <tr style="border-top:1px solid #e5e7eb;">
          <td style="font-size:14px;padding-right:16px;padding-top:8px;font-weight:bold;color:#111827;">TOTAL:</td>
          <td style="font-size:14px;padding-top:8px;font-weight:bold;color:#0369a1;">SGD ${formatSGD(totalPrice)}</td>
        </tr>
        <tr><td colspan="2" style="padding-top:10px;"></td></tr>
        <tr><td style="font-size:13px;padding-right:16px;color:#6b7280;">Payment Method:</td><td style="font-size:13px;">FomoPay (Credit Card / PayNow)</td></tr>
        ${transactionRef ? `<tr><td style="font-size:13px;padding-right:16px;color:#6b7280;">Transaction Ref:</td><td style="font-size:13px;font-family:monospace;">${transactionRef}</td></tr>` : ''}
      </table>
    </td>
  </tr>

  <!-- Terms -->
  <tr>
    <td style="padding:24px 40px 0 40px;">
      <div style="font-size:13px;font-weight:bold;color:#111827;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;">Terms &amp; Conditions (Important)</div>
      <table width="100%" cellpadding="0" cellspacing="0">${termsRows}</table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:32px 40px;margin-top:24px;border-top:1px solid #e5e7eb;text-align:center;">
      <div style="font-size:11px;color:#9ca3af;">This is a system-generated invoice. For queries, contact us at awesometraveltoursingapore@gmail.com or WhatsApp +65 85484800.</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:4px;">Awesome Travel &amp; Tour Pte. Ltd. &nbsp;·&nbsp; UEN 202519348N &nbsp;·&nbsp; Singapore</div>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
