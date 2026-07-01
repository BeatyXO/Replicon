'use client'

import { useEffect, useState } from 'react'
import { getRecentCases, getCaseEvidence } from '@/lib/genlayer/contract'
import { Evidence } from '@/types'
import { EvidenceCard } from '@/components/cases/EvidenceCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { EVIDENCE_TYPES } from '@/lib/constants'
import { Link2, Search } from 'lucide-react'

export default function EvidenceRegistryPage() {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    async function load() {
      const cases = await getRecentCases(50)
      const evArrays = await Promise.all(cases.map(c => getCaseEvidence(c.case_id)))
      setEvidence(evArrays.flat())
      setLoading(false)
    }
    load().catch(console.error)
  }, [])

  const filtered = evidence.filter(e => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter && e.evidence_type !== typeFilter) return false
    return true
  })

  const inputClass = "px-3 py-2 text-sm bg-[#6E3482]/20 border border-[#6E3482]/40 rounded-md text-[#F5EBFA] placeholder-[#E7DBEF]/30 focus:outline-none focus:border-[#A56ABD]/50"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl text-[#F5EBFA] tracking-wide">EVIDENCE REGISTRY</h1>
        <p className="text-[#E7DBEF]/50 text-sm mt-1">
          {evidence.length} evidence items across all research cases
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A56ABD]/50" />
          <input
            type="text"
            placeholder="Search evidence…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 ${inputClass}`}
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={inputClass}>
          <option value="">All Types</option>
          {EVIDENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading evidence registry…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No evidence found"
          description="Evidence items from all research cases will appear here."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(e => <EvidenceCard key={e.evidence_id} evidence={e} />)}
        </div>
      )}
    </div>
  )
}
