import type { RouteObject } from 'react-router-dom'

import { RoutePlaceholder } from '../components/layout/RoutePlaceholder'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { LandingPage } from '../features/marketing/pages/LandingPage'
import { ShowroomPage } from '../features/showroom/pages/ShowroomPage'
import { VehicleDetailPage } from '../features/showroom/pages/VehicleDetailPage'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/showroom',
    element: <ShowroomPage />,
  },
  {
    path: '/showroom/:vehicleId',
    element: <VehicleDetailPage />,
  },
  {
    path: '*',
    element: <RoutePlaceholder title="Page not found" />,
  },
]
