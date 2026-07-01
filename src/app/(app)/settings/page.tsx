'use client'

import { useWalletStore } from '@/store/wallet'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { explorerAddressUrl } from '@/lib/utils'
import { CONTRACT_ADDRESS, GENLAYER_RPC_URL, EXPLORER_URL } from '@/lib/constants'
import { ExternalLink, Settings } from 'lucide-react'

export default function SettingsPage() {
  const { address, isConnected } = useWalletStore()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-bold text-3xl text-[#F5EBFA] tracking-wide">SETTINGS</h1>
        <p className="text-[#E7DBEF]/50 text-sm mt-1">Wallet and network configuration</p>
      </div>

      <div className="terminal-card p-5 space-y-4">
        <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
          <Settings className="h-4 w-4" /> Wallet
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-[#E7DBEF]/60 text-sm">Connection Status</p>
          <ConnectButton />
        </div>
        {isConnected && address && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-[#E7DBEF]/60 text-sm shrink-0">Address</p>
            <a
              href={explorerAddressUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-mono text-[#A56ABD] hover:text-[#F5EBFA] transition-colors truncate"
            >
              {address} <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        )}
      </div>

      <div className="terminal-card p-5 space-y-3">
        <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider">Network</h2>
        {[
          { label: 'Network', value: 'StudioNet (GenLayer)' },
          { label: 'RPC URL', value: GENLAYER_RPC_URL },
          { label: 'Contract Address', value: CONTRACT_ADDRESS || 'Not configured — deploy contract first' },
          { label: 'Explorer', value: EXPLORER_URL },
        ].map(row => (
          <div key={row.label} className="flex items-start justify-between gap-4 py-2 border-b border-[#6E3482]/30 last:border-0">
            <p className="text-[#E7DBEF]/50 text-xs shrink-0">{row.label}</p>
            <p className="text-[#E7DBEF]/80 text-xs font-mono text-right break-all max-w-xs">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="terminal-card p-5 space-y-3">
        <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider">Deployment Guide</h2>
        <div className="space-y-2 text-xs text-[#E7DBEF]/60">
          <p>1. Deploy the Intelligent Contract via GenLayer Studio</p>
          <p>2. Copy the contract address</p>
          <p>3. Set <code className="font-mono bg-[#6E3482]/30 px-1 rounded">NEXT_PUBLIC_CONTRACT_ADDRESS</code> in <code className="font-mono bg-[#6E3482]/30 px-1 rounded">.env.local</code></p>
          <p>4. Restart the dev server</p>
        </div>
      </div>
    </div>
  )
}
