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
  make?: string
  category?: string
  min_price?: number
  max_price?: number
  min_year?: number
  max_year?: number
  inStock?: boolean
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'year_desc'
  page?: number
}
import { getApiBaseUrl } from '../../../shared/api/config'

const apiBaseUrl = getApiBaseUrl()

export async function getVehicles(
  session: LoginResult,
  filters: VehicleSearchFilters = {},
): Promise<VehiclePage> {
  const usesSearch = Boolean(
    filters.query ||
    filters.make ||
    filters.category ||
    filters.min_price ||
    filters.max_price ||
    filters.min_year ||
    filters.max_year ||
    filters.inStock ||
    (filters.sort && filters.sort !== 'newest'),
  )
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    page_size: '12',
  })

  if (filters.query) params.set('query', filters.query)
  if (filters.make) params.set('make', filters.make)
  if (filters.category) params.set('category', filters.category)
  if (filters.min_price) params.set('min_price', String(filters.min_price))
  if (filters.max_price) params.set('max_price', String(filters.max_price))
  if (filters.min_year) params.set('min_year', String(filters.min_year))
  if (filters.max_year) params.set('max_year', String(filters.max_year))
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

export async function createVehicle(session: LoginResult, payload: Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Vehicle> {
  const response = await fetch(`${apiBaseUrl}/vehicles`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const payloadErr = (await response.json().catch(() => null)) as {
      error?: { message?: string }
      detail?: Array<{ loc?: string[]; msg?: string }> | string
    } | null
    const detailMsg = Array.isArray(payloadErr?.detail)
      ? payloadErr.detail
          .map((d) => (d.loc && d.loc.length > 1 ? `${d.loc[d.loc.length - 1]}: ${d.msg}` : d.msg))
          .join('; ')
      : typeof payloadErr?.detail === 'string'
        ? payloadErr.detail
        : null
    throw new Error(payloadErr?.error?.message ?? detailMsg ?? 'Could not create vehicle.')
  }

  return (await response.json()) as Vehicle
}

export async function updateVehicle(session: LoginResult, vehicleId: string, payload: Partial<Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Vehicle> {
  const response = await fetch(`${apiBaseUrl}/vehicles/${vehicleId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const payloadErr = (await response.json().catch(() => null)) as {
      error?: { message?: string }
      detail?: Array<{ loc?: string[]; msg?: string }> | string
    } | null
    const detailMsg = Array.isArray(payloadErr?.detail)
      ? payloadErr.detail
          .map((d) => (d.loc && d.loc.length > 1 ? `${d.loc[d.loc.length - 1]}: ${d.msg}` : d.msg))
          .join('; ')
      : typeof payloadErr?.detail === 'string'
        ? payloadErr.detail
        : null
    throw new Error(payloadErr?.error?.message ?? detailMsg ?? 'Could not update vehicle.')
  }

  return (await response.json()) as Vehicle
}
