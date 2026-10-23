import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { readSession } from '../../auth/session'
import { getVehicles, type Vehicle, type VehicleSearchFilters } from '../api/vehiclesApi'

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
  const session = readSession();
  const [searchParams, setSearchParams] = useSearchParams();

  type ShowroomFilters = VehicleSearchFilters & {
    sort?: VehicleSearchFilters['sort'];
    page: number;
    make: string;
    min_price: number;
    max_price: number;
    min_year: number;
    max_year: number;
  };

  const [filters, setFilters] = useState<ShowroomFilters>({
    query: searchParams.get('query') ?? '',
    category: searchParams.get('category') ?? '',
    inStock: searchParams.get('inStock') === 'true',
    sort: (searchParams.get('sort') as VehicleSearchFilters['sort']) ?? 'newest',
    page: Number(searchParams.get('page') ?? 1),
    make: searchParams.get('make') ?? '',
    min_price: Number(searchParams.get('min_price') ?? 0),
    max_price: Number(searchParams.get('max_price') ?? 0),
    min_year: Number(searchParams.get('min_year') ?? 0),
    max_year: Number(searchParams.get('max_year') ?? 0),
  });

  // Sync filter state to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('query', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.make) params.set('make', filters.make);
    if (filters.min_price) params.set('min_price', String(filters.min_price));
    if (filters.max_price) params.set('max_price', String(filters.max_price));
    if (filters.min_year) params.set('min_year', String(filters.min_year));
    if (filters.max_year) params.set('max_year', String(filters.max_year));
    setSearchParams(params);
  }, [filters]);
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'showroom', filters],
    queryFn: () => getVehicles(session!, filters),
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
            {session.user.role === 'admin' ? (
              <Link
                className="text-ink/65 underline underline-offset-4"
                to="/admin/inventory"
              >
                Inventory desk
              </Link>
            ) : (
              <Link
                className="text-ink/65 underline underline-offset-4"
                to="/purchases"
              >
                Your considerations
              </Link>
            )}
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

        <form
          className="border-ink/15 mt-8 grid gap-4 border-b pb-8 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end"
          onSubmit={(event) => {
            event.preventDefault()
            // URL sync is handled by the useEffect; just reset to page 1
            setFilters((current) => ({ ...current, page: 1 }))
          }}
        >
          <label className="grid gap-2 text-sm font-semibold">
            Search the collection
            <input
              className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-3 font-normal outline-none focus:ring-2"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              placeholder="Make, model, or detail"
              type="search"
              value={filters.query}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Body style
            <select
              className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-3 font-normal outline-none focus:ring-2"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  category: event.target.value,
                  page: 1,
                }))
              }
              value={filters.category}
            >
              <option value="">All styles</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="coupe">Coupe</option>
              <option value="convertible">Convertible</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Arrange by
            <select
              className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-3 font-normal outline-none focus:ring-2"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sort: event.target.value as typeof current.sort,
                  page: 1,
                }) as ShowroomFilters)
              }
              value={filters.sort}
            >
              <option value="newest">Most recently added</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="year_desc">Newest model year</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Make
            <input
              className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-3 font-normal outline-none focus:ring-2"
              type="text"
              placeholder="e.g., Toyota"
              value={filters.make}
              onChange={(e) =>
                setFilters((current) => ({
                  ...current,
                  make: e.target.value,
                  page: 1,
                }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Price range
            <div className="flex gap-2">
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-3 font-normal outline-none focus:ring-2 w-1/2"
                type="number"
                placeholder="Min"
                value={filters.min_price || ''}
                onChange={(e) =>
                  setFilters((current) => ({
                    ...current,
                    min_price: Number(e.target.value) || 0,
                    page: 1,
                  }))
                }
              />
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-3 font-normal outline-none focus:ring-2 w-1/2"
                type="number"
                placeholder="Max"
                value={filters.max_price || ''}
                onChange={(e) =>
                  setFilters((current) => ({
                    ...current,
                    max_price: Number(e.target.value) || 0,
                    page: 1,
                  }))
                }
              />
            </div>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Year range
            <div className="flex gap-2">
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-3 font-normal outline-none focus:ring-2 w-1/2"
                type="number"
                placeholder="Min"
                value={filters.min_year || ''}
                onChange={(e) =>
                  setFilters((current) => ({
                    ...current,
                    min_year: Number(e.target.value) || 0,
                    page: 1,
                  }))
                }
              />
              <input
                className="border-ink/20 focus:border-brand focus:ring-brand/20 bg-white px-3 py-3 font-normal outline-none focus:ring-2 w-1/2"
                type="number"
                placeholder="Max"
                value={filters.max_year || ''}
                onChange={(e) =>
                  setFilters((current) => ({
                    ...current,
                    max_year: Number(e.target.value) || 0,
                    page: 1,
                  }))
                }
              />
            </div>
          </label>
          <div className="flex gap-3">
            <label className="border-ink/20 flex min-h-12 items-center gap-2 border bg-white px-3 text-sm">
              <input
                checked={filters.inStock}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    inStock: event.target.checked,
                    page: 1,
                  }))
                }
                type="checkbox"
              />
              Available now
            </label>
            <button
              className="bg-brand text-canvas min-h-12 px-5 text-sm font-semibold"
              type="submit"
            >
              Refine
            </button>
          </div>
        </form>

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
          <>
            <section
              aria-label="Vehicle collection"
              className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {vehiclesQuery.data.items.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </section>
            {vehiclesQuery.data.meta.total_pages > 1 ? (
              <nav
                aria-label="Collection pages"
                className="border-ink/15 mt-10 flex items-center justify-between border-t pt-6"
              >
                <p className="text-ink/65 text-sm">
                  Page {vehiclesQuery.data.meta.page} of{' '}
                  {vehiclesQuery.data.meta.total_pages} ·{' '}
                  {vehiclesQuery.data.meta.total} vehicles
                </p>
                <div className="flex gap-3">
                  <button
                    className="border-ink/25 min-h-10 border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={filters.page === 1}
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        page: current.page - 1,
                      }))
                    }
                    type="button"
                  >
                    Previous
                  </button>
                  <button
                    className="bg-brand text-canvas min-h-10 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={
                      filters.page >= vehiclesQuery.data.meta.total_pages
                    }
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        page: current.page + 1,
                      }))
                    }
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </nav>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  )
}
