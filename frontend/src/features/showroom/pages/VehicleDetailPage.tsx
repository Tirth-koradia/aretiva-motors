import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ReviewerRoleSwitcher } from '../../auth/components/ReviewerRoleSwitcher'
import { clearSession, readSession } from '../../auth/session'
import { getVehicle, purchaseVehicle } from '../api/vehiclesApi'

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

function calculateEmi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const monthlyRate = annualRatePct / 12 / 100
  const factor = Math.pow(1 + monthlyRate, months)
  return Math.round((principal * monthlyRate * factor) / (factor - 1))
}

export function VehicleDetailPage() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const session = readSession()
  const queryClient = useQueryClient()
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [tenureMonths, setTenureMonths] = useState(36)

  const handleSignOut = () => {
    clearSession()
    navigate('/login')
  }
  const vehicleQuery = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: () => getVehicle(session!, vehicleId!),
    enabled: Boolean(session && vehicleId),
  })
  const purchaseMutation = useMutation({
    mutationFn: () => purchaseVehicle(session!, vehicleId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicleId] })
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'showroom'] })
    },
  })

  if (!session) {
    return (
      <main className="bg-canvas text-ink grid min-h-screen place-items-center px-5 text-center">
        <div className="max-w-md">
          <p className="text-brand text-xs font-semibold tracking-[0.24em] uppercase">
            Private collection
          </p>
          <h1 className="font-display mt-5 text-5xl tracking-[-0.04em]">
            Sign in to consider a vehicle.
          </h1>
          <Link
            className="bg-brand text-canvas mt-8 inline-flex min-h-12 items-center px-6 font-semibold"
            to="/login"
          >
            Log in
          </Link>
        </div>
      </main>
    )
  }

  if (vehicleQuery.isPending) {
    return (
      <main className="bg-canvas text-ink min-h-screen px-5 py-16">
        Preparing vehicle details…
      </main>
    )
  }

  if (vehicleQuery.isError || !vehicleQuery.data) {
    return (
      <main className="bg-canvas text-ink grid min-h-screen place-items-center px-5 text-center">
        <div className="max-w-md">
          <p
            className="border-accent bg-accent/10 border px-4 py-3"
            role="alert"
          >
            {vehicleQuery.error?.message ??
              'This vehicle is no longer available.'}
          </p>
          <Link
            className="text-brand mt-6 inline-block font-semibold underline underline-offset-4"
            to="/showroom"
          >
            Return to the showroom
          </Link>
        </div>
      </main>
    )
  }

  const vehicle = vehicleQuery.data
  const condition = vehicle.condition === 'pre_owned' ? 'Pre-owned' : 'New'
  const isSoldOut = vehicle.quantity === 0

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
              Back to showroom
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
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <section className="bg-mist relative aspect-[1.15/1] overflow-hidden p-7 sm:p-10">
            {vehicle.image_url ? (
              <img
                alt={`${vehicle.make} ${vehicle.model}`}
                className="h-full w-full object-cover"
                src={vehicle.image_url}
              />
            ) : (
              <>
                <div
                  aria-hidden="true"
                  className="bg-brand/90 absolute inset-x-[13%] bottom-[23%] h-[24%] rounded-[48%_52%_28%_28%]"
                />
                <div
                  aria-hidden="true"
                  className="border-canvas/70 absolute inset-x-[23%] bottom-[36%] h-[20%] rounded-t-[100%] border-t-[3px]"
                />
                <div
                  aria-hidden="true"
                  className="border-ink/40 absolute bottom-[16%] left-[20%] h-14 w-14 rounded-full border-[5px]"
                />
                <div
                  aria-hidden="true"
                  className="border-ink/40 absolute right-[20%] bottom-[16%] h-14 w-14 rounded-full border-[5px]"
                />
              </>
            )}
            <span className="bg-canvas text-ink absolute top-6 left-6 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] uppercase">
              {condition}
            </span>
          </section>

          <section className="flex flex-col justify-center">
            <p className="text-brand text-xs font-semibold tracking-[0.24em] uppercase">
              {vehicle.year} · {vehicle.category}
            </p>
            <h1 className="font-display mt-4 text-[clamp(3.25rem,7vw,6.25rem)] leading-[0.85] tracking-[-0.055em]">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="font-display mt-8 text-4xl">
              {formatPrice(vehicle.price)}
            </p>
            <p className="text-ink/65 mt-6 max-w-xl leading-7">
              {vehicle.description}
            </p>
            <dl className="bg-ink/15 mt-8 grid grid-cols-2 gap-px sm:grid-cols-4">
              {[
                ['Mileage', `${formatKilometres(vehicle.mileage_km)} km`],
                ['Fuel', vehicle.fuel_type],
                ['Transmission', vehicle.transmission],
                ['VIN', vehicle.vin.slice(-6)],
              ].map(([label, value]) => (
                <div className="bg-canvas px-4 py-4" key={label}>
                  <dt className="text-ink/55 text-[0.68rem] tracking-[0.12em] uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold capitalize">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {(() => {
              const numericPrice = Number(vehicle.price) || 0
              const downPaymentAmount = Math.round(numericPrice * (downPaymentPct / 100))
              const financedAmount = Math.max(0, numericPrice - downPaymentAmount)
              const monthlyEmi = calculateEmi(financedAmount, 8.5, tenureMonths)

              return (
                <div className="border-ink/15 bg-mist/60 mt-8 rounded-sm border p-5 sm:p-6">
                  <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                    <div>
                      <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">
                        Bespoke Acquisition Plan
                      </p>
                      <h3 className="font-display text-xl mt-0.5">Financing & EMI Estimator</h3>
                    </div>
                    <span className="text-ink/50 text-xs font-medium">8.5% APR</span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-ink/70 text-xs font-semibold block mb-1.5">
                        Down Payment ({downPaymentPct}%)
                      </label>
                      <div className="flex gap-2">
                        {[20, 30, 50].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setDownPaymentPct(pct)}
                            className={`rounded-xs border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                              downPaymentPct === pct
                                ? 'border-brand bg-brand text-canvas'
                                : 'border-ink/20 bg-canvas text-ink/70 hover:border-brand'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                      <span className="text-ink/50 text-[11px] block mt-1">
                        {formatPrice(String(downPaymentAmount))} deposit
                      </span>
                    </div>

                    <div>
                      <label className="text-ink/70 text-xs font-semibold block mb-1.5">
                        Tenure
                      </label>
                      <div className="flex gap-2">
                        {[36, 48, 60].map((months) => (
                          <button
                            key={months}
                            type="button"
                            onClick={() => setTenureMonths(months)}
                            className={`rounded-xs border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                              tenureMonths === months
                                ? 'border-brand bg-brand text-canvas'
                                : 'border-ink/20 bg-canvas text-ink/70 hover:border-brand'
                            }`}
                          >
                            {months} mos
                          </button>
                        ))}
                      </div>
                      <span className="text-ink/50 text-[11px] block mt-1">
                        {tenureMonths / 12} years financing
                      </span>
                    </div>
                  </div>

                  <div className="border-ink/10 mt-5 border-t pt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-ink/60 text-xs">Estimated Monthly Investment</span>
                      <p className="font-display text-3xl text-ink font-semibold">
                        {formatPrice(String(monthlyEmi))}
                        <span className="text-xs text-ink/50 font-normal"> / month</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-ink/40 text-[11px] block">Financed Principal</span>
                      <span className="text-xs text-ink/70 font-semibold">
                        {formatPrice(String(financedAmount))}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })()}

            {purchaseMutation.isSuccess ? (
              <p
                className="border-brand bg-mist mt-8 border px-4 py-3 font-semibold"
                role="status"
              >
                Purchase request recorded. Our Aretiva concierge will be in
                touch.
              </p>
            ) : null}
            {purchaseMutation.isError ? (
              <p
                className="border-accent bg-accent/10 mt-8 border px-4 py-3"
                role="alert"
              >
                {purchaseMutation.error.message}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                className="bg-brand text-canvas hover:bg-ink min-h-12 px-6 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55"
                disabled={
                  isSoldOut ||
                  purchaseMutation.isPending ||
                  purchaseMutation.isSuccess
                }
                onClick={() => purchaseMutation.mutate()}
                type="button"
              >
                {isSoldOut
                  ? 'Currently unavailable'
                  : purchaseMutation.isPending
                    ? 'Recording request…'
                    : 'Record purchase request'}
              </button>
              <p className="text-ink/60 text-sm">
                {isSoldOut
                  ? 'This vehicle has just been reserved.'
                  : `${vehicle.quantity} ${vehicle.quantity === 1 ? 'unit' : 'units'} available`}
              </p>
            </div>
            <p className="text-ink/50 mt-4 text-xs">
              No payment is taken online. This records your requested vehicle
              only.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
