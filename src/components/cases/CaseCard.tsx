import Link from 'next/link'
import { ResearchCase } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { shortAddress, verdictColor, scoreColor } from '@/lib/utils'
import { FlaskConical, FileText, User, BookOpen, GitBranch } from 'lucide-react'
import { VERDICT_LABELS } from '@/lib/constants'

interface CaseCardProps {
  case_: ResearchCase
}

export function CaseCard({ case_: c }: CaseCardProps) {
  const verdict = c.verdict
  return (
    <Link href={`/cases/${c.case_id}`}>
      <article className="terminal-card p-4 hover:border-[#A56ABD]/50 transition-all duration-200 cursor-pointer group h-full flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2">
            <FlaskConical className="h-4 w-4 text-[#A56ABD] shrink-0 mt-0.5" />
            <h3 className="text-[#F5EBFA] text-sm font-semibold line-clamp-2 group-hover:text-[#A56ABD] transition-colors">
              {c.title}
            </h3>
          </div>
          <StatusBadge status={c.status} />
        </div>

        <p className="text-xs text-[#E7DBEF]/50 mb-3 line-clamp-2 flex-1">{c.summary}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#E7DBEF]/40 mb-3">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> {c.domain}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" /> {shortAddress(c.owner)}
          </span>
        </div>

        {verdict && (
          <div className="mb-3 flex items-center justify-between bg-white/5 rounded px-3 py-2">
            <span className={`text-xs font-medium ${verdictColor(verdict.credibility_verdict)}`}>
              {VERDICT_LABELS[verdict.credibility_verdict] ?? verdict.credibility_verdict}
            </span>
            <span className={`text-sm font-mono font-bold ${scoreColor(verdict.replication_score)}`}>
              {verdict.replication_score}%
            </span>
          </div>
        )}

        <div className="flex gap-3 text-xs text-[#E7DBEF]/40 border-t border-[#6E3482]/30 pt-2">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {c.evidence_count ?? 0} evidence
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" /> {c.replication_count ?? 0} replications
          </span>
        </div>
      </article>
    </Link>
  )
}
