import { create } from 'zustand'
import { requestAccounts, getAccounts, switchToGenLayerNetwork } from '@/lib/wallet/provider'

interface WalletStore {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  setAddress: (addr: string | null) => void
  init: () => Promise<void>
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  connect: async () => {
    set({ isConnecting: true, error: null })
    try {
      const accounts = await requestAccounts()
      const addr = accounts[0] ?? null
      // Switch wallet to GenLayer StudioNet automatically
      await switchToGenLayerNetwork()
      set({ address: addr, isConnected: !!addr, isConnecting: false })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to connect wallet'
      set({ error: msg, isConnecting: false })
    }
  },

  disconnect: () => {
    set({ address: null, isConnected: false, error: null })
  },

  setAddress: (addr) => {
    set({ address: addr, isConnected: !!addr })
  },

  init: async () => {
    const accounts = await getAccounts()
    if (accounts.length > 0) {
      set({ address: accounts[0], isConnected: true })
      // Ensure correct network on page load if already connected
      try {
        await switchToGenLayerNetwork()
      } catch {
        // silent — user can switch manually
      }
    }
  },
}))
