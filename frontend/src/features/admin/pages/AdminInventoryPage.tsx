import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'

import { ReviewerRoleSwitcher } from '../../auth/components/ReviewerRoleSwitcher'
import { clearSession, readSession } from '../../auth/session'
import { deleteVehicle, getVehicles, restockVehicle } from '../../showroom/api/vehiclesApi'
import { getActivity, getDeliveries, updateDeliveryStatus, type DeliveryItem } from '../api/adminApi'
import AdminVehicleFormModal from '../components/AdminVehicleFormModal'
import { Vehicle } from '../../showroom/api/vehiclesApi'

function formatPrice(price: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(price))
}

const STAGE_LABELS: Record<string, string> = {
  confirmed: 'Acquisition Confirmed',
  detailing: 'Custom Detailing & White-Glove Inspection',
  en_route: 'En Route to Private Suite',
  handover_ready: 'Handover Ready',
}

const NEXT_STAGE: Record<string, 'confirmed' | 'detailing' | 'en_route' | 'handover_ready' | null> = {
  confirmed: 'detailing',
  detailing: 'en_route',
  en_route: 'handover_ready',
  handover_ready: null,
}

export function AdminInventoryPage() {
  const session = readSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'inventory' | 'activity' | 'deliveries'>('inventory')

  const handleSignOut = () => {
    clearSession()
    navigate('/login')
  }
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'admin'],
    queryFn: () => getVehicles(session!),
    enabled: session?.user.role === 'admin',
  })
  const activityQuery = useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: () => getActivity(session!),
    enabled: session?.user.role === 'admin' && activeTab === 'activity',
  })
  const deliveriesQuery = useQuery({
    queryKey: ['admin', 'deliveries'],
    queryFn: () => getDeliveries(session!),
    enabled: session?.user.role === 'admin' && activeTab === 'deliveries',
  })
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<string | null>(null)
  const [deliveryFeedback, setDeliveryFeedback] = useState<string | null>(null)

  const updateDeliveryMutation = useMutation({
    mutationFn: ({
      transactionId,
      deliveryStatus,
    }: {
      transactionId: string
      deliveryStatus: 'confirmed' | 'detailing' | 'en_route' | 'handover_ready'
    }) => {
      setUpdatingDeliveryId(transactionId)
      return updateDeliveryStatus(session!, transactionId, deliveryStatus)
    },
    onSuccess: (updated: DeliveryItem) => {
      setUpdatingDeliveryId(null)
      setDeliveryFeedback(`Order ${updated.id.slice(0, 8)} advanced to ${STAGE_LABELS[updated.delivery_status]}`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'deliveries'] })
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
    },
    onError: () => {
      setUpdatingDeliveryId(null)
    },
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
            <ReviewerRoleSwitcher currentRole={session.user.role} />
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

        {/* Navigation Tabs */}
        <div className="border-ink/15 mt-8 flex border-b">
          <button
            className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-brand text-brand'
                : 'border-transparent text-ink/60 hover:text-ink'
            }`}
            onClick={() => setActiveTab('inventory')}
            type="button"
          >
            Active Inventory ({vehiclesQuery.data?.items.length ?? 0})
          </button>
          <button
            className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'border-brand text-brand'
                : 'border-transparent text-ink/60 hover:text-ink'
            }`}
            onClick={() => setActiveTab('activity')}
            type="button"
          >
            <span>Activity Ledger</span>
            <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-xs font-bold">
              Audit
            </span>
          </button>
          <button
            className={`border-b-2 px-6 py-3 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'deliveries'
                ? 'border-brand text-brand'
                : 'border-transparent text-ink/60 hover:text-ink'
            }`}
            onClick={() => setActiveTab('deliveries')}
            type="button"
          >
            <span>Concierge Deliveries</span>
            <span className="bg-amber-500/15 text-amber-900 rounded-full px-2 py-0.5 text-xs font-bold">
              Lifecycle
            </span>
          </button>
        </div>

        {activeTab === 'activity' ? (
          <div className="mt-8">
            {activityQuery.isPending ? (
              <p className="text-ink/65 mt-6">Loading activity ledger…</p>
            ) : null}
            {activityQuery.isError ? (
              <p
                className="border-accent bg-accent/10 mt-6 border px-4 py-3"
                role="alert"
              >
                {activityQuery.error.message}
              </p>
            ) : null}
            {activityQuery.data && activityQuery.data.items.length === 0 ? (
              <p className="text-ink/65 mt-6">No inventory transactions recorded yet.</p>
            ) : null}
            {activityQuery.data && activityQuery.data.items.length > 0 ? (
              <div className="border-ink/15 mt-6 overflow-x-auto border">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <caption className="sr-only">Inventory transaction ledger</caption>
                  <thead className="bg-mist text-xs tracking-[0.12em] uppercase">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Event</th>
                      <th className="px-5 py-4 font-semibold">Vehicle</th>
                      <th className="px-5 py-4 font-semibold">Stock Movement</th>
                      <th className="px-5 py-4 font-semibold">Balance</th>
                      <th className="px-5 py-4 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityQuery.data.items.map((item) => (
                      <tr className="border-ink/15 border-t" key={item.id}>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-xs px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${
                              item.transaction_type === 'purchase'
                                ? 'bg-accent/15 text-accent border border-accent/30'
                                : 'bg-emerald-500/15 text-emerald-800 border border-emerald-600/30'
                            }`}
                          >
                            {item.transaction_type === 'purchase' ? 'Purchase' : 'Restock'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-display text-lg text-ink">
                            {item.vehicle_make} {item.vehicle_model}
                          </p>
                          <p className="text-ink/50 text-xs">Model Year {item.vehicle_year}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`font-semibold ${
                              item.quantity_delta > 0 ? 'text-emerald-700' : 'text-accent'
                            }`}
                          >
                            {item.quantity_delta > 0
                              ? `+${item.quantity_delta} units`
                              : `${item.quantity_delta} unit`}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <span className="text-ink/60">{item.quantity_before}</span>
                          <span className="text-ink/40 mx-1.5">→</span>
                          <span className="font-semibold text-ink">{item.quantity_after}</span>
                        </td>
                        <td className="px-5 py-4 text-xs text-ink/70">
                          {new Intl.DateTimeFormat('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(item.created_at))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : activeTab === 'deliveries' ? (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl tracking-tight">
                  Concierge Delivery Management
                </h2>
                <p className="text-ink/65 text-xs mt-1">
                  Control and advance the white-glove delivery lifecycle stages for all acquired collector vehicles.
                </p>
              </div>
            </div>

            {deliveryFeedback ? (
              <div
                className="border-brand bg-mist mt-6 border p-4 text-xs font-semibold text-brand flex items-center justify-between"
                role="status"
              >
                <span>✓ {deliveryFeedback}</span>
                <button
                  className="text-ink/50 hover:text-ink text-sm font-bold p-1 cursor-pointer"
                  onClick={() => setDeliveryFeedback(null)}
                  type="button"
                >
                  ✕
                </button>
              </div>
            ) : null}

            {deliveriesQuery.isPending ? (
              <p className="text-ink/65 mt-6">Loading delivery dispatches…</p>
            ) : null}
            {deliveriesQuery.isError ? (
              <p
                className="border-accent bg-accent/10 mt-6 border px-4 py-3 text-sm"
                role="alert"
              >
                {deliveriesQuery.error.message}
              </p>
            ) : null}
            {deliveriesQuery.data && deliveriesQuery.data.items.length === 0 ? (
              <div className="border-ink/15 mt-6 border py-12 text-center bg-mist">
                <p className="font-display text-2xl">No acquisitions dispatched yet.</p>
                <p className="text-ink/60 text-xs mt-2">
                  When customers acquire vehicles from the showroom, their concierge delivery records will appear here for stage advancement.
                </p>
              </div>
            ) : null}
            {deliveriesQuery.data && deliveriesQuery.data.items.length > 0 ? (
              <div className="border-ink/15 mt-6 overflow-x-auto border">
                <table className="w-full min-w-[840px] border-collapse text-left">
                  <caption className="sr-only">Concierge delivery lifecycle management ledger</caption>
                  <thead className="bg-mist text-xs tracking-[0.12em] uppercase">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Dispatch Tracking</th>
                      <th className="px-5 py-4 font-semibold">Collector</th>
                      <th className="px-5 py-4 font-semibold">Motorcar</th>
                      <th className="px-5 py-4 font-semibold">Current Protocol Stage</th>
                      <th className="px-5 py-4 font-semibold">Lifecycle Stage Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveriesQuery.data.items.map((delivery) => (
                      <tr className="border-ink/15 border-t" key={delivery.id}>
                        <td className="px-5 py-4 align-top">
                          <span className="font-mono text-xs font-bold text-brand block">
                            AM-TRK-{delivery.id.replace(/-/g, '').slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-ink/50 text-[11px] block mt-0.5">
                            {new Intl.DateTimeFormat('en-IN', {
                              dateStyle: 'medium',
                            }).format(new Date(delivery.created_at))}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span className="font-semibold text-xs block text-ink">
                            {delivery.customer_name ?? 'Private Client'}
                          </span>
                          <span className="text-ink/60 text-xs block font-mono">
                            {delivery.customer_email ?? 'Registry ID: ' + (delivery.customer_id?.slice(0, 8) ?? 'N/A')}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span className="font-display text-sm font-medium text-ink block">
                            {delivery.vehicle_year} {delivery.vehicle_make} {delivery.vehicle_model}
                          </span>
                          <span className="text-brand font-semibold text-xs block mt-0.5">
                            {formatPrice(delivery.vehicle_price)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              delivery.delivery_status === 'handover_ready'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : delivery.delivery_status === 'en_route'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : delivery.delivery_status === 'detailing'
                                ? 'bg-blue-50 text-blue-900 border-blue-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                            {STAGE_LABELS[delivery.delivery_status] ?? delivery.delivery_status}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <select
                              aria-label={`Update lifecycle stage for order ${delivery.id.slice(0, 8)}`}
                              className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-2.5 py-1.5 text-xs font-semibold rounded-xs outline-none cursor-pointer"
                              disabled={updateDeliveryMutation.isPending && updatingDeliveryId === delivery.id}
                              onChange={(e) => {
                                updateDeliveryMutation.mutate({
                                  transactionId: delivery.id,
                                  deliveryStatus: e.target.value as
                                    | 'confirmed'
                                    | 'detailing'
                                    | 'en_route'
                                    | 'handover_ready',
                                })
                              }}
                              value={delivery.delivery_status}
                            >
                              <option value="confirmed">1. Acquisition Confirmed</option>
                              <option value="detailing">2. Custom Detailing & Audit</option>
                              <option value="en_route">3. En Route to Private Suite</option>
                              <option value="handover_ready">4. Handover Ready</option>
                            </select>

                            {NEXT_STAGE[delivery.delivery_status] ? (
                              <button
                                aria-label={`Advance order ${delivery.id.slice(0, 8)} to next stage`}
                                className="text-xs font-semibold bg-brand text-canvas hover:bg-ink px-3 py-1.5 rounded-xs transition-colors cursor-pointer whitespace-nowrap"
                                disabled={updateDeliveryMutation.isPending && updatingDeliveryId === delivery.id}
                                onClick={() => {
                                  const next = NEXT_STAGE[delivery.delivery_status]
                                  if (next) {
                                    updateDeliveryMutation.mutate({
                                      transactionId: delivery.id,
                                      deliveryStatus: next,
                                    })
                                  }
                                }}
                                type="button"
                              >
                                Advance ➔
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : (
          <>
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
                      <div className="flex flex-col gap-1.5 items-start">
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
                        {vehicle.quantity === 0 ? (
                          <span className="inline-flex items-center rounded-xs bg-accent/15 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-accent border border-accent/30">
                            Depleted
                          </span>
                        ) : vehicle.quantity <= 1 ? (
                          <span className="inline-flex items-center rounded-xs bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-amber-800 border border-amber-600/30">
                            Low Stock (1 left)
                          </span>
                        ) : null}
                      </div>
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
        </>
        )}

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
