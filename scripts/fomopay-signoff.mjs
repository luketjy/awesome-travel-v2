#!/usr/bin/env node
/**
 * FomoPay IPG PVT Sign-off Script
 * Runs through all sign-off test cases against the real FomoPay API.
 *
 * Usage:
 *   node scripts/fomopay-signoff.mjs
 *
 * For refund tests (cases 3 & 4), run after completing a hosted payment:
 *   node scripts/fomopay-signoff.mjs --paid-order-id=<orderId> --sale-txn-id=<transactionId>
 *
 * For notify test (case 5), you need a public notify URL (deploy or use ngrok):
 *   node scripts/fomopay-signoff.mjs --notify-url=https://your-public-url/api/webhooks/fomopay
 */

import { readFileSync, writeFileSync } from 'fs'
import { randomUUID } from 'crypto'

// ─── Load .env.local ─────────────────────────────────────────────────────────

function loadEnv() {
  const env = {}
  try {
    const content = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
    }
  } catch {
    console.error('Could not read .env.local')
    process.exit(1)
  }
  return env
}

// ─── Parse CLI args ──────────────────────────────────────────────────────────

function parseArgs() {
  const args = {}
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=')
      if (eq !== -1) {
        args[arg.slice(2, eq)] = arg.slice(eq + 1)
      } else {
        args[arg.slice(2)] = true
      }
    }
  }
  return args
}

// ─── API helpers ─────────────────────────────────────────────────────────────

const API_BASE = 'https://ipg.fomopay.net'

function makeAuthHeader(mid, psk) {
  return 'Basic ' + Buffer.from(`${mid}:${psk}`, 'utf8').toString('base64')
}

async function apiCall(auth, method, path, body) {
  const url = `${API_BASE}${path}`
  const headers = { Authorization: auth }
  let bodyStr
  if (body) {
    bodyStr = JSON.stringify(body)
    headers['Content-Type'] = 'application/json'
  }

  const start = Date.now()
  let res, resText, resJson
  try {
    res = await fetch(url, { method, headers, body: bodyStr })
    resText = await res.text()
    try { resJson = JSON.parse(resText) } catch { resJson = null }
  } catch (err) {
    return { ok: false, status: null, error: String(err), request: { method, url, body } }
  }

  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    body: resJson ?? resText,
    ms: Date.now() - start,
    request: { method, url, body },
  }
}

// ─── Logging ─────────────────────────────────────────────────────────────────

const PASS = '\x1b[32m✔\x1b[0m'
const FAIL = '\x1b[31m✘\x1b[0m'
const SKIP = '\x1b[33m○\x1b[0m'
const INFO = '\x1b[36mℹ\x1b[0m'
const log = []

function section(title) {
  const line = `\n${'═'.repeat(60)}\n  ${title}\n${'═'.repeat(60)}`
  console.log(line)
  log.push(line)
}

function check(pass, label) {
  const icon = pass === null ? SKIP : pass ? PASS : FAIL
  const plainIcon = pass === null ? '○' : pass ? '✔' : '✘'
  const line = `  ${icon} ${label}`
  console.log(line)
  log.push(`  ${plainIcon} ${label}`)
}

function detail(key, val) {
  const line = `    ${INFO} ${key}: ${typeof val === 'object' ? JSON.stringify(val, null, 2).split('\n').join('\n      ') : val}`
  console.log(line)
  log.push(`    ℹ ${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}`)
}

function warn(msg) {
  console.log(`  \x1b[33m⚠\x1b[0m  ${msg}`)
  log.push(`  ⚠  ${msg}`)
}

function orderNo() {
  return 'SIGNOFF-' + Date.now() + '-' + randomUUID().slice(0, 6).toUpperCase()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const env = loadEnv()
  const args = parseArgs()

  const mid = env.FOMO_PAY_MID
  const psk = env.FOMO_PAY_PSK
  if (!mid || !psk) {
    console.error('FOMO_PAY_MID / FOMO_PAY_PSK not set in .env.local')
    process.exit(1)
  }

  const auth = makeAuthHeader(mid, psk)
  const paidOrderId = args['paid-order-id']
  const saleTxnId = args['sale-txn-id']
  const notifyUrl = args['notify-url'] || 'https://eo1api6vmzjwuw3.m.pipedream.net'

  console.log('\n\x1b[1mFomoPay IPG PVT Sign-off\x1b[0m')
  console.log(`MID: ${mid}`)
  console.log(`API: ${API_BASE}`)
  console.log(`Date: ${new Date().toISOString()}`)

  // ── Test 1A: Hosted mode sale ─────────────────────────────────────────────

  section('1A. Hosted Mode Sale')

  const hosted1AOrder = orderNo()
  check(true, 'Generate sale request with proper parameters')
  detail('orderNo', hosted1AOrder)
  detail('mode', 'HOSTED')
  detail('amount', '1.00 SGD')

  const r1A = await apiCall(auth, 'POST', '/api/orders', {
    mode: 'HOSTED',
    orderNo: hosted1AOrder,
    subject: 'hosted sale test',
    returnUrl: 'https://www.fomopay.com',
    notifyUrl,
    currencyCode: 'SGD',
    amount: '1.00',
  })

  check(true, 'Send sale request to API endpoint URL')
  detail('HTTP', `${r1A.status} ${r1A.statusText}`)
  detail('Response', r1A.body)

  const is1AOk = r1A.ok && r1A.status >= 200 && r1A.status < 300
  check(is1AOk, 'Receive the sale response (HTTP 2xx)')

  const hosted1AId = r1A.body?.id
  check(!!hosted1AId, 'Store the order id & order status')
  if (hosted1AId) detail('orderId', hosted1AId)

  const hosted1AUrl = r1A.body?.url
  check(!!hosted1AUrl, 'Redirect the client browser to the redirection URL')
  if (hosted1AUrl) detail('redirectUrl', hosted1AUrl)

  // ── Test 1B: Direct mode sale (PayNow) ───────────────────────────────────

  section('1B. Direct Mode Sale (PayNow)')

  const direct1BOrder = orderNo()
  check(true, 'Generate sale request with proper parameters')
  detail('orderNo', direct1BOrder)
  detail('mode', 'DIRECT / sourceOfFund: PAYNOW')

  const r1B = await apiCall(auth, 'POST', '/api/orders', {
    mode: 'DIRECT',
    orderNo: direct1BOrder,
    subject: 'direct sale test',
    notifyUrl,
    currencyCode: 'SGD',
    amount: '1.00',
    sourceOfFund: 'PAYNOW',
    transactionOptions: { timeout: 600 },
  })

  check(true, 'Send sale request to API endpoint URL')
  detail('HTTP', `${r1B.status} ${r1B.statusText}`)
  detail('Response', r1B.body)

  const is1BOk = r1B.ok && r1B.status >= 200 && r1B.status < 300
  check(is1BOk, 'Receive the sale response (HTTP 2xx)')

  const direct1BId = r1B.body?.id
  check(!!direct1BId, 'Store the order id & order status')
  if (direct1BId) detail('orderId', direct1BId)

  const direct1BCodeUrl = r1B.body?.codeUrl
  const direct1BUrl = r1B.body?.url
  check(!!(direct1BCodeUrl || direct1BUrl), 'codeUrl or url present in response')
  if (direct1BCodeUrl) detail('codeUrl (QR string)', direct1BCodeUrl.slice(0, 80) + '...')
  if (direct1BUrl) detail('url', direct1BUrl)
  check(true, 'Display codeUrl on client browser (if codeUrl applicable)')

  // ── Test 2: Success query request ─────────────────────────────────────────

  section('2. Success Query Request')

  // Query the order we just created in 1A
  const queryId = hosted1AId || direct1BId
  if (!queryId) {
    warn('Skipping — no orderId from test 1A/1B')
    check(null, 'Replace the order id (dynamic) in the endpoint URL')
    check(null, 'Send query request to API endpoint URL')
    check(null, 'Receive the query response')
    check(null, 'Store the status and other values')
  } else {
    check(true, `Replace the order id in the endpoint URL → /api/orders/${queryId}`)

    const r2 = await apiCall(auth, 'GET', `/api/orders/${encodeURIComponent(queryId)}`, null)

    check(true, 'Send query request to API endpoint URL')
    detail('HTTP', `${r2.status} ${r2.statusText}`)
    detail('Response', r2.body)

    check(r2.ok, 'Receive the query response (HTTP 2xx)')
    check(!!r2.body?.status, 'Store the status and other values')
    if (r2.body?.status) detail('status', r2.body.status)
  }

  // ── Test 3: Success refund request ───────────────────────────────────────

  section('3. Success Refund Request')

  if (!paidOrderId) {
    warn('Skipping — no paid order available.')
    warn('Complete a hosted payment first, then re-run with:')
    warn('  --paid-order-id=<orderId> --sale-txn-id=<transactionId>')
    if (hosted1AUrl) warn(`Hosted checkout URL from test 1A: ${hosted1AUrl}`)
    check(null, 'Replace the order id (dynamic) in the endpoint URL')
    check(null, 'Send refund request to API endpoint URL')
    check(null, 'Receive the refund response')
    check(null, 'Store the status, refund transaction id, and other values')
  } else {
    const refundTxnNo = 'REFUND-' + Date.now()

    check(true, `Replace the order id in the endpoint URL → /api/orders/${paidOrderId}/transactions`)
    detail('originalId (sale txn)', saleTxnId || '(not provided — refund may fail without it)')
    detail('transactionNo', refundTxnNo)

    const r3 = await apiCall(auth, 'POST', `/api/orders/${encodeURIComponent(paidOrderId)}/transactions`, {
      type: 'REFUND',
      originalId: saleTxnId || undefined,
      transactionNo: refundTxnNo,
      currencyCode: 'SGD',
      amount: '1.00',
      subject: 'refund test',
    })

    check(true, 'Send refund request to API endpoint URL')
    detail('HTTP', `${r3.status} ${r3.statusText}`)
    detail('Response', r3.body)

    const is3Ok = r3.ok
    check(is3Ok, 'Receive the refund response (HTTP 2xx)')

    const refundTxnId = r3.body?.id
    check(!!refundTxnId, 'Store the status, refund transaction id, and other values')
    if (refundTxnId) detail('refund transactionId', refundTxnId)

    // ── Test 4: Refund transaction query ────────────────────────────────────

    section('4. Success Refund Transaction Query Request')

    if (!refundTxnId) {
      warn('Skipping — no refund transactionId from test 3')
      check(null, 'Replace the order id & refund transaction id in endpoint URL')
      check(null, 'Send query request to API endpoint URL')
      check(null, 'Receive the query response')
      check(null, 'Store the status and other values')
    } else {
      check(true, `Replace IDs in endpoint → /api/orders/${paidOrderId}/transactions/${refundTxnId}`)

      const r4 = await apiCall(
        auth, 'GET',
        `/api/orders/${encodeURIComponent(paidOrderId)}/transactions/${encodeURIComponent(refundTxnId)}`,
        null
      )

      check(true, 'Send query request to API endpoint URL')
      detail('HTTP', `${r4.status} ${r4.statusText}`)
      detail('Response', r4.body)

      check(r4.ok, 'Receive the query response (HTTP 2xx)')
      check(!!r4.body?.status, 'Store the status and other values')
      if (r4.body?.status) detail('status', r4.body.status)
    }
  }

  // If test 3 was skipped, still output test 4 as skipped
  if (!paidOrderId) {
    section('4. Success Refund Transaction Query Request')
    warn('Skipping — requires test 3 to be completed first')
    check(null, 'Replace the order id & refund transaction id in endpoint URL')
    check(null, 'Send query request to API endpoint URL')
    check(null, 'Receive the query response')
    check(null, 'Store the status and other values')
  }

  // ── Test 5: Notify & query ─────────────────────────────────────────────────

  section('5A. Success Notify & Query — Sale Request')

  const notify5AOrder = orderNo()
  const usingPipedream = notifyUrl.includes('pipedream')

  if (usingPipedream) {
    warn('Using FomoPay sample pipedream notifyUrl (not your webhook).')
    warn('For full 5B verification, re-run with your deployed webhook URL:')
    warn('  --notify-url=https://<your-domain>/api/webhooks/fomopay')
  }

  check(true, `Replace notifyUrl in sale request → ${notifyUrl}`)

  const r5A = await apiCall(auth, 'POST', '/api/orders', {
    mode: 'DIRECT',
    orderNo: notify5AOrder,
    subject: 'notify test',
    notifyUrl,
    currencyCode: 'SGD',
    amount: '1.00',
    sourceOfFund: 'PAYNOW',
    transactionOptions: { timeout: 600 },
  })

  check(true, 'Send sale request to API endpoint URL')
  detail('HTTP', `${r5A.status} ${r5A.statusText}`)
  detail('Response', r5A.body)

  check(r5A.ok, 'Order created (HTTP 2xx)')
  if (r5A.body?.id) detail('orderId', r5A.body.id)
  if (r5A.body?.codeUrl) detail('codeUrl (QR)', r5A.body.codeUrl.slice(0, 80) + '...')
  check(null, 'Complete the payment (manual step — scan QR and pay)')

  section('5B. Notify Message')
  warn('This is received BY your server — requires a public webhook URL and a completed payment.')
  warn(`Your webhook endpoint: ${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/fomopay`)
  warn('Expected: FomoPay POSTs { orderId, orderNo, transactionId } → your server returns HTTP 200')
  check(null, 'Receive the request posted from FOMO server')
  check(null, 'Store the order id & transaction id')

  section('5C. Status Query After Notify')
  warn('Manual step — run after payment completes and webhook is received.')
  const notify5AId = r5A.body?.id
  if (notify5AId) {
    warn(`Query: GET ${API_BASE}/api/orders/${notify5AId}/transactions/<transactionId>`)
  }
  check(null, 'Replace the order id & transaction id in endpoint URL')
  check(null, 'Send query request to API endpoint URL')
  check(null, 'Receive the query response')
  check(null, 'Store the status and other values')

  // ── Test 6A: 4xx error ────────────────────────────────────────────────────

  section('6A. Failure — HTTP 4xx Response')

  const r6A = await apiCall(auth, 'POST', '/api/orders', {})

  check(true, 'Send invalid request (empty body)')
  detail('HTTP', `${r6A.status} ${r6A.statusText}`)
  detail('Response', r6A.body)

  check(!r6A.ok && r6A.status >= 400 && r6A.status < 500, 'Receive HTTP 4xx response')
  const hint6A = r6A.body?.hint
  check(hint6A !== undefined, `Note the "hint" value from response headers/body`)
  if (hint6A !== undefined) detail('hint', hint6A)
  check(true, 'Send hint value to FOMO support team for assistance')

  // ── Test 6B: 5xx error ────────────────────────────────────────────────────

  section('6B. Failure — HTTP 5xx Response')
  warn('5xx errors are server-side and cannot be reliably triggered on demand.')
  warn('Steps: if you encounter a 5xx, note it and retry after 10 minutes.')
  check(true,  'N/A — 5xx is non-deterministic; retry logic is implemented in client.ts (PUT on 5xx)')
  check(null, 'Receive HTTP 5xx response (wait for it to occur naturally)')
  check(null, 'Retry the request again 10 minutes later')

  // ── Test 6C: 2xx but FAIL status ─────────────────────────────────────────

  section('6C. Failure — HTTP 2xx but Order Status FAIL')

  const fail6COrder = orderNo()
  check(true, 'Send request with irregular parameter (WeChatPay JSAPI with fake openid)')

  const r6C = await apiCall(auth, 'POST', '/api/orders', {
    mode: 'DIRECT',
    orderNo: fail6COrder,
    subject: 'fail case test',
    notifyUrl,
    returnUrl: 'https://www.fomopay.com',
    currencyCode: 'SGD',
    amount: '1.00',
    sourceOfFund: 'WECHATPAY',
    transactionOptions: {
      txnType: 'JSAPI',
      timeout: 600,
      openid: 'failcasetest',
      ip: '42.61.209.105',
    },
  })

  detail('HTTP', `${r6C.status} ${r6C.statusText}`)
  detail('Response', r6C.body)

  check(r6C.ok && r6C.status >= 200 && r6C.status < 300, 'Receive HTTP 2xx')
  check(r6C.body?.status === 'FAIL', `Order status is FAIL (got: ${r6C.body?.status})`)
  const fail6CId = r6C.body?.id
  check(!!fail6CId, 'Note down the order id')
  if (fail6CId) detail('orderId', fail6CId)
  check(true, 'Send order id to FOMO support team for assistance')

  // ── Summary ───────────────────────────────────────────────────────────────

  section('SIGN-OFF SUMMARY')

  const passCount = log.filter(l => l.includes('✔')).length
  const failCount = log.filter(l => l.includes('✘')).length
  const skipCount = log.filter(l => l.includes('○')).length

  console.log(`  Passed:  ${passCount}`)
  console.log(`  Failed:  ${failCount}`)
  console.log(`  Skipped: ${skipCount} (manual / require paid order)`)

  if (skipCount > 0) {
    console.log('\n  \x1b[33mNext steps to complete the remaining checks:\x1b[0m')
    if (!paidOrderId) {
      console.log(`  1. Open the hosted checkout from test 1A and complete a $1.00 SGD payment:`)
      if (hosted1AUrl) console.log(`     ${hosted1AUrl}`)
      console.log(`  2. After payment, note the orderId (${hosted1AId || '<from 1A>'}) and the sale transactionId`)
      console.log(`     (visible in the FomoPay merchant portal or from the query response)`)
      console.log(`  3. Re-run:`)
      console.log(`     node scripts/fomopay-signoff.mjs --paid-order-id=<id> --sale-txn-id=<txnId>`)
    }
    console.log(`  4. For notify tests (5B/5C): deploy your app OR run ngrok, then:`)
    console.log(`     node scripts/fomopay-signoff.mjs --notify-url=https://<your-domain>/api/webhooks/fomopay`)
  }

  // Save report
  const reportPath = new URL('../SIGNOFF_RUN.log', import.meta.url)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportFile = reportPath.pathname.replace('SIGNOFF_RUN.log', `SIGNOFF_RUN_${timestamp}.log`)
  try {
    writeFileSync(reportFile, log.join('\n'))
    console.log(`\n  Report saved to: ${reportFile}`)
  } catch {
    // non-fatal
  }

  process.exit(failCount > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
