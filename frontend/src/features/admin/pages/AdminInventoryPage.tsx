import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'

import { clearSession, readSession } from '../../auth/session'
import { deleteVehicle, getVehicles, restockVehicle } from '../../showroom/api/vehiclesApi'
import AdminVehicleFormModal from '../components/AdminVehicleFormModal'
import { Vehicle } from '../../showroom/api/vehiclesApi'

function formatPrice(price: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price))
}

export function AdminInventoryPage() {
  const session = readSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleSignOut = () => {
    clearSession()
    navigate('/login')
  }
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'admin'],
    queryFn: () => getVehicles(session!),
    enabled: session?.user.role === 'admin',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const restockMutation = useMutation({
    mutationFn: ({
      vehicleId,
      quantity,
    }: {
      vehicleId: string
      quantity: number
    }) => restockVehicle(session!, vehicleId, quantity),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'admin'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (vehicleId: string) => deleteVehicle(session!, vehicleId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'admin'] }),
  })

  if (session?.user.role !== 'admin') {
    return (
      <main className="bg-canvas text-ink grid min-h-screen place-items-center px-5 text-center">
        <div className="max-w-md">
          <p className="text-brand text-xs font-semibold tracking-[0.24em] uppercase">
            Restricted desk
          </p>
          <h1 className="font-display mt-5 text-5xl tracking-[-0.04em]">
            Administrator access required.
          </h1>
          <Link
            className="text-brand mt-7 inline-block font-semibold underline underline-offset-4"
            to="/showroom"
          >
            Return to showroom
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="bg-canvas text-ink min-h-screen">
      <header className="border-ink/15 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link
            className="font-display text-brand text-2xl tracking-wide"
            to="/"
          >
            Aretiva Motors
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link
              className="text-ink/65 hover:text-brand underline underline-offset-4 transition-colors"
              to="/showroom"
            >
              View showroom
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-ink/75 font-medium">{session.user.full_name}</span>
              <button
                className="rounded-xs border border-ink/20 px-2.5 py-1 text-xs font-semibold text-ink/70 hover:border-brand hover:text-brand transition-colors cursor-pointer"
                onClick={handleSignOut}
                type="button"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="border-ink/15 flex flex-col gap-5 border-b pb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.24em] uppercase">
              Administrator control
            </p>
            <h1 className="font-display mt-4 text-[clamp(3.25rem,7vw,6rem)] leading-[0.85] tracking-[-0.05em]">
              Inventory desk.
            </h1>
          </div>
          <div className="flex flex-col items-start gap-4 sm:items-end">
            <p className="text-ink/65 max-w-sm leading-7 sm:text-right">
              A precise view of availability, designed for quick, accountable
              adjustments.
            </p>
            <button
              className="bg-brand text-canvas hover:bg-brand/90 min-h-11 px-5 text-sm font-semibold transition-colors"
              onClick={() => {
                setEditingVehicle(null)
                setIsModalOpen(true)
              }}
              type="button"
            >
              + Add new vehicle
            </button>
          </div>
        </div>

        {vehiclesQuery.isPending ? (
          <p className="text-ink/65 mt-12">Loading inventory…</p>
        ) : null}
        {vehiclesQuery.isError ? (
          <p
            className="border-accent bg-accent/10 mt-12 border px-4 py-3"
            role="alert"
          >
            {vehiclesQuery.error.message}
          </p>
        ) : null}
        {restockMutation.isSuccess ? (
          <p
            className="border-brand bg-mist mt-8 border px-4 py-3 font-semibold"
            role="status"
          >
            Stock updated to {restockMutation.data.quantity_remaining} units.
          </p>
        ) : null}
        {restockMutation.isError ? (
          <p
            className="border-accent bg-accent/10 mt-8 border px-4 py-3"
            role="alert"
          >
            {restockMutation.error.message}
          </p>
        ) : null}
        {deleteMutation.isSuccess ? (
          <p
            className="border-brand bg-mist mt-8 border px-4 py-3 font-semibold"
            role="status"
          >
            Vehicle removed from the active collection.
          </p>
        ) : null}
        {deleteMutation.isError ? (
          <p
            className="border-accent bg-accent/10 mt-8 border px-4 py-3"
            role="alert"
          >
            {deleteMutation.error.message}
          </p>
        ) : null}

        {vehiclesQuery.data ? (
          <div className="border-ink/15 mt-12 overflow-x-auto border">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <caption className="sr-only">Active showroom inventory</caption>
              <thead className="bg-mist text-xs tracking-[0.12em] uppercase">
                <tr>
                  <th className="px-5 py-4 font-semibold">Vehicle</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Availability</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehiclesQuery.data.items.map((vehicle) => (
                  <tr className="border-ink/15 border-t" key={vehicle.id}>
                    <td className="px-5 py-5">
                      <p className="font-display text-2xl">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-ink/60 mt-1 text-sm">
                        {vehicle.year} · {vehicle.vin}
                      </p>
                    </td>
                    <td className="px-5 py-5 font-semibold">
                      {formatPrice(vehicle.price)}
                    </td>
                    <td className="px-5 py-5">
                      <span
                        className={
                          vehicle.quantity === 0
                            ? 'text-accent font-semibold'
                            : 'text-brand font-semibold'
                        }
                      >
                        {vehicle.quantity}{' '}
                        {vehicle.quantity === 1 ? 'unit' : 'units'}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-3">
                        <button
                          className="border-brand text-brand hover:bg-brand hover:text-canvas min-h-10 border px-4 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-55"
                          disabled={
                            restockMutation.isPending ||
                            deleteMutation.isPending
                          }
                          onClick={() =>
                            restockMutation.mutate({
                              vehicleId: vehicle.id,
                              quantity: 2,
                            })
                          }
                          type="button"
                        >
                          Restock 2
                        </button>
                        <button
                          className="border-brand text-brand hover:bg-brand/10 min-h-10 border px-4 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-55"
                          disabled={restockMutation.isPending || deleteMutation.isPending}
                          onClick={() => {
                            setEditingVehicle(vehicle)
                            setIsModalOpen(true)
                          }}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="border-accent text-accent hover:bg-accent hover:text-canvas min-h-10 border px-4 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-55"
                          disabled={
                            restockMutation.isPending ||
                            deleteMutation.isPending
                          }
                          onClick={() => {
                            if (
                              window.confirm(
                                `Remove ${vehicle.make} ${vehicle.model} from the active collection?`,
                              )
                            ) {
                              deleteMutation.mutate(vehicle.id)
                            }
                          }}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <AdminVehicleFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingVehicle(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['vehicles', 'admin'] })
          }}
          vehicle={editingVehicle}
        />
      </main>
    </div>
  )
}
