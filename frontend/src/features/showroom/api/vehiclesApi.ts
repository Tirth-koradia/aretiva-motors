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

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export async function getVehicles(session: LoginResult): Promise<VehiclePage> {
  const response = await fetch(`${apiBaseUrl}/vehicles?page=1&page_size=12`, {
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
