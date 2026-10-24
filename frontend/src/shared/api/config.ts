/**
 * Shared API configuration and URL resolution.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.MODE === 'test') {
    return 'http://localhost:8000/api'
  }
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '/api'
  const trimmed = raw.replace(/\/+$/, '')
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}
