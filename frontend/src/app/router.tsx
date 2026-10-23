import type { RouteObject } from 'react-router-dom'

import { RoutePlaceholder } from '../components/layout/RoutePlaceholder'
import { LandingPage } from '../features/marketing/pages/LandingPage'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <RoutePlaceholder title="Login" />,
  },
  {
    path: '/showroom',
    element: <RoutePlaceholder title="Showroom" />,
  },
  {
    path: '*',
    element: <RoutePlaceholder title="Page not found" />,
  },
]
