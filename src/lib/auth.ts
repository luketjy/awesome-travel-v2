const ALGORITHM = { name: 'HMAC', hash: 'SHA-256' }

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey('raw', enc.encode(secret), ALGORITHM, false, [
    'sign',
    'verify',
  ])
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function generateSessionToken(secret: string): Promise<string> {
  const timestamp = Date.now().toString()
  const key = await getKey(secret)
  const enc = new TextEncoder()
  const sig = await crypto.subtle.sign(ALGORITHM, key, enc.encode(timestamp))
  return `${timestamp}.${bufToHex(sig)}`
}

export async function verifySessionToken(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const [timestamp, signature] = token.split('.')
    if (!timestamp || !signature) return false

    const ts = parseInt(timestamp, 10)
    if (isNaN(ts)) return false

    // Expire after 24 hours
    if (Date.now() - ts > 24 * 60 * 60 * 1000) return false

    const key = await getKey(secret)
    const enc = new TextEncoder()
    const sigBytes = new Uint8Array(
      signature.match(/.{2}/g)!.map((b) => parseInt(b, 16))
    )
    return await crypto.subtle.verify(
      ALGORITHM,
      key,
      sigBytes,
      enc.encode(timestamp)
    )
  } catch {
    return false
  }
}
