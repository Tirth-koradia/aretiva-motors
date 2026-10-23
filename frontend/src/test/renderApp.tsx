import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { AppProviders } from '../app/AppProviders'
import { createAppQueryClient } from '../app/queryClient'
import { appRoutes } from '../app/router'

export function renderApp(initialEntry = '/') {
  const queryClient = createAppQueryClient()
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialEntry],
  })

  return {
    router,
    queryClient,
    user: userEvent.setup(),
    ...render(
      <AppProviders queryClient={queryClient}>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  }
}
