import type { LoginResult } from './api/authApi'

const sessionStorageKey = 'aretiva.session'

export function saveSession(session: LoginResult): void {
  window.localStorage.setItem(sessionStorageKey, JSON.stringify(session))
}

export function readSession(): LoginResult | null {
  const rawSession = window.localStorage.getItem(sessionStorageKey)
  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as LoginResult
  } catch {
    window.localStorage.removeItem(sessionStorageKey)
    return null
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(sessionStorageKey)
}
