import { scoreColor } from '@/lib/utils'

interface ScoreBarProps {
  label: string
  value: number
  max?: number
  className?: string
}

export function ScoreBar({ label, value, max = 100, className }: ScoreBarProps) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className={className ?? '' + ' space-y-1'}>
      <div className="flex justify-between items-center text-xs">
        <span className="text-[#E7DBEF]/70">{label}</span>
        <span className={`font-mono font-semibold ${scoreColor(pct)}`}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-[#6E3482]/40 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct >= 80
              ? '#4ade80'
              : pct >= 60
              ? '#facc15'
              : pct >= 40
              ? '#fb923c'
              : '#f87171',
          }}
        />
      </div>
    </div>
  )
}
