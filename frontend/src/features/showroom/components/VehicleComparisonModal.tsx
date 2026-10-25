import { Link } from 'react-router-dom'
import type { Vehicle } from '../api/vehiclesApi'

function formatPrice(price: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price))
}

function formatKilometres(distance: number) {
  return new Intl.NumberFormat('en-IN').format(distance)
}

function calculateEmi(principal: number, annualRatePct: number = 8.5, months: number = 36): number {
  if (principal <= 0 || months <= 0) return 0
  const monthlyRate = annualRatePct / 12 / 100
  const factor = Math.pow(1 + monthlyRate, months)
  return Math.round((principal * monthlyRate * factor) / (factor - 1))
}

interface VehicleComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  vehicles: Vehicle[]
  onRemoveVehicle: (id: string) => void
  onClearAll: () => void
}

export function VehicleComparisonModal({
  isOpen,
  onClose,
  vehicles,
  onRemoveVehicle,
  onClearAll,
}: VehicleComparisonModalProps) {
  if (!isOpen || vehicles.length === 0) return null

  return (
    <div
      aria-modal="true"
      className="bg-ink/70 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-label="Vehicle Comparison Modal"
    >
      <div className="bg-canvas border-ink/20 w-full max-w-5xl rounded-sm border p-6 sm:p-8 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-ink/15 pb-4">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.24em] uppercase">
              Curated Private Portfolio
            </p>
            <h2 className="font-display mt-1 text-3xl tracking-tight">
              Side-by-Side Specification Review
            </h2>
            <p className="text-ink/65 text-xs mt-1">
              Evaluating {vehicles.length} distinguished motorcars from the collection.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="text-ink/60 hover:text-accent text-xs font-semibold underline underline-offset-4 cursor-pointer"
              onClick={onClearAll}
              type="button"
            >
              Clear all
            </button>
            <button
              aria-label="Close comparison"
              className="text-ink/50 hover:text-ink text-xl font-bold leading-none p-2 cursor-pointer"
              onClick={onClose}
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink/15">
                <th className="py-3 pr-4 font-semibold text-xs tracking-wider uppercase text-ink/50 w-1/4">
                  Specification
                </th>
                {vehicles.map((v) => (
                  <th key={v.id} className="py-3 px-4 font-normal w-1/3 min-w-[220px]">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl text-ink">
                        {v.make} {v.model}
                      </span>
                      <button
                        aria-label={`Remove ${v.make} ${v.model} from comparison`}
                        className="text-ink/40 hover:text-accent text-xs font-bold p-1 cursor-pointer"
                        onClick={() => onRemoveVehicle(v.id)}
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {/* Vehicle Preview */}
              <tr>
                <td className="py-4 pr-4 text-xs font-semibold uppercase tracking-wider text-ink/50 align-top">
                  Visual Silhouette
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-4 px-4 align-top">
                    <div className="bg-mist aspect-[16/10] overflow-hidden rounded-xs border border-ink/10">
                      {v.image_url ? (
                        <img
                          alt={`${v.make} ${v.model}`}
                          className="h-full w-full object-cover"
                          src={v.image_url}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-ink/30 text-xs italic">
                          Editorial visual record
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Acquisition Price */}
              <tr className="bg-mist/30">
                <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Acquisition Price
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 font-display text-2xl text-brand font-medium">
                    {formatPrice(v.price)}
                  </td>
                ))}
              </tr>

              {/* Estimated Monthly EMI */}
              <tr>
                <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Estimated Investment
                </td>
                {vehicles.map((v) => {
                  const principal = Number(v.price) * 0.8
                  const emi = calculateEmi(principal, 8.5, 36)
                  return (
                    <td key={v.id} className="py-3 px-4 text-xs">
                      <span className="font-semibold text-ink text-sm">
                        {formatPrice(String(emi))}/mo
                      </span>
                      <span className="block text-ink/50 text-[11px]">
                        (8.5% APR · 36 mos · 20% down)
                      </span>
                    </td>
                  )
                })}
              </tr>

              {/* Year & Condition */}
              <tr>
                <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Year & Condition
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4">
                    <span className="font-medium">{v.year}</span> ·{' '}
                    <span className="capitalize">{v.condition === 'pre_owned' ? 'Pre-owned' : 'New'}</span>
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr>
                <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Category
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 capitalize font-medium">
                    {v.category}
                  </td>
                ))}
              </tr>

              {/* Powertrain / Fuel */}
              <tr>
                <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Powertrain / Fuel
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 capitalize">
                    {v.fuel_type}
                  </td>
                ))}
              </tr>

              {/* Transmission */}
              <tr>
                <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Transmission
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 capitalize">
                    {v.transmission}
                  </td>
                ))}
              </tr>

              {/* Odometer / Mileage */}
              <tr>
                <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Certified Mileage
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4 font-mono text-xs">
                    {formatKilometres(v.mileage_km)} km
                  </td>
                ))}
              </tr>

              {/* Allocation Availability */}
              <tr>
                <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Registry Status
                </td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-3 px-4">
                    {v.quantity > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-brand font-semibold">
                        <span className="h-2 w-2 rounded-full bg-brand"></span>
                        {v.quantity} Available in Suite
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-ink/40 font-semibold">
                        <span className="h-2 w-2 rounded-full bg-ink/30"></span>
                        Allocated / Reserved
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Action Column */}
              <tr className="bg-canvas">
                <td className="py-4 pr-4"></td>
                {vehicles.map((v) => (
                  <td key={v.id} className="py-4 px-4">
                    <Link
                      className="bg-brand text-canvas hover:bg-ink inline-flex w-full items-center justify-center py-2.5 px-4 text-xs font-semibold uppercase tracking-wider transition-colors"
                      to={`/showroom/${v.id}`}
                      onClick={onClose}
                    >
                      View Details & Reserve →
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-ink/15 pt-4">
          <button
            className="border-ink/20 text-ink/75 hover:border-ink hover:text-ink min-h-10 border px-6 text-xs font-semibold transition-colors cursor-pointer"
            onClick={onClose}
            type="button"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  )
}
