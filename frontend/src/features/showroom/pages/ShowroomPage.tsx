import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { readSession } from '../../auth/session'
import { getVehicles, type Vehicle } from '../api/vehiclesApi'

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

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const condition = vehicle.condition === 'pre_owned' ? 'Pre-owned' : 'New'

  return (
    <article className="border-ink/15 bg-canvas group overflow-hidden border transition-shadow hover:shadow-[8px_8px_0_var(--accent-gallery)]">
      <div className="bg-mist relative aspect-[1.45/1] overflow-hidden p-5">
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
              className="bg-brand/90 absolute inset-x-[12%] bottom-[23%] h-[23%] rounded-[48%_52%_28%_28%]"
            />
            <div
              aria-hidden="true"
              className="border-canvas/70 absolute inset-x-[22%] bottom-[35%] h-[20%] rounded-t-[100%] border-t-2"
            />
            <div
              aria-hidden="true"
              className="border-ink/40 absolute bottom-[17%] left-[19%] h-10 w-10 rounded-full border-4"
            />
            <div
              aria-hidden="true"
              className="border-ink/40 absolute right-[19%] bottom-[17%] h-10 w-10 rounded-full border-4"
            />
          </>
        )}
        <span className="bg-canvas text-ink absolute top-4 left-4 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] uppercase">
          {condition}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.16em] uppercase">
              {vehicle.year} · {vehicle.category}
            </p>
            <h2 className="font-display mt-2 text-3xl leading-none tracking-[-0.025em]">
              {vehicle.make} {vehicle.model}
            </h2>
          </div>
          <p className="font-display text-xl whitespace-nowrap">
            {formatPrice(vehicle.price)}
          </p>
        </div>
        <dl className="text-ink/65 border-ink/15 mt-6 grid grid-cols-3 border-t border-b py-3 text-xs">
          <div>
            <dt className="sr-only">Mileage</dt>
            <dd>{formatKilometres(vehicle.mileage_km)} km</dd>
          </div>
          <div>
            <dt className="sr-only">Fuel type</dt>
            <dd className="capitalize">{vehicle.fuel_type}</dd>
          </div>
          <div>
            <dt className="sr-only">Transmission</dt>
            <dd className="capitalize">{vehicle.transmission}</dd>
          </div>
        </dl>
        <Link
          className="text-brand decoration-accent mt-5 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
          to={`/showroom/${vehicle.id}`}
        >
          Consider this vehicle <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

export function ShowroomPage() {
  const session = readSession()
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'showroom'],
    queryFn: () => getVehicles(session!),
    enabled: session !== null,
  })

  if (!session) {
    return (
      <main className="bg-canvas text-ink grid min-h-screen place-items-center px-5 text-center">
        <div className="max-w-md">
          <p className="text-brand text-xs font-semibold tracking-[0.24em] uppercase">
            Private collection
          </p>
          <h1 className="font-display mt-5 text-5xl tracking-[-0.04em]">
            Sign in to visit the showroom.
          </h1>
          <p className="text-ink/65 mt-5 leading-7">
            The Aretiva catalogue is available to registered guests.
          </p>
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
              className="text-ink/65 underline underline-offset-4"
              to="/purchases"
            >
              Your considerations
            </Link>
            <p className="text-ink/65">{session.user.full_name}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="border-ink/15 grid gap-7 border-b pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.24em] uppercase">
              The private collection
            </p>
            <h1 className="font-display mt-4 text-[clamp(3.25rem,7vw,6rem)] leading-[0.85] tracking-[-0.05em]">
              The showroom.
            </h1>
          </div>
          <p className="text-ink/65 max-w-sm leading-7">
            Every listing is selected for a considered, detail-led viewing
            experience.
          </p>
        </div>

        {vehiclesQuery.isPending ? (
          <p className="text-ink/65 mt-12">Preparing the collection…</p>
        ) : null}
        {vehiclesQuery.isError ? (
          <p
            className="border-accent bg-accent/10 mt-12 max-w-xl border px-4 py-3"
            role="alert"
          >
            {vehiclesQuery.error.message}
          </p>
        ) : null}
        {vehiclesQuery.data && vehiclesQuery.data.items.length === 0 ? (
          <p className="text-ink/65 mt-12 max-w-xl leading-7">
            The next collection is being prepared. Please return shortly.
          </p>
        ) : null}
        {vehiclesQuery.data ? (
          <section
            aria-label="Vehicle collection"
            className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {vehiclesQuery.data.items.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </section>
        ) : null}
      </main>
    </div>
  )
}
