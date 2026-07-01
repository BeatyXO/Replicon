'use client'

import { useTxStore } from '@/store/tx'
import { explorerTxUrl } from '@/lib/utils'
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react'

export function TxPanel() {
  const { status, hash, error, reset } = useTxStore()

  if (status === 'idle') return null

  return (
    <div className="fixed bottom-4 left-4 z-50 terminal-card-elevated p-4 max-w-sm animate-fade-in-up">
      {status === 'pending' && (
        <div className="flex items-center gap-3 text-[#E7DBEF]">
          <Loader2 className="h-5 w-5 animate-spin text-[#A56ABD] shrink-0" />
          <div>
            <p className="text-sm font-medium">Transaction Pending</p>
            <p className="text-xs text-[#E7DBEF]/60 mt-0.5">Awaiting GenLayer consensus…</p>
          </div>
        </div>
      )}
      {status === 'success' && hash && (
        <div className="flex items-start gap-3 text-green-400">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Transaction Confirmed</p>
            <a
              href={explorerTxUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#A56ABD] hover:text-[#F5EBFA] mt-0.5 truncate"
            >
              View on Explorer <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
          <button onClick={reset} className="text-[#E7DBEF]/40 hover:text-[#F5EBFA] text-xs shrink-0">✕</button>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-start gap-3 text-red-400">
          <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Transaction Failed</p>
            <p className="text-xs text-red-400/70 mt-0.5 break-words">{error}</p>
          </div>
          <button onClick={reset} className="text-[#E7DBEF]/40 hover:text-[#F5EBFA] text-xs shrink-0">✕</button>
        </div>
      )}
    </div>
  )
}
