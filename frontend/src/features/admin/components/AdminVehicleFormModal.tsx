import React, { useState, useEffect } from 'react'
import { createVehicle, updateVehicle, type Vehicle } from '../../showroom/api/vehiclesApi'
import { readSession } from '../../auth/session'

type AdminVehicleFormModalProps = {
  isOpen: boolean
  onClose: () => void
  vehicle?: Vehicle | null
  onSuccess: () => void
}

type VehicleFormData = {
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
  image_url: string
}

function generateUniqueVin(): string {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'
  let result = 'AM'
  for (let i = 0; i < 15; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const initialFormData: VehicleFormData = {
  vin: '',
  make: '',
  model: '',
  category: 'sedan',
  condition: 'new',
  year: new Date().getFullYear(),
  mileage_km: 0,
  fuel_type: 'petrol',
  transmission: 'automatic',
  price: '1000000.00',
  quantity: 1,
  description: 'Exemplary specimen in pristine mechanical and aesthetic condition.',
  image_url: '',
}

export default function AdminVehicleFormModal({
  isOpen,
  onClose,
  vehicle,
  onSuccess,
}: AdminVehicleFormModalProps) {
  const session = readSession()
  const isEdit = Boolean(vehicle)

  const [formData, setFormData] = useState<VehicleFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        category: vehicle.category,
        condition: vehicle.condition,
        year: vehicle.year,
        mileage_km: vehicle.mileage_km,
        fuel_type: vehicle.fuel_type,
        transmission: vehicle.transmission,
        price: vehicle.price,
        quantity: vehicle.quantity,
        description: vehicle.description,
        image_url: vehicle.image_url ?? '',
      })
    } else {
      setFormData({
        ...initialFormData,
        vin: generateUniqueVin(),
      })
    }
    setErrorMessage(null)
  }, [vehicle, isOpen])

  const handleGenerateVin = () => {
    setFormData((prev) => ({
      ...prev,
      vin: generateUniqueVin(),
    }))
    setErrorMessage(null)
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'quantity' || name === 'mileage_km' || name === 'year'
          ? Number(value)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setLoading(true)
    setErrorMessage(null)

    const rawPrice = String(formData.price || '').replace(/,/g, '').trim()
    const sanitizedImageUrl = formData.image_url?.trim() ? formData.image_url.trim() : null

    const payload = {
      ...formData,
      image_url: sanitizedImageUrl,
      price: rawPrice,
    }

    try {
      if (isEdit && vehicle) {
        await updateVehicle(session, vehicle.id, payload)
      } else {
        await createVehicle(session, payload)
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('failed to fetch')) {
          setErrorMessage('Network connection error: The backend service may be spinning up or temporarily unreachable. Please retry in a few seconds.')
        } else {
          setErrorMessage(err.message)
        }
      } else {
        setErrorMessage('Operation failed. Please verify your inputs and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="bg-canvas border-ink/20 text-ink relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border p-6 shadow-2xl sm:p-8">
        <button
          aria-label="Close dialog"
          className="text-ink/60 hover:text-ink absolute top-6 right-6 text-xl transition-colors"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>

        <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">
          {isEdit ? 'Modify Inventory' : 'New Acquisition'}
        </p>
        <h2 className="font-display mt-2 text-3xl tracking-tight">
          {isEdit
            ? `Edit ${vehicle?.make} ${vehicle?.model}`
            : 'Add Vehicle to Catalogue'}
        </h2>

        {errorMessage ? (
          <p
            className="border-accent bg-accent/10 mt-6 border px-4 py-3 text-sm"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              <div className="flex items-center justify-between">
                <label htmlFor="vin">VIN (17 characters)</label>
                {!isEdit && (
                  <button
                    className="text-brand hover:underline font-mono text-[11px] font-medium tracking-normal lowercase"
                    onClick={handleGenerateVin}
                    type="button"
                  >
                    generate unique vin ↺
                  </button>
                )}
              </div>
              <input
                id="vin"
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 font-mono text-sm uppercase outline-none focus:ring-2"
                maxLength={17}
                minLength={17}
                name="vin"
                onChange={handleChange}
                placeholder="1HGCM82633A004352"
                required
                type="text"
                value={formData.vin}
              />
            </div>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Make
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                name="make"
                onChange={handleChange}
                placeholder="Honda, BMW, Toyota"
                required
                type="text"
                value={formData.make}
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Model
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                name="model"
                onChange={handleChange}
                placeholder="City ZX, 330i, etc."
                required
                type="text"
                value={formData.model}
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Category
              <select
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                name="category"
                onChange={handleChange}
                value={formData.category}
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Condition
              <select
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                name="condition"
                onChange={handleChange}
                value={formData.condition}
              >
                <option value="new">New</option>
                <option value="pre_owned">Pre-owned</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Model Year
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                max={2100}
                min={1886}
                name="year"
                onChange={handleChange}
                required
                type="number"
                value={formData.year}
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Mileage (km)
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                min={0}
                name="mileage_km"
                onChange={handleChange}
                required
                type="number"
                value={formData.mileage_km}
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Fuel Type
              <select
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                name="fuel_type"
                onChange={handleChange}
                value={formData.fuel_type}
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Transmission
              <select
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                name="transmission"
                onChange={handleChange}
                value={formData.transmission}
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Price (INR)
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                name="price"
                onChange={handleChange}
                placeholder="1489000.00"
                required
                type="text"
                value={formData.price}
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Stock Quantity
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                min={0}
                name="quantity"
                onChange={handleChange}
                required
                type="number"
                value={formData.quantity}
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
              Image URL (optional)
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                name="image_url"
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                type="url"
                value={formData.image_url}
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-xs font-semibold tracking-wide uppercase">
            Description
            <textarea
              className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              minLength={10}
              name="description"
              onChange={handleChange}
              placeholder="Verified vehicle history, specifications, condition notes..."
              required
              rows={3}
              value={formData.description}
            />
          </label>

          <div className="border-ink/10 flex justify-end gap-3 border-t pt-5">
            <button
              className="border-ink/20 hover:bg-mist text-ink min-h-11 border px-5 text-sm font-semibold transition-colors"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="bg-brand text-canvas hover:bg-brand/90 min-h-11 px-6 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-55"
              disabled={loading}
              type="submit"
            >
              {loading
                ? isEdit
                  ? 'Updating…'
                  : 'Adding…'
                : isEdit
                  ? 'Update Vehicle'
                  : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
