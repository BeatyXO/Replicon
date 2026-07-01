import { create } from 'zustand'

interface TxStore {
  hash: string | null
  status: 'idle' | 'pending' | 'success' | 'error'
  error: string | null
  setPending: (hash?: string) => void
  setSuccess: (hash: string) => void
  setError: (err: string) => void
  reset: () => void
}

export const useTxStore = create<TxStore>((set) => ({
  hash: null,
  status: 'idle',
  error: null,
  setPending: (hash) => set({ status: 'pending', hash: hash ?? null, error: null }),
  setSuccess: (hash) => set({ status: 'success', hash, error: null }),
  setError: (err) => set({ status: 'error', error: err }),
  reset: () => set({ hash: null, status: 'idle', error: null }),
}))
