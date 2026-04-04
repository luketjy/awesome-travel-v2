/**
 * Manually verify and fix payment status for bookings stuck in 'pending'/'unpaid'
 * because the webhook couldn't reach localhost.
 *
 * Usage:
 *   node scripts/fix-payment-status.mjs
 *   node scripts/fix-payment-status.mjs <bookingId>
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env.local')
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const val = trimmed.slice(eq + 1).trim()
  process.env[key] ??= val
}

// ── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const FOMO_MID     = process.env.FOMO_PAY_MID
const FOMO_PSK     = process.env.FOMO_PAY_PSK
const FOMO_BASE    = process.env.FOMO_PAY_API_BASE ?? 'https://ipg.fomopay.net'

if (!SUPABASE_URL || !SUPABASE_KEY || !FOMO_MID || !FOMO_PSK) {
  console.error('Missing required env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FOMO_PAY_MID, FOMO_PAY_PSK)')
  process.exit(1)
}

const authHeader = 'Basic ' + Buffer.from(`${FOMO_MID}:${FOMO_PSK}`, 'utf8').toString('base64')

// ── Supabase helpers ─────────────────────────────────────────────────────────
async function supabase(path, opts = {}) {
  const url = `${SUPABASE_URL}/rest/v1${path}`
  const res = await fetch(url, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(opts.headers ?? {}),
    },
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${JSON.stringify(data)}`)
  return data
}

// ── FomoPay helpers ──────────────────────────────────────────────────────────
async function fomoGet(path) {
  const res = await fetch(`${FOMO_BASE}${path}`, {
    headers: { Authorization: authHeader },
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(`FomoPay ${res.status}: ${JSON.stringify(data)}`)
  return data
}

async function getOrderByFomoId(fomoOrderId) {
  return fomoGet(`/api/orders/${encodeURIComponent(fomoOrderId)}`)
}

async function findOrdersByMerchantOrderNo(orderNo) {
  const q = new URLSearchParams({
    filter: JSON.stringify({ orderNo }),
    range:  JSON.stringify([0, 5]),
    sort:   JSON.stringify(['createdAt', 'DESC']),
  })
  return fomoGet(`/api/orders?${q}`)
}

async function getTransaction(orderId, txId) {
  return fomoGet(`/api/orders/${encodeURIComponent(orderId)}/transactions/${encodeURIComponent(txId)}`)
}

async function listSaleTransactions(orderId) {
  const q = new URLSearchParams({
    filter: JSON.stringify({ type: 'SALE' }),
    range:  JSON.stringify([0, 25]),
    sort:   JSON.stringify(['createdAt', 'DESC']),
  })
  return fomoGet(`/api/orders/${encodeURIComponent(orderId)}/transactions?${q}`)
}

async function isOrderPaid(order) {
  if (order.status === 'SUCCESS') return true
  if (order.primaryTransactionId) {
    try {
      const tx = await getTransaction(order.id, order.primaryTransactionId)
      if (tx.type?.toUpperCase() === 'SALE' && tx.status === 'SUCCESS') return true
    } catch { /* continue */ }
  }
  try {
    const sales = await listSaleTransactions(order.id)
    if (sales.some(t => t.status === 'SUCCESS')) return true
  } catch { /* ignore */ }
  return false
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function processBooking(booking) {
  const id    = booking.id
  const fomoId = booking.fomo_order_id

  console.log(`\nBooking: ${id}`)
  console.log(`  payment_status : ${booking.payment_status}`)
  console.log(`  status         : ${booking.status}`)
  console.log(`  fomo_order_id  : ${fomoId ?? '(none)'}`)

  // Resolve FomoPay order
  let order = null
  if (fomoId) {
    try {
      order = await getOrderByFomoId(fomoId)
      console.log(`  FomoPay order  : ${order.id} | status=${order.status}`)
    } catch (e) {
      console.warn(`  Could not fetch by fomoId: ${e.message}`)
    }
  }
  if (!order) {
    const list = await findOrdersByMerchantOrderNo(id)
    if (!list?.length) {
      console.log('  No FomoPay order found — skipping.')
      return
    }
    order = list[0]
    try { order = await getOrderByFomoId(order.id) } catch { /* use list result */ }
    console.log(`  FomoPay order  : ${order.id} | status=${order.status} (found by orderNo)`)
  }

  const paid = await isOrderPaid(order)
  console.log(`  isPaid         : ${paid}`)

  let updates = null
  if (paid) {
    updates = { fomo_order_id: order.id, payment_status: 'paid', status: 'confirmed' }
  } else if (['FAIL', 'ERROR', 'CLOSED'].includes(order.status)) {
    updates = { fomo_order_id: order.id, payment_status: 'failed' }
  } else {
    updates = { fomo_order_id: order.id, payment_status: 'pending' }
  }

  console.log(`  Updating DB    :`, updates)
  await supabase(`/bookings?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
  console.log('  Done ✓')
}

async function main() {
  const specificId = process.argv[2]

  let bookings
  if (specificId) {
    bookings = await supabase(`/bookings?id=eq.${encodeURIComponent(specificId)}&select=id,status,payment_status,fomo_order_id`)
    if (!bookings?.length) {
      console.error(`Booking not found: ${specificId}`)
      process.exit(1)
    }
  } else {
    // Find all bookings that might need fixing (pending or unpaid with a fomo_order_id)
    bookings = await supabase(
      `/bookings?or=(payment_status.eq.pending,and(payment_status.eq.unpaid,fomo_order_id.not.is.null))&select=id,status,payment_status,fomo_order_id&order=created_at.desc&limit=20`
    )
    console.log(`Found ${bookings?.length ?? 0} booking(s) to check.`)
  }

  for (const booking of bookings ?? []) {
    await processBooking(booking)
  }

  console.log('\nAll done.')
}

main().catch(e => { console.error(e); process.exit(1) })
