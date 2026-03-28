export const FOMO_PAY_API_BASE =
  process.env.FOMO_PAY_API_BASE?.replace(/\/$/, '') ?? 'https://ipg.fomopay.net'

export function getFomoCredentials(): { mid: string; psk: string } | null {
  const mid = process.env.FOMO_PAY_MID
  const psk = process.env.FOMO_PAY_PSK
  if (!mid?.trim() || !psk?.trim()) return null
  return { mid: mid.trim(), psk: psk.trim() }
}

export function isFomoPayConfigured(): boolean {
  return getFomoCredentials() !== null
}

/** Public HTTPS origin for return/notify URLs (no trailing slash). */
export function getPublicAppUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`
  return 'http://localhost:3000'
}
