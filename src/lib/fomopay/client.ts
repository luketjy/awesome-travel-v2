import { FOMO_PAY_API_BASE, getFomoCredentials } from './config'
import { fomoBasicAuthHeader } from './auth'
import type { FomoErrorBody, FomoHostedOrderSuccess, FomoOrderStatus } from './types'

async function parseJsonOrText(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

export class FomoPayApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'FomoPayApiError'
    this.status = status
    this.body = body
  }
}

export async function fomoRequestJson<T>(
  path: string,
  init: RequestInit & { method?: string }
): Promise<T> {
  if (!getFomoCredentials()) {
    throw new FomoPayApiError('FOMO Pay not configured', 503, null)
  }

  const url = `${FOMO_PAY_API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(init.headers)
  headers.set('Authorization', fomoBasicAuthHeader())
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, { ...init, headers })
  const data = await parseJsonOrText(res)

  if (!res.ok) {
    const msg =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as FomoErrorBody).message)
        : res.statusText
    throw new FomoPayApiError(msg || 'FOMO Pay request failed', res.status, data)
  }

  return data as T
}

export async function createHostedOrder(body: Record<string, unknown>): Promise<FomoHostedOrderSuccess> {
  return fomoRequestJson<FomoHostedOrderSuccess>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

async function putHostedOrder(body: Record<string, unknown>): Promise<FomoHostedOrderSuccess> {
  return fomoRequestJson<FomoHostedOrderSuccess>('/api/orders', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

function toHostedSuccess(
  body: Record<string, unknown>,
  full: FomoOrderQueryResult
): FomoHostedOrderSuccess {
  const url = full.url
  if (!url) {
    throw new FomoPayApiError('Order has no checkout URL', 500, full)
  }
  return {
    id: full.id,
    orderNo: full.orderNo,
    mode: 'HOSTED',
    subject: String(body.subject ?? ''),
    amount: full.amount,
    currencyCode: full.currencyCode,
    status: full.status,
    url,
  }
}

/** POST; on 5xx retry PUT with same JSON. On 409 (duplicate orderNo), load existing order. */
export async function createOrResumeHostedOrder(
  body: Record<string, unknown>
): Promise<FomoHostedOrderSuccess> {
  const orderNo = String(body.orderNo)

  try {
    return await createHostedOrder(body)
  } catch (e) {
    if (e instanceof FomoPayApiError && e.status >= 500) {
      return putHostedOrder(body)
    }
    if (e instanceof FomoPayApiError && e.status === 409) {
      const list = await findOrdersByMerchantOrderNo(orderNo)
      const first = list[0]
      if (!first) throw e
      const full = first.url ? first : await getOrderById(first.id)
      return toHostedSuccess(body, full)
    }
    throw e
  }
}

export interface FomoOrderQueryResult {
  id: string
  orderNo: string
  mode: string
  status: FomoOrderStatus
  amount: string
  currencyCode: string
  url?: string
  primaryTransactionId?: string
}

export async function getOrderById(orderId: string): Promise<FomoOrderQueryResult> {
  return fomoRequestJson<FomoOrderQueryResult>(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
  })
}

export interface FomoTransactionQueryResult {
  id: string
  type: string
  status: string
}

export async function getTransaction(
  orderId: string,
  transactionId: string
): Promise<FomoTransactionQueryResult> {
  return fomoRequestJson<FomoTransactionQueryResult>(
    `/api/orders/${encodeURIComponent(orderId)}/transactions/${encodeURIComponent(transactionId)}`,
    { method: 'GET' }
  )
}

export async function findOrdersByMerchantOrderNo(orderNo: string): Promise<FomoOrderQueryResult[]> {
  const filter = JSON.stringify({ orderNo })
  const range = JSON.stringify([0, 10])
  const sort = JSON.stringify(['createdAt', 'DESC'])
  const q = new URLSearchParams({
    filter,
    range,
    sort,
  })
  return fomoRequestJson<FomoOrderQueryResult[]>(`/api/orders?${q.toString()}`, {
    method: 'GET',
  })
}

/** List transactions for an order (e.g. filter `{ type: 'SALE' }`). */
export async function listOrderTransactions(
  orderId: string,
  filterObj: Record<string, string>
): Promise<FomoTransactionQueryResult[]> {
  const filter = JSON.stringify(filterObj)
  const range = JSON.stringify([0, 25])
  const sort = JSON.stringify(['createdAt', 'DESC'])
  const q = new URLSearchParams({ filter, range, sort })
  return fomoRequestJson<FomoTransactionQueryResult[]>(
    `/api/orders/${encodeURIComponent(orderId)}/transactions?${q.toString()}`,
    { method: 'GET' }
  )
}

/**
 * Resolve the FOMO order for this booking: prefer stored gateway id, else search by merchant orderNo.
 */
export async function resolveOrderForBooking(
  bookingId: string,
  fomoOrderId: string | null | undefined
): Promise<FomoOrderQueryResult | null> {
  if (fomoOrderId?.trim()) {
    try {
      return await getOrderById(fomoOrderId.trim())
    } catch {
      /* fall through to search by orderNo */
    }
  }
  const list = await findOrdersByMerchantOrderNo(bookingId)
  const first = list[0]
  if (!first) return null
  try {
    return await getOrderById(first.id)
  } catch {
    return first
  }
}

/**
 * True if the gateway considers the sale captured: order SUCCESS, primary SALE tx SUCCESS,
 * or any SALE transaction on the order is SUCCESS (helps UAT when order lags).
 */
export async function isOrderPaidAtGateway(
  order: FomoOrderQueryResult,
  hintTransactionId?: string | null
): Promise<boolean> {
  if (order.status === 'SUCCESS') return true

  if (hintTransactionId?.trim()) {
    try {
      const tx = await getTransaction(order.id, hintTransactionId.trim())
      if (tx.type?.toUpperCase() === 'SALE' && tx.status === 'SUCCESS') return true
    } catch {
      /* continue */
    }
  }

  if (order.primaryTransactionId) {
    try {
      const tx = await getTransaction(order.id, order.primaryTransactionId)
      if (tx.type?.toUpperCase() === 'SALE' && tx.status === 'SUCCESS') return true
    } catch {
      /* continue */
    }
  }

  try {
    const sales = await listOrderTransactions(order.id, { type: 'SALE' })
    if (sales.some((t) => t.status === 'SUCCESS')) return true
  } catch {
    /* ignore */
  }

  return false
}
