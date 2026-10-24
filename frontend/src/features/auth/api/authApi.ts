export type AuthenticatedUser = {
  id: string
  full_name: string
  email: string
  role: 'customer' | 'admin'
}

export type LoginResult = {
  access_token: string
  token_type: 'bearer'
  user: AuthenticatedUser
}

type LoginInput = {
  email: string
  password: string
}

type RegisterInput = {
  full_name: string
  email: string
  password: string
}
import { getApiBaseUrl } from '../../../shared/api/config'

const apiBaseUrl = getApiBaseUrl()

export async function login(input: LoginInput): Promise<LoginResult> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(
      payload?.error?.message ?? 'We could not sign you in. Please try again.',
    )
  }

  return (await response.json()) as LoginResult
}

export async function register(
  input: RegisterInput,
): Promise<AuthenticatedUser> {
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(
      payload?.error?.message ??
        'We could not create your account. Please try again.',
    )
  }

  return (await response.json()) as AuthenticatedUser
}
