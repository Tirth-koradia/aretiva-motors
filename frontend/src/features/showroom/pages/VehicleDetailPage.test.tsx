import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { renderApp } from '../../../test/renderApp'
import { server } from '../../../test/server'

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

describe('vehicle detail page', () => {
  it('presents one vehicle and records a deliberate single-unit purchase', async () => {
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
      http.get(`http://localhost:8000/api/vehicles/${vehicle.id}`, () =>
        HttpResponse.json(vehicle),
      ),
      http.post(
        `http://localhost:8000/api/vehicles/${vehicle.id}/purchase`,
        ({ request }) => {
          expect(request.headers.get('authorization')).toBe(
            'Bearer test-access-token',
          )
          return HttpResponse.json(
            {
              transaction_id: 'ca18ad1e-a38c-4c8d-9c10-0b119ed7f60f',
              vehicle_id: vehicle.id,
              quantity_remaining: 0,
            },
            { status: 201 },
          )
        },
      ),
    )
    const { user } = renderApp(`/showroom/${vehicle.id}`)

    expect(
      await screen.findByRole('heading', { name: 'Honda City ZX' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Single-owner sedan with verified service history.'),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Record purchase request' }),
    )

    expect(
      await screen.findByText('Purchase request recorded.'),
    ).toBeInTheDocument()
  })
})
