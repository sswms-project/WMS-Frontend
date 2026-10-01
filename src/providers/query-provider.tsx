'use client'

import { useEffect } from 'react'
import { QueryClientProvider, useIsMutating } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useTopLoader } from 'nextjs-toploader'
import { queryClient } from '@/lib/query-client'

function MutationTopLoader() {
  const isMutating = useIsMutating() > 0
  const { start, done } = useTopLoader()

  useEffect(() => {
    if (isMutating) start()
    else done()
  }, [done, isMutating, start])

  return null
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MutationTopLoader />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
