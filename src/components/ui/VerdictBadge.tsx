import { verdictColor } from '@/lib/utils'
import { VERDICT_LABELS } from '@/lib/constants'

interface VerdictBadgeProps {
  verdict: string
  className?: string
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const label = VERDICT_LABELS[verdict] ?? verdict
  const color = verdictColor(verdict)
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color} border-current/30 bg-current/10 ${className ?? ''}`}
    >
      {label}
    </span>
  )
}
