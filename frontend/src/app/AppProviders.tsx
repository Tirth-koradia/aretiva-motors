import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { useState, type PropsWithChildren } from 'react'

import { createAppQueryClient } from './queryClient'

type AppProvidersProps = PropsWithChildren<{
  queryClient?: QueryClient
}>

export function AppProviders({ children, queryClient }: AppProvidersProps) {
  const [ownedQueryClient] = useState(createAppQueryClient)

  return (
    <QueryClientProvider client={queryClient ?? ownedQueryClient}>
      {children}
    </QueryClientProvider>
  )
}
