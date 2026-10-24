import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { renderApp } from '../../../test/renderApp'
import { server } from '../../../test/server'

describe('administrator inventory desk', () => {
  it('shows live inventory and lets an administrator restock a vehicle', async () => {
    const vehicle = {
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
      quantity: 1,
      description: 'Single-owner sedan with verified service history.',
      image_url: null,
      deleted_at: null,
      created_at: '2026-10-24T00:00:00Z',
      updated_at: '2026-10-24T00:00:00Z',
    }
    window.localStorage.setItem(
      'aretiva.session',
      JSON.stringify({
        access_token: 'admin-access-token',
        token_type: 'bearer',
        user: {
          id: '6dc4fa1b-8f6d-49a7-b65e-36ee0af42c4e',
          full_name: 'Aretiva Administrator',
          email: 'admin@aretiva.test',
          role: 'admin',
        },
      }),
    )
    server.use(
      http.get('http://localhost:8000/api/vehicles', () =>
        HttpResponse.json({
          items: [vehicle],
          meta: { page: 1, page_size: 12, total: 1, total_pages: 1 },
        }),
      ),
      http.post(
        `http://localhost:8000/api/vehicles/${vehicle.id}/restock`,
        async ({ request }) => {
          expect(await request.json()).toEqual({ quantity: 2 })
          return HttpResponse.json({
            transaction_id: 'ca18ad1e-a38c-4c8d-9c10-0b119ed7f60f',
            vehicle_id: vehicle.id,
            quantity_remaining: 3,
          })
        },
      ),
    )
    const { user } = renderApp('/admin/inventory')

    expect(
      screen.getByRole('heading', { name: 'Inventory desk.' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Honda City ZX')).toBeInTheDocument()
    expect(screen.getByText(/Low Stock/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Restock 2' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Stock updated to 3 units.',
    )
  })

  it('switches to the activity ledger tab and displays transaction history', async () => {
    window.localStorage.setItem(
      'aretiva.session',
      JSON.stringify({
        access_token: 'admin-access-token',
        token_type: 'bearer',
        user: {
          id: '6dc4fa1b-8f6d-49a7-b65e-36ee0af42c4e',
          full_name: 'Aretiva Administrator',
          email: 'admin@aretiva.test',
          role: 'admin',
        },
      }),
    )
    server.use(
      http.get('http://localhost:8000/api/vehicles', () =>
        HttpResponse.json({
          items: [],
          meta: { page: 1, page_size: 12, total: 0, total_pages: 0 },
        }),
      ),
      http.get('http://localhost:8000/api/admin/activity', () =>
        HttpResponse.json({
          items: [
            {
              id: 'a9104fa2-1234-5678-90ab-cdef12345678',
              transaction_type: 'purchase',
              quantity_delta: -1,
              quantity_before: 2,
              quantity_after: 1,
              created_at: '2026-10-25T01:00:00Z',
              vehicle_id: '2fcfe17b-fb81-4c89-a5c4-d63fd1dd6baa',
              vehicle_make: 'Porsche',
              vehicle_model: '911 GT3 (992)',
              vehicle_year: 2024,
              user_id: 'customer-uuid',
            },
          ],
          meta: { page: 1, page_size: 20, total: 1, total_pages: 1 },
        }),
      ),
    )

    const { user } = renderApp('/admin/inventory')

    const activityTabBtn = await screen.findByRole('button', { name: /Activity Ledger/i })
    expect(activityTabBtn).toBeInTheDocument()

    await user.click(activityTabBtn)
    expect(await screen.findByText('Porsche 911 GT3 (992)')).toBeInTheDocument()
    expect(screen.getByText('-1 unit')).toBeInTheDocument()
    expect(screen.getByText('Purchase')).toBeInTheDocument()
  })
})
