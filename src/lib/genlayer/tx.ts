import { explorerTxUrl } from '@/lib/utils'

export interface TxReceipt {
  hash: string
  explorerUrl: string
}

export function buildTxReceipt(hash: string): TxReceipt {
  return { hash, explorerUrl: explorerTxUrl(hash) }
}
