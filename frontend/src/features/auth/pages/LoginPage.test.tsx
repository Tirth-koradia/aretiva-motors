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
          email: 'mira.shah@example.com',
          password: 'Aretiva!Pass2026',
        })
        return HttpResponse.json({
          access_token: 'test-access-token',
          token_type: 'bearer',
          user: {
            id: '6dc4fa1b-8f6d-49a7-b65e-36ee0af42c4e',
            full_name: 'Mira Shah',
            email: 'mira.shah@example.com',
            role: 'customer',
          },
        })
      }),
    )
    const { user } = renderApp('/login')

    await user.type(
      screen.getByLabelText('Email address'),
      'mira.shah@example.com',
    )
    await user.type(screen.getByLabelText('Password'), 'Aretiva!Pass2026')
    await user.click(screen.getByRole('button', { name: 'Enter the showroom' }))

    await expect
      .poll(() => window.localStorage.getItem('aretiva.session'))
      .toContain('test-access-token')
    expect(navigateSpy).toHaveBeenCalledWith('/showroom')
  })
})
