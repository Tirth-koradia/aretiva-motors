import { http, HttpResponse } from 'msw'
import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderApp } from '../../../test/renderApp'
import { server } from '../../../test/server'

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigateSpy }
})

describe('login page', () => {
  afterEach(() => navigateSpy.mockReset())

  it('submits credentials, persists the returned session, and enters the showroom', async () => {
    server.use(
      http.post('http://localhost:8000/api/auth/login', async ({ request }) => {
        expect(await request.json()).toEqual({
          email: 'tirth.koradia@example.com',
          password: 'Aretiva!Pass2026',
        })
        return HttpResponse.json({
          access_token: 'test-access-token',
          token_type: 'bearer',
          user: {
            id: '6dc4fa1b-8f6d-49a7-b65e-36ee0af42c4e',
            full_name: 'Tirth Koradia',
            email: 'tirth.koradia@example.com',
            role: 'customer',
          },
        })
      }),
    )
    const { user } = renderApp('/login')

    await user.type(
      screen.getByLabelText('Email address'),
      'tirth.koradia@example.com',
    )
    await user.type(screen.getByLabelText('Password'), 'Aretiva!Pass2026')
    await user.click(screen.getByRole('button', { name: 'Enter the showroom' }))

    await expect
      .poll(() => window.localStorage.getItem('aretiva.session'))
      .toContain('test-access-token')
    expect(navigateSpy).toHaveBeenCalledWith('/showroom')
  })

  it('autofills customer and admin credentials when clicking reviewer buttons', async () => {
    const { user } = renderApp('/login')

    const customerBtn = screen.getByRole('button', { name: /Customer Demo/i })
    const adminBtn = screen.getByRole('button', { name: /Admin Demo/i })

    await user.click(customerBtn)
    expect(screen.getByLabelText('Email address')).toHaveValue(
      'tirth.koradia@example.com',
    )
    expect(screen.getByLabelText('Password')).toHaveValue('Customer1234!')

    await user.click(adminBtn)
    expect(screen.getByLabelText('Email address')).toHaveValue(
      'admin@aretiva.com',
    )
    expect(screen.getByLabelText('Password')).toHaveValue('ChangeMe123!')
  })
})

