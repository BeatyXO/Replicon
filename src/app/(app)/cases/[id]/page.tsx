'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useWalletStore } from '@/store/wallet'
import { useTxStore } from '@/store/tx'
import {
  getCaseFullDetail, getCaseEvidence, getCaseVerdict,
  submitEvidence, requestReview, waitForTransaction,
} from '@/lib/genlayer/contract'
import { ResearchCase, Evidence, ConsensusVerdict } from '@/types'
import { VerdictPanel } from '@/components/consensus/VerdictPanel'
import { EvidenceCard } from '@/components/cases/EvidenceCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { validateEvidence, hashUrl } from '@/lib/validation/schemas'
import { EVIDENCE_TYPES } from '@/lib/constants'
import { shortAddress } from '@/lib/utils'
import { toast } from 'sonner'
import {
  FlaskConical, Plus, Zap, FileText, User, Calendar,
  Loader2, ChevronDown, ChevronUp, GitBranch, BookOpen,
} from 'lucide-react'

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { address, isConnected } = useWalletStore()
  const { setPending, setSuccess, setError: setTxError, reset } = useTxStore()

  const [caseData, setCaseData] = useState<ResearchCase | null>(null)
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [verdict, setVerdict] = useState<ConsensusVerdict | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEvidenceForm, setShowEvidenceForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [requesting, setRequesting] = useState(false)

  const [evidenceForm, setEvidenceForm] = useState({
    title: '', evidenceType: '', url: '', sourceName: '', relevanceNote: '',
  })
  const [evidenceErrors, setEvidenceErrors] = useState<string[]>([])

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        const [c, ev, v] = await Promise.all([
          getCaseFullDetail(id),
          getCaseEvidence(id),
          getCaseVerdict(id),
        ])
        setCaseData(c)
        setEvidence(ev)
        setVerdict(v)
      } catch (e: unknown) {
        toast.error('Failed to load case: ' + (e instanceof Error ? e.message : String(e)))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleSubmitEvidence(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateEvidence(evidenceForm)
    if (errs.length > 0) { setEvidenceErrors(errs); return }
    if (!address) { toast.error('Connect wallet first'); return }

    setEvidenceErrors([])
    setSubmitting(true)
    reset(); setPending()
    try {
      const hash = await hashUrl(evidenceForm.url)
      const txHash = await submitEvidence(address as `0x${string}`, { caseId: id, ...evidenceForm, hash })
      setPending(txHash)
      await waitForTransaction(txHash)
      setSuccess(txHash)
      toast.success('Evidence submitted!')
      const ev = await getCaseEvidence(id)
      setEvidence(ev)
      setEvidenceForm({ title: '', evidenceType: '', url: '', sourceName: '', relevanceNote: '' })
      setShowEvidenceForm(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      setTxError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRequestReview() {
    if (!address) { toast.error('Connect wallet first'); return }
    setRequesting(true)
    reset(); setPending()
    try {
      const txHash = await requestReview(address as `0x${string}`, id)
      setPending(txHash)
      toast.loading('Requesting AI review…', { id: 'review' })
      await waitForTransaction(txHash)
      setSuccess(txHash)
      toast.success('Review requested! Validators are evaluating.', { id: 'review' })
      const [c, v] = await Promise.all([getCaseFullDetail(id), getCaseVerdict(id)])
      setCaseData(c)
      setVerdict(v)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      setTxError(msg)
      toast.error(msg, { id: 'review' })
    } finally {
      setRequesting(false)
    }
  }

  const fieldClass = "w-full px-3 py-2 text-sm bg-[#6E3482]/20 border border-[#6E3482]/40 rounded-md text-[#F5EBFA] placeholder-[#E7DBEF]/30 focus:outline-none focus:border-[#A56ABD]/50 [&_option]:text-black [&_option]:bg-white"
  const labelClass = "block text-xs text-[#E7DBEF]/60 mb-1.5 font-medium"

  if (loading) return <LoadingSpinner label="Loading research case…" />
  if (!caseData) return <div className="text-red-400 text-center py-16">Case not found</div>

  const isOwner = address?.toLowerCase() === caseData.owner?.toLowerCase()
  const canEdit = isOwner && caseData.status === 'open'
  const canReview = (isOwner) && caseData.status === 'open' && evidence.length > 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Case Header */}
      <div className="terminal-card-elevated p-6 glow-border">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-2">
            <FlaskConical className="h-5 w-5 text-[#A56ABD] shrink-0 mt-0.5" />
            <h1 className="text-[#F5EBFA] font-semibold text-xl">{caseData.title}</h1>
          </div>
          <StatusBadge status={caseData.status} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#E7DBEF]/40 mb-0.5">Domain</p>
              <p className="text-[#E7DBEF]/80 text-sm">{caseData.domain}</p>
            </div>
            <div>
              <p className="text-xs text-[#E7DBEF]/40 mb-0.5">Authors</p>
              <p className="text-[#E7DBEF]/80 text-sm">{caseData.authors}</p>
            </div>
            <div>
              <p className="text-xs text-[#E7DBEF]/40 mb-0.5">Research Question</p>
              <p className="text-[#E7DBEF]/80 text-sm">{caseData.research_question}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#E7DBEF]/40 mb-0.5">Main Claim</p>
              <p className="text-[#E7DBEF]/80 text-sm">{caseData.main_claim}</p>
            </div>
            <div>
              <p className="text-xs text-[#E7DBEF]/40 mb-0.5">Hypothesis</p>
              <p className="text-[#E7DBEF]/80 text-sm">{caseData.hypothesis}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-[#E7DBEF]/40 mb-0.5">Summary</p>
          <p className="text-[#E7DBEF]/70 text-sm leading-relaxed">{caseData.summary}</p>
        </div>

        {caseData.methodology_notes && (
          <div className="mb-4">
            <p className="text-xs text-[#E7DBEF]/40 mb-0.5">Methodology Notes</p>
            <p className="text-[#E7DBEF]/60 text-sm leading-relaxed">{caseData.methodology_notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#E7DBEF]/40 border-t border-[#6E3482]/30 pt-4">
          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {shortAddress(caseData.owner)}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {caseData.created_at}</span>
          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {caseData.evidence_count ?? 0} evidence items</span>
          <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> {caseData.replication_count ?? 0} replications</span>
        </div>
      </div>

      {/* Actions */}
      {isConnected && (
        <div className="flex gap-3 flex-wrap">
          {canEdit && (
            <button
              onClick={() => setShowEvidenceForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#6E3482]/40 hover:bg-[#6E3482]/70 text-[#E7DBEF] text-sm border border-[#A56ABD]/30 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {showEvidenceForm ? 'Cancel' : 'Add Evidence'}
              {showEvidenceForm ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}

          {canReview && (
            <button
              onClick={handleRequestReview}
              disabled={requesting}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#6E3482] hover:bg-[#6E3482]/80 disabled:opacity-50 text-[#F5EBFA] text-sm border border-[#A56ABD]/40 transition-colors"
            >
              {requesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Request AI Review
            </button>
          )}
        </div>
      )}

      {/* Evidence Form */}
      {showEvidenceForm && (
        <form onSubmit={handleSubmitEvidence} className="terminal-card p-5 space-y-4 animate-fade-in-up">
          <h3 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider">Submit Evidence</h3>
          {evidenceErrors.length > 0 && (
            <div className="space-y-1">
              {evidenceErrors.map((err, i) => <p key={i} className="text-red-400 text-xs">• {err}</p>)}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Evidence Title *</label>
              <input
                type="text"
                value={evidenceForm.title}
                onChange={e => setEvidenceForm(p => ({ ...p, title: e.target.value }))}
                className={fieldClass}
                placeholder="Title of the evidence source"
              />
            </div>
            <div>
              <label className={labelClass}>Evidence Type *</label>
              <select
                value={evidenceForm.evidenceType}
                onChange={e => setEvidenceForm(p => ({ ...p, evidenceType: e.target.value }))}
                className={fieldClass}
              >
                <option value="">Select type…</option>
                {EVIDENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Public URL *</label>
              <input
                type="url"
                value={evidenceForm.url}
                onChange={e => setEvidenceForm(p => ({ ...p, url: e.target.value }))}
                className={fieldClass}
                placeholder="https://arxiv.org/abs/…"
              />
            </div>
            <div>
              <label className={labelClass}>Source Name *</label>
              <input
                type="text"
                value={evidenceForm.sourceName}
                onChange={e => setEvidenceForm(p => ({ ...p, sourceName: e.target.value }))}
                className={fieldClass}
                placeholder="e.g. arXiv, PubMed, GitHub"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Relevance Note *</label>
            <textarea
              value={evidenceForm.relevanceNote}
              onChange={e => setEvidenceForm(p => ({ ...p, relevanceNote: e.target.value }))}
              rows={2}
              className={fieldClass}
              placeholder="Explain why this evidence is relevant to the research case"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#6E3482] hover:bg-[#6E3482]/80 disabled:opacity-50 text-[#F5EBFA] text-sm border border-[#A56ABD]/40 transition-colors"
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              : 'Submit Evidence'
            }
          </button>
        </form>
      )}

      {/* Evidence List */}
      <section>
        <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider mb-4">
          Evidence Registry ({evidence.length})
        </h2>
        {evidence.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No evidence submitted yet"
            description="Add public research evidence to strengthen the credibility assessment."
          />
        ) : (
          <div className="space-y-3">
            {evidence.map(ev => <EvidenceCard key={ev.evidence_id} evidence={ev} />)}
          </div>
        )}
      </section>

      {/* Verdict */}
      {verdict && (
        <section>
          <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider mb-4">
            AI Consensus Assessment
          </h2>
          <VerdictPanel verdict={verdict} />
        </section>
      )}

      {caseData.status === 'under_review' && !verdict && (
        <div className="terminal-card border-[#A56ABD]/30 bg-[#A56ABD]/5 p-5 text-center">
          <Zap className="h-8 w-8 text-[#A56ABD] mx-auto mb-3 animate-pulse" />
          <p className="text-[#E7DBEF]/80 font-medium text-sm">GenLayer validators are evaluating this research…</p>
          <p className="text-[#E7DBEF]/50 text-xs mt-1">Consensus formation in progress. Check back soon.</p>
        </div>
      )}
    </div>
  )
}
