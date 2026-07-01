'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletStore } from '@/store/wallet'
import { useTxStore } from '@/store/tx'
import { createResearchCase, waitForTransaction } from '@/lib/genlayer/contract'
import { validateCreateCase } from '@/lib/validation/schemas'
import { RESEARCH_DOMAINS } from '@/lib/constants'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { toast } from 'sonner'
import { FlaskConical, Loader2 } from 'lucide-react'

interface FormState {
  title: string
  domain: string
  authors: string
  researchQuestion: string
  summary: string
  mainClaim: string
  hypothesis: string
  evidenceSummary: string
}

const INITIAL: FormState = {
  title: '', domain: '', authors: '', researchQuestion: '',
  summary: '', mainClaim: '', hypothesis: '', evidenceSummary: '',
}

export default function NewCasePage() {
  const router = useRouter()
  const { address, isConnected } = useWalletStore()
  const { setPending, setSuccess, setError: setTxError, reset } = useTxStore()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateCreateCase(form)
    if (errs.length > 0) { setErrors(errs); return }
    if (!address) { toast.error('Please connect your wallet first'); return }

    setErrors([])
    setSubmitting(true)
    reset()
    setPending()

    try {
      const hash = await createResearchCase(address as `0x${string}`, form)
      setPending(hash)
      toast.loading('Awaiting GenLayer consensus…', { id: 'tx' })
      await waitForTransaction(hash)
      setSuccess(hash)
      toast.success('Research case created!', { id: 'tx' })
      router.push('/cases')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      setTxError(msg)
      toast.error(msg, { id: 'tx' })
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass = "w-full px-3 py-2 text-sm bg-[#6E3482]/20 border border-[#6E3482]/40 rounded-md text-[#F5EBFA] placeholder-[#E7DBEF]/30 focus:outline-none focus:border-[#A56ABD]/50 focus:ring-1 focus:ring-[#A56ABD]/30 transition-colors [&_option]:text-black [&_option]:bg-white"
  const labelClass = "block text-xs text-[#E7DBEF]/60 mb-1.5 font-medium"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-bold text-3xl text-[#F5EBFA] tracking-wide">CREATE RESEARCH CASE</h1>
        <p className="text-[#E7DBEF]/50 text-sm mt-1">Submit research findings for AI credibility assessment</p>
      </div>

      {!isConnected && (
        <div className="terminal-card border-[#A56ABD]/30 p-5 flex items-center justify-between gap-4">
          <p className="text-[#E7DBEF]/70 text-sm">Connect your wallet to submit a research case</p>
          <ConnectButton />
        </div>
      )}

      {errors.length > 0 && (
        <div className="terminal-card border-red-500/30 bg-red-500/5 p-4 space-y-1">
          {errors.map((err, i) => <p key={i} className="text-red-400 text-xs">• {err}</p>)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="terminal-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2 pb-4 border-b border-[#6E3482]/40">
          <FlaskConical className="h-5 w-5 text-[#A56ABD]" />
          <h2 className="text-[#E7DBEF]/80 text-sm font-semibold">Research Case Details</h2>
        </div>

        <div>
          <label className={labelClass}>Study Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={update('title')}
            className={fieldClass}
            placeholder="e.g. Effect of CRISPR-Cas9 on cellular senescence in vitro"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Research Domain *</label>
            <select value={form.domain} onChange={update('domain')} className={fieldClass}>
              <option value="">Select domain…</option>
              {RESEARCH_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Authors *</label>
            <input
              type="text"
              value={form.authors}
              onChange={update('authors')}
              className={fieldClass}
              placeholder="Smith J., Doe A., et al."
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Research Question *</label>
          <input
            type="text"
            value={form.researchQuestion}
            onChange={update('researchQuestion')}
            className={fieldClass}
            placeholder="What is the primary research question being investigated?"
          />
        </div>

        <div>
          <label className={labelClass}>Research Summary *</label>
          <textarea
            value={form.summary}
            onChange={update('summary')}
            rows={3}
            className={fieldClass}
            placeholder="Provide a concise summary of the study, methodology, and context."
          />
        </div>

        <div>
          <label className={labelClass}>Main Claim *</label>
          <textarea
            value={form.mainClaim}
            onChange={update('mainClaim')}
            rows={2}
            className={fieldClass}
            placeholder="State the primary claim or finding of this research."
          />
        </div>

        <div>
          <label className={labelClass}>Current Hypothesis *</label>
          <textarea
            value={form.hypothesis}
            onChange={update('hypothesis')}
            rows={2}
            className={fieldClass}
            placeholder="What hypothesis does the research test or propose?"
          />
        </div>

        <div>
          <label className={labelClass}>Evidence Summary *</label>
          <textarea
            value={form.evidenceSummary}
            onChange={update('evidenceSummary')}
            rows={3}
            className={fieldClass}
            placeholder="Summarize the evidence supporting the findings."
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !isConnected}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[#6E3482] hover:bg-[#6E3482]/80 disabled:opacity-50 disabled:cursor-not-allowed text-[#F5EBFA] font-medium text-sm border border-[#A56ABD]/40 transition-colors"
        >
          {submitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating Case…</>
            : 'Create Research Case'
          }
        </button>
      </form>
    </div>
  )
}
