import type { LoginResult } from '../../auth/api/authApi'

export type PurchaseHistoryItem = {
  id: string
  quantity: number
  purchased_at: string
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    price: string
    image_url: string | null
  }
}

export type PurchaseHistoryPage = {
  items: PurchaseHistoryItem[]
  meta: { page: number; page_size: number; total: number; total_pages: number }
}

const apiBaseUrl =
  import.meta.env.MODE === 'test'
    ? 'http://localhost:8000/api'
    : (import.meta.env.VITE_API_URL || '/api')

export async function getPurchaseHistory(
  session: LoginResult,
): Promise<PurchaseHistoryPage> {
  const response = await fetch(`${apiBaseUrl}/purchases?page=1&page_size=12`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(
      payload?.error?.message ?? 'Your purchase history could not be loaded.',
    )
  }

  return (await response.json()) as PurchaseHistoryPage
}
