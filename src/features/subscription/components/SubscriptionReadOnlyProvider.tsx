'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useCurrentSubscriptionQuery } from '../hooks/use-subscription'

interface SubscriptionReadOnlyContextValue {
  readonly isReadOnly: boolean
  readonly isLoading: boolean
  readonly reason: string
}

const READ_ONLY_REASON =
  'Gói dịch vụ đã hết hạn. Vui lòng gia hạn để tiếp tục thao tác ghi dữ liệu.'

const SubscriptionReadOnlyContext = createContext<SubscriptionReadOnlyContextValue | null>(null)

interface SubscriptionReadOnlyProviderProps {
  readonly children: ReactNode
}

export function SubscriptionReadOnlyProvider({ children }: SubscriptionReadOnlyProviderProps) {
  const user = useAuthStore((state) => state.user)
  const subscriptionQuery = useCurrentSubscriptionQuery(!!user)
  const isReadOnly = Boolean(subscriptionQuery.data?.isExpired)

  return (
    <SubscriptionReadOnlyContext.Provider
      value={{
        isReadOnly,
        isLoading: subscriptionQuery.isLoading,
        reason: READ_ONLY_REASON,
      }}
    >
      {children}
    </SubscriptionReadOnlyContext.Provider>
  )
}

export function useSubscriptionReadOnly(): SubscriptionReadOnlyContextValue {
  const context = useContext(SubscriptionReadOnlyContext)

  return (
    context ?? {
      isReadOnly: false,
      isLoading: false,
      reason: READ_ONLY_REASON,
    }
  )
}
