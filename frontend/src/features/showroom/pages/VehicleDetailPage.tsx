import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'

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

export function VehicleDetailPage() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const session = readSession()
  const queryClient = useQueryClient()

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
