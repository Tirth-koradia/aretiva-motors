import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { renderApp } from '../../../test/renderApp'
import { server } from '../../../test/server'

describe('purchase history page', () => {
  it('shows the signed-in customer their recorded vehicle request', async () => {
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
      http.get('http://localhost:8000/api/purchases', ({ request }) => {
        expect(request.headers.get('authorization')).toBe(
          'Bearer test-access-token',
        )
        return HttpResponse.json({
          items: [
            {
              id: 'ca18ad1e-a38c-4c8d-9c10-0b119ed7f60f',
              quantity: 1,
              purchased_at: '2026-10-24T00:00:00Z',
              vehicle: {
                id: '2fcfe17b-fb81-4c89-a5c4-d63fd1dd6baa',
                make: 'Honda',
                model: 'City ZX',
                year: 2023,
                price: '1489000.00',
                image_url: null,
              },
            },
          ],
          meta: { page: 1, page_size: 12, total: 1, total_pages: 1 },
        })
      }),
    )

    renderApp('/purchases')

    expect(
      await screen.findByRole('heading', { name: 'Your considerations.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Honda City ZX')).toBeInTheDocument()
    expect(screen.getByText('₹14,89,000')).toBeInTheDocument()
  })
})
