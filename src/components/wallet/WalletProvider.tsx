'use client'

import { useEffect } from 'react'
import { useWalletStore } from '@/store/wallet'
import { onAccountsChanged } from '@/lib/wallet/provider'

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { init, setAddress } = useWalletStore()

  useEffect(() => {
    init()
    const unsub = onAccountsChanged((accounts) => {
      setAddress(accounts[0] ?? null)
    })
    return unsub
  }, [init, setAddress])

  return <>{children}</>
}
