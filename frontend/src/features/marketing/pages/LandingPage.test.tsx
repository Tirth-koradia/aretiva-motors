import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderApp } from '../../../test/renderApp'

describe('public landing page', () => {
  it('introduces the brand and offers clear paths to login and the showroom', () => {
    renderApp('/')

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Aretiva Motors' }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Curated automobiles. Considered journeys.'),
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(
      screen.getByRole('link', { name: 'Explore the showroom' }),
    ).toHaveAttribute('href', '/showroom')
  })
})
