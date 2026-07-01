import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className ?? ''}`}>
      {Icon && (
        <div className="p-4 rounded-full bg-[#6E3482]/30 border border-[#6E3482]/50 mb-4">
          <Icon className="h-8 w-8 text-[#A56ABD]/60" />
        </div>
      )}
      <h3 className="text-[#E7DBEF]/80 font-medium mb-1">{title}</h3>
      {description && <p className="text-[#E7DBEF]/50 text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
