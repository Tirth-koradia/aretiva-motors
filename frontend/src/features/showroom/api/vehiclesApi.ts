import type { LoginResult } from '../../auth/api/authApi'

export type Vehicle = {
  id: string
  vin: string
  make: string
  model: string
  category: string
  condition: 'new' | 'pre_owned'
  year: number
  mileage_km: number
  fuel_type: string
  transmission: string
  price: string
  quantity: number
  description: string
  image_url: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type VehiclePage = {
  items: Vehicle[]
  meta: { page: number; page_size: number; total: number; total_pages: number }
}

export type VehicleSearchFilters = {
  query?: string
  category?: string
  inStock?: boolean
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'year_desc'
  page?: number
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export async function getVehicles(
  session: LoginResult,
  filters: VehicleSearchFilters = {},
): Promise<VehiclePage> {
  const usesSearch = Boolean(
    filters.query ||
    filters.category ||
    filters.inStock ||
    (filters.sort && filters.sort !== 'newest'),
  )
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    page_size: '12',
  })

  if (filters.query) params.set('query', filters.query)
  if (filters.category) params.set('category', filters.category)
  if (filters.inStock) params.set('in_stock', 'true')
  if (filters.sort && filters.sort !== 'newest')
    params.set('sort', filters.sort)

  const endpoint = usesSearch ? '/vehicles/search' : '/vehicles'
  const response = await fetch(`${apiBaseUrl}${endpoint}?${params}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(
      payload?.error?.message ?? 'The showroom could not be loaded.',
    )
  }

  return (await response.json()) as VehiclePage
}

export type StockActionResult = {
  transaction_id: string
  vehicle_id: string
  quantity_remaining: number
}

export async function getVehicle(
  session: LoginResult,
  vehicleId: string,
): Promise<Vehicle> {
  const response = await fetch(`${apiBaseUrl}/vehicles/${vehicleId}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(
      payload?.error?.message ?? 'This vehicle could not be loaded.',
    )
  }

  return (await response.json()) as Vehicle
}

export async function purchaseVehicle(
  session: LoginResult,
  vehicleId: string,
): Promise<StockActionResult> {
  const response = await fetch(`${apiBaseUrl}/vehicles/${vehicleId}/purchase`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(
      payload?.error?.message ?? 'This purchase could not be recorded.',
    )
  }

  return (await response.json()) as StockActionResult
}

export async function restockVehicle(
  session: LoginResult,
  vehicleId: string,
  quantity: number,
): Promise<StockActionResult> {
  const response = await fetch(`${apiBaseUrl}/vehicles/${vehicleId}/restock`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(
      payload?.error?.message ?? 'This stock update could not be recorded.',
    )
  }

  return (await response.json()) as StockActionResult
}

export async function deleteVehicle(
  session: LoginResult,
  vehicleId: string,
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/vehicles/${vehicleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(
      payload?.error?.message ?? 'This vehicle could not be removed.',
    )
  }
}
