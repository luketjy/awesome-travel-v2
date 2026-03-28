import { createHmac, timingSafeEqual } from 'node:crypto'
import { getFomoCredentials } from './config'

const NONCE_TTL_MS = 300_000
const seenNonces = new Map<string, number>()

function pruneNonces(now: number) {
  for (const [n, t] of seenNonces) {
    if (now - t > NONCE_TTL_MS) seenNonces.delete(n)
  }
}

function parseAuthHeader(value: string | null): Record<string, string> | null {
  if (!value) return null
  const trimmed = value.trim()
  const prefix = 'FOMOPAY1-HMAC-SHA256'
  if (!trimmed.toUpperCase().startsWith(prefix.toUpperCase())) return null
  const rest = trimmed.slice(prefix.length).trim()
  const parts = rest.split(',')
  const out: Record<string, string> = {}
  for (const p of parts) {
    const eq = p.indexOf('=')
    if (eq === -1) continue
    const k = p.slice(0, eq).trim()
    const v = p.slice(eq + 1).trim()
    out[k] = v
  }
  return out
}

export interface WebhookVerifyOk {
  ok: true
}

export interface WebhookVerifyFail {
  ok: false
  reason: string
}

export type WebhookVerifyResult = WebhookVerifyOk | WebhookVerifyFail

/**
 * Verifies X-FOMOPay-Authorization per FOMO Pay Web Integration v1.1.0.
 * Uses raw request body string (do not parse JSON before verifying).
 */
export function verifyFomoWebhook(
  rawBody: string,
  authHeader: string | null
): WebhookVerifyResult {
  const creds = getFomoCredentials()
  if (!creds) return { ok: false, reason: 'not_configured' }

  const fields = parseAuthHeader(authHeader)
  if (!fields) return { ok: false, reason: 'bad_auth_header' }

  const version = fields.Version ?? fields.version
  const credential = fields.Credential ?? fields.credential
  const nonce = fields.Nonce ?? fields.nonce
  const timestamp = fields.Timestamp ?? fields.timestamp
  const signature = fields.Signature ?? fields.signature

  if (version !== '1.1') return { ok: false, reason: 'bad_version' }
  if (credential !== creds.mid) return { ok: false, reason: 'bad_credential' }
  if (!nonce || !timestamp || !signature) return { ok: false, reason: 'missing_fields' }

  if (nonce.length < 16 || nonce.length > 64) return { ok: false, reason: 'bad_nonce' }
  pruneNonces(Date.now())
  if (seenNonces.has(nonce)) return { ok: false, reason: 'nonce_replay' }

  const tsNum = Number(timestamp)
  if (!Number.isFinite(tsNum)) return { ok: false, reason: 'bad_timestamp' }
  const skew = Math.abs(Math.floor(Date.now() / 1000) - tsNum)
  if (skew > 300) return { ok: false, reason: 'timestamp_skew' }

  const message = `${rawBody}${timestamp}${nonce}`
  const sigLower = signature.toLowerCase()

  const keyCandidates: Buffer[] = [Buffer.from(creds.psk, 'utf8')]
  if (/^[0-9a-fA-F]+$/.test(creds.psk) && creds.psk.length % 2 === 0) {
    keyCandidates.push(Buffer.from(creds.psk, 'hex'))
  }

  let signatureOk = false
  for (const key of keyCandidates) {
    const expected = createHmac('sha256', key).update(message, 'utf8').digest('hex')
    try {
      const a = Buffer.from(expected, 'utf8')
      const b = Buffer.from(sigLower, 'utf8')
      if (a.length === b.length && timingSafeEqual(a, b)) {
        signatureOk = true
        break
      }
    } catch {
      /* try next key */
    }
  }

  if (!signatureOk) {
    return { ok: false, reason: 'bad_signature' }
  }

  seenNonces.set(nonce, Date.now())

  return { ok: true }
}
