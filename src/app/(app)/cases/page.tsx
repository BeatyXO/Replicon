'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRecentCases } from '@/lib/genlayer/contract'
import { ResearchCase } from '@/types'
import { CaseCard } from '@/components/cases/CaseCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { RESEARCH_DOMAINS } from '@/lib/constants'
import { FlaskConical, Plus, Search } from 'lucide-react'

export default function CasesPage() {
  const [cases, setCases] = useState<ResearchCase[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    getRecentCases(50).then(setCases).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = cases.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    if (domain && c.domain !== domain) return false
    if (status && c.status !== status) return false
    return true
  })

  const inputClass = "px-3 py-2 text-sm bg-[#6E3482]/20 border border-[#6E3482]/40 rounded-md text-[#F5EBFA] placeholder-[#E7DBEF]/30 focus:outline-none focus:border-[#A56ABD]/50"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-[#F5EBFA] tracking-wide">RESEARCH CASES</h1>
          <p className="text-[#E7DBEF]/50 text-sm mt-1">{cases.length} cases in registry</p>
        </div>
        <Link
          href="/cases/new"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#6E3482] hover:bg-[#6E3482]/80 text-[#F5EBFA] text-sm font-medium border border-[#A56ABD]/40"
        >
          <Plus className="h-4 w-4" /> New Case
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A56ABD]/50" />
          <input
            type="text"
            placeholder="Search cases…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 ${inputClass}`}
          />
        </div>
        <select value={domain} onChange={e => setDomain(e.target.value)} className={inputClass}>
          <option value="">All Domains</option>
          {RESEARCH_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="reviewed">Reviewed</option>
          <option value="reviewed_needs_expert">Needs Expert</option>
          <option value="expert_reviewed">Expert Reviewed</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading research cases…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FlaskConical} title="No cases found" description="Try adjusting your filters." />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => <CaseCard key={c.case_id} case_={c} />)}
        </div>
      )}
    </div>
  )
}
