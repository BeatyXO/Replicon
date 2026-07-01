import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className ?? ''}`}>
      <Loader2 className="h-8 w-8 animate-spin text-[#A56ABD]" />
      {label && <p className="text-sm text-[#E7DBEF]/60">{label}</p>}
    </div>
  )
}
