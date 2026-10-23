import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderApp } from '../../../test/renderApp'
import { server } from '../../../test/server'

const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigateSpy }
})

describe('registration page', () => {
  afterEach(() => navigateSpy.mockReset())

  it('creates a customer account and returns the visitor to login', async () => {
    server.use(
      http.post(
        'http://localhost:8000/api/auth/register',
        async ({ request }) => {
          expect(await request.json()).toEqual({
            full_name: 'Mira Shah',
            email: 'mira.shah@example.com',
            password: 'Aretiva!Pass2026',
          })
          return HttpResponse.json(
            {
              id: '6dc4fa1b-8f6d-49a7-b65e-36ee0af42c4e',
              full_name: 'Mira Shah',
              email: 'mira.shah@example.com',
              role: 'customer',
              created_at: '2026-10-24T00:00:00Z',
            },
            { status: 201 },
          )
        },
      ),
    )
    const { user } = renderApp('/register')

    await user.type(screen.getByLabelText('Full name'), 'Mira Shah')
    await user.type(
      screen.getByLabelText('Email address'),
      'mira.shah@example.com',
    )
    await user.type(screen.getByLabelText('Password'), 'Aretiva!Pass2026')
    await user.click(
      screen.getByRole('button', { name: 'Create customer account' }),
    )

    await expect.poll(() => navigateSpy).toHaveBeenCalledWith('/login')
  })
})
