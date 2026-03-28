import { getFomoCredentials } from './config'

export function fomoBasicAuthHeader(): string {
  const creds = getFomoCredentials()
  if (!creds) throw new Error('FOMO Pay is not configured')
  const token = Buffer.from(`${creds.mid}:${creds.psk}`, 'utf8').toString('base64')
  return `Basic ${token}`
}
