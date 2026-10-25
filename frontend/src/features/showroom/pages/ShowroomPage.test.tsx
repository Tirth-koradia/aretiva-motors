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
          full_name: 'Tirth Koradia',
          email: 'tirth.koradia@example.com',
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
          full_name: 'Tirth Koradia',
          email: 'tirth.koradia@example.com',
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
          full_name: 'Tirth Koradia',
          email: 'tirth.koradia@example.com',
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

  it('allows comparing vehicles side by side in a comparison modal', async () => {
    window.localStorage.setItem(
      'aretiva.session',
      JSON.stringify({
        access_token: 'test-access-token',
        token_type: 'bearer',
        user: {
          id: '6dc4fa1b-8f6d-49a7-b65e-36ee0af42c4e',
          full_name: 'Tirth Koradia',
          email: 'tirth.koradia@example.com',
          role: 'customer',
        },
      }),
    )

    const vehicleA = {
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
    }
    const vehicleB = {
      id: '3c8ffb6a-9694-4d1a-be19-5d233c46e017',
      vin: 'WP0AF2A97RS273819',
      make: 'Porsche',
      model: '911 GT3 (992)',
      category: 'coupe',
      condition: 'new',
      year: 2024,
      mileage_km: 120,
      fuel_type: 'petrol',
      transmission: 'automatic',
      price: '27500000.00',
      quantity: 1,
      description: 'Track-focused GT supercar.',
      image_url: null,
      deleted_at: null,
      created_at: '2026-10-24T00:00:00Z',
      updated_at: '2026-10-24T00:00:00Z',
    }

    server.use(
      http.get('http://localhost:8000/api/vehicles', () => {
        return HttpResponse.json({
          items: [vehicleA, vehicleB],
          meta: { page: 1, page_size: 12, total: 2, total_pages: 1 },
        })
      }),
    )

    const { user } = renderApp('/showroom')

    expect(await screen.findByRole('heading', { name: 'Honda City ZX' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Porsche 911 GT3 (992)' })).toBeInTheDocument()

    // Floating comparison tray should not be visible initially
    expect(screen.queryByLabelText('Vehicle comparison tray')).not.toBeInTheDocument()

    // Add first vehicle to comparison
    const compareBtnA = screen.getByRole('button', { name: /Compare Honda City ZX/i })
    await user.click(compareBtnA)

    // Tray appears with 1 vehicle selected
    expect(await screen.findByLabelText('Vehicle comparison tray')).toBeInTheDocument()
    expect(screen.getByText(/Compare \(1\/3\)/i)).toBeInTheDocument()

    // Specifications button should be disabled for 1 vehicle
    const compareSpecsBtn = screen.getByRole('button', { name: /Compare Specifications/i })
    expect(compareSpecsBtn).toBeDisabled()

    // Add second vehicle to comparison
    const compareBtnB = screen.getByRole('button', { name: /Compare Porsche 911 GT3/i })
    await user.click(compareBtnB)

    expect(screen.getByText(/Compare \(2\/3\)/i)).toBeInTheDocument()
    expect(compareSpecsBtn).toBeEnabled()

    // Open side-by-side comparison modal
    await user.click(compareSpecsBtn)

    expect(await screen.findByRole('dialog', { name: /Vehicle Comparison Modal/i })).toBeInTheDocument()
    expect(screen.getByText('Side-by-Side Specification Review')).toBeInTheDocument()
    expect(screen.getByText('Evaluating 2 distinguished motorcars from the collection.')).toBeInTheDocument()

    // Close comparison modal
    const closeBtn = screen.getByRole('button', { name: 'Close Comparison' })
    await user.click(closeBtn)
    expect(screen.queryByRole('dialog', { name: /Vehicle Comparison Modal/i })).not.toBeInTheDocument()
  })
})
