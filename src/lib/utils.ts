import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function explorerTxUrl(hash: string): string {
  const base = process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://studio.genlayer.com'
  return `${base}/tx/${hash}`
}

export function explorerAddressUrl(addr: string): string {
  const base = process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://studio.genlayer.com'
  return `${base}/address/${addr}`
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

export function verdictColor(verdict: string): string {
  const map: Record<string, string> = {
    highly_credible: 'text-green-400',
    credible: 'text-green-300',
    partially_credible: 'text-yellow-400',
    insufficient_evidence: 'text-orange-400',
    not_credible: 'text-red-400',
    pending: 'text-brand-500',
  }
  return map[verdict] ?? 'text-brand-100'
}
