'use client'

import { useWalletStore } from '@/store/wallet'
import { shortAddress } from '@/lib/utils'
import { Wallet, LogOut, Loader2 } from 'lucide-react'

export function ConnectButton() {
  const { address, isConnected, isConnecting, connect, disconnect, error } = useWalletStore()

  if (isConnecting) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#6E3482]/50 text-[#E7DBEF] text-sm cursor-wait"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting…
      </button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#6E3482]/30 border border-[#A56ABD]/30 text-sm text-[#E7DBEF]">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          {shortAddress(address)}
        </div>
        <button
          onClick={disconnect}
          className="p-1.5 rounded-md hover:bg-[#6E3482]/40 text-[#A56ABD] hover:text-[#F5EBFA] transition-colors"
          title="Disconnect"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#6E3482] hover:bg-[#6E3482]/80 text-[#F5EBFA] text-sm font-medium transition-colors border border-[#A56ABD]/40"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
