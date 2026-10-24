import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { renderApp } from '../../../test/renderApp'
import { server } from '../../../test/server'

describe('private showroom', () => {
  it('loads the authenticated vehicle collection and presents vehicle details', async () => {
    window.localStorage.setItem(
      'aretiva.session',
      JSON.stringify({
        access_token: 'test-access-token',
        token_type: 'bearer',
        user: {
          id: '6dc4fa1b-8f6d-49a7-b65e-36ee0af42c4e',
          full_name: 'Mira Shah',
          email: 'mira.shah@example.com',
          role: 'customer',
        },
      }),
    )
    server.use(
      http.get('http://localhost:8000/api/vehicles', ({ request }) => {
        expect(request.headers.get('authorization')).toBe(
          'Bearer test-access-token',
        )
        return HttpResponse.json({
          items: [
            {
              id: '2fcfe17b-fb81-4c89-a5c4-d63fd1dd6baa',
              vin: '1HGCM82633A004352',
              make: 'Honda',
              model: 'City ZX',
              category: 'sedan',
              condition: 'pre_owned',
              year: 2023,
              mileage_km: 18420,
              fuel_type: 'petrol',
              transmission: 'automatic',
              price: '1489000.00',
              quantity: 2,
              description: 'Single-owner sedan with verified service history.',
              image_url: null,
              deleted_at: null,
              created_at: '2026-10-24T00:00:00Z',
              updated_at: '2026-10-24T00:00:00Z',
            },
          ],
          meta: { page: 1, page_size: 12, total: 1, total_pages: 1 },
        })
      }),
    )

    renderApp('/showroom')

    expect(
      await screen.findByRole('heading', { name: 'Honda City ZX' }),
    ).toBeInTheDocument()
    expect(screen.getByText('₹14,89,000')).toBeInTheDocument()
    expect(screen.getByText('18,420 km')).toBeInTheDocument()
    expect(screen.getByText('Pre-owned')).toBeInTheDocument()
  })

  it('signs the user out when clicking the sign out button', async () => {
    window.localStorage.setItem(
      'aretiva.session',
      JSON.stringify({
        access_token: 'test-access-token',
        token_type: 'bearer',
        user: {
          id: '6dc4fa1b-8f6d-49a7-b65e-36ee0af42c4e',
          full_name: 'Mira Shah',
          email: 'mira.shah@example.com',
          role: 'customer',
        },
      }),
    )
    server.use(
      http.get('http://localhost:8000/api/vehicles', () => {
        return HttpResponse.json({
          items: [],
          meta: { page: 1, page_size: 12, total: 0, total_pages: 0 },
        })
      }),
    )

    const { user } = renderApp('/showroom')

    const signOutBtn = await screen.findByRole('button', { name: 'Sign out' })
    expect(signOutBtn).toBeInTheDocument()

    await user.click(signOutBtn)
    expect(window.localStorage.getItem('aretiva.session')).toBeNull()
  })

  it('displays the live results counter and active filter chips', async () => {
    window.localStorage.setItem(
      'aretiva.session',
      JSON.stringify({
        access_token: 'test-access-token',
        token_type: 'bearer',
        user: {
          id: '6dc4fa1b-8f6d-49a7-b65e-36ee0af42c4e',
          full_name: 'Mira Shah',
          email: 'mira.shah@example.com',
          role: 'customer',
        },
      }),
    )
    server.use(
      http.get('http://localhost:8000/api/vehicles/search', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('make')).toBe('Porsche')
        return HttpResponse.json({
          items: [
            {
              id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              vin: 'WP0AB2A91NS294821',
              make: 'Porsche',
              model: '911 GT3 (992)',
              category: 'coupe',
              condition: 'new',
              year: 2024,
              mileage_km: 120,
              fuel_type: 'petrol',
              transmission: 'automatic',
              price: '225000.00',
              quantity: 2,
              description: 'Track-honed naturally aspirated flat-six coupe.',
              image_url: null,
              deleted_at: null,
              created_at: '2026-10-24T00:00:00Z',
              updated_at: '2026-10-24T00:00:00Z',
            },
          ],
          meta: { page: 1, page_size: 12, total: 1, total_pages: 1 },
        })
      }),
      http.get('http://localhost:8000/api/vehicles', () => {
        return HttpResponse.json({
          items: [],
          meta: { page: 1, page_size: 12, total: 0, total_pages: 0 },
        })
      }),
    )

    const { user } = renderApp('/showroom?make=Porsche')

    expect(await screen.findByText('Showing 1 curated vehicle')).toBeInTheDocument()
    expect(screen.getByText('Make: Porsche')).toBeInTheDocument()
    const removeChipBtn = screen.getByRole('button', { name: /Remove Make: Porsche filter/i })
    expect(removeChipBtn).toBeInTheDocument()

    await user.click(removeChipBtn)
    expect(screen.queryByText('Make: Porsche')).not.toBeInTheDocument()
  })
})
