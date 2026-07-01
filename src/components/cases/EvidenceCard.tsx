import { Evidence } from '@/types'
import { shortAddress } from '@/lib/utils'
import { ExternalLink, Link2, User, Calendar } from 'lucide-react'

export function EvidenceCard({ evidence: e }: { evidence: Evidence }) {
  return (
    <div className="terminal-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[#F5EBFA] text-sm font-medium">{e.title}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-[#6E3482]/50 text-[#A56ABD] border border-[#A56ABD]/20">
            {e.evidence_type}
          </span>
        </div>
        <a
          href={e.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#A56ABD] hover:text-[#F5EBFA] transition-colors shrink-0"
        >
          View <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {e.relevance_note && (
        <p className="text-xs text-[#E7DBEF]/60 italic">&ldquo;{e.relevance_note}&rdquo;</p>
      )}

      {e.author_list && (
        <p className="text-xs text-[#E7DBEF]/50">{e.author_list}</p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#E7DBEF]/40 border-t border-[#6E3482]/30 pt-2">
        <span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> {e.source_name}</span>
        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {shortAddress(e.submitted_by)}</span>
        {e.publication_year && (
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {e.publication_year}</span>
        )}
      </div>

      {e.url_hash && (
        <p className="font-mono text-xs text-[#E7DBEF]/25 truncate">SHA256: {e.url_hash}</p>
      )}
    </div>
  )
}
