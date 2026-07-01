const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  open:         { label: 'Open',         classes: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
  under_review: { label: 'Under Review', classes: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
  reviewed:     { label: 'Reviewed',     classes: 'text-green-400 border-green-400/30 bg-green-400/10' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, classes: 'text-[#E7DBEF] border-[#A56ABD]/30 bg-[#A56ABD]/10' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}
