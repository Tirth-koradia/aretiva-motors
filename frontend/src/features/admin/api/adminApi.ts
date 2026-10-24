import { getApiBaseUrl } from '../../../shared/api/config'
import type { LoginResult } from '../../auth/api/authApi'

export type ActivityItem = {
  id: string
  transaction_type: 'purchase' | 'restock'
  quantity_delta: number
  quantity_before: number
  quantity_after: number
  created_at: string
  vehicle_id: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  user_id: string | null
}

export type ActivityPage = {
  items: ActivityItem[]
  meta: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

export async function getActivity(
  session: LoginResult,
  page = 1,
  pageSize = 20,
): Promise<ActivityPage> {
  const apiBaseUrl = getApiBaseUrl()
  const response = await fetch(
    `${apiBaseUrl}/admin/activity?page=${page}&page_size=${pageSize}`,
    {
      headers: { Authorization: `Bearer ${session.access_token}` },
    },
  )
  if (!response.ok) {
    throw new Error('Failed to load activity ledger.')
  }
  return response.json()
}
