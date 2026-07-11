'use client'

import { Fragment, useEffect, useState, useCallback } from 'react'
import { useWalletStore } from '@/store/wallet'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import {
  getOwner, getIsPaused, getPlatformRole, getAllDomains, getContractSummary,
  grantPlatformRole, revokePlatformRole, registerDomain, pauseContract, unpauseContract,
  transferOwnership, resolveDispute, waitForTransaction,
} from '@/lib/genlayer/contract'
import { toast } from 'sonner'
import { ShieldCheck, ShieldAlert, Loader2, Ban, PlayCircle, UserCog, FolderPlus, Gavel, Skull } from 'lucide-react'

const fieldClass = "w-full px-3 py-2 text-sm bg-[#6E3482]/20 border border-[#6E3482]/40 rounded-md text-[#F5EBFA] placeholder-[#E7DBEF]/30 focus:outline-none focus:border-[#A56ABD]/50 focus:ring-1 focus:ring-[#A56ABD]/30 transition-colors [&_option]:text-black [&_option]:bg-white"
const labelClass = "block text-xs text-[#E7DBEF]/60 mb-1.5 font-medium"
const btnClass = "flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#6E3482] hover:bg-[#6E3482]/80 disabled:opacity-50 disabled:cursor-not-allowed text-[#F5EBFA] font-medium text-sm border border-[#A56ABD]/40 transition-colors"
const dangerBtnClass = "flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-900/50 hover:bg-red-900/70 disabled:opacity-50 disabled:cursor-not-allowed text-red-100 font-medium text-sm border border-red-500/40 transition-colors"

async function runTx(label: string, fn: () => Promise<string>, onDone?: () => void) {
  toast.loading(`${label}…`, { id: label })
  try {
    const hash = await fn()
    toast.loading('Awaiting GenLayer consensus…', { id: label })
    await waitForTransaction(hash)
    toast.success(`${label} — done`, { id: label })
    onDone?.()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Transaction failed'
    toast.error(msg, { id: label })
  }
}

export default function AdminPage() {
  const { address, isConnected } = useWalletStore()
  const [owner, setOwner] = useState<string>('')
  const [paused, setPaused] = useState(false)
  const [myRole, setMyRole] = useState('')
  const [domains, setDomains] = useState<Array<Record<string, unknown>>>([])
  const [summary, setSummary] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [o, p, d, s] = await Promise.all([getOwner(), getIsPaused(), getAllDomains(), getContractSummary()])
    setOwner(o)
    setPaused(p)
    setDomains(d)
    setSummary(s)
    if (address) setMyRole(await getPlatformRole(address))
    setLoading(false)
  }, [address])

  useEffect(() => { load() }, [load])

  const isOwner = isConnected && !!address && !!owner && address.toLowerCase() === owner.toLowerCase()
  const isReviewer = ['REVIEWER', 'EXPERT', 'ADMIN'].includes(myRole)

  // ── Form state ──
  const [roleWallet, setRoleWallet] = useState('')
  const [roleValue, setRoleValue] = useState<'REVIEWER' | 'EXPERT' | 'ADMIN' | 'MODERATOR'>('REVIEWER')
  const [domainId, setDomainId] = useState('')
  const [domainName, setDomainName] = useState('')
  const [domainDesc, setDomainDesc] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [confirmTransfer, setConfirmTransfer] = useState('')
  const [disputeCaseId, setDisputeCaseId] = useState('')
  const [disputeResolution, setDisputeResolution] = useState<'UPHELD' | 'OVERTURNED' | 'REFERRED'>('UPHELD')
  const [disputeNotes, setDisputeNotes] = useState('')

  const [busy, setBusy] = useState(false)
  async function withBusy(fn: () => Promise<void>) {
    setBusy(true)
    try { await fn() } finally { setBusy(false) }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-bold text-3xl text-[#F5EBFA] tracking-wide">ADMIN</h1>
        <p className="text-[#E7DBEF]/50 text-sm mt-1">Owner and platform-reviewer controls for the Replicon contract</p>
      </div>

      {!isConnected && (
        <div className="terminal-card border-[#A56ABD]/30 p-5 flex items-center justify-between gap-4">
          <p className="text-[#E7DBEF]/70 text-sm">Connect your wallet to manage the contract</p>
          <ConnectButton />
        </div>
      )}

      {isConnected && loading && (
        <div className="terminal-card p-5 flex items-center gap-2 text-[#E7DBEF]/60 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading contract state…
        </div>
      )}

      {isConnected && !loading && !isOwner && !isReviewer && (
        <div className="terminal-card border-red-500/30 bg-red-500/5 p-5 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-red-400 shrink-0" />
          <div>
            <p className="text-red-300 text-sm font-medium">Access restricted</p>
            <p className="text-[#E7DBEF]/50 text-xs mt-0.5">
              Connected wallet is neither the contract owner (<span className="font-mono">{owner}</span>) nor a platform reviewer.
            </p>
          </div>
        </div>
      )}

      {isConnected && !loading && (isOwner || isReviewer) && (
        <>
          {/* Overview */}
          <div className="terminal-card p-5 space-y-3">
            <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              {isOwner ? <ShieldCheck className="h-4 w-4 text-green-400" /> : <ShieldCheck className="h-4 w-4 text-[#A56ABD]" />}
              Contract Overview
            </h2>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <p className="text-[#E7DBEF]/50">Owner</p>
              <p className="text-[#E7DBEF]/80 font-mono text-right break-all">{owner}</p>
              <p className="text-[#E7DBEF]/50">Your role</p>
              <p className="text-[#E7DBEF]/80 text-right">{isOwner ? 'OWNER' : (myRole || 'none')}</p>
              <p className="text-[#E7DBEF]/50">Status</p>
              <p className={`text-right font-medium ${paused ? 'text-red-400' : 'text-green-400'}`}>{paused ? 'PAUSED' : 'ACTIVE'}</p>
              {summary && Object.entries(summary).filter(([k]) => k.endsWith('_counter')).map(([k, v]) => (
                <Fragment key={k}>
                  <p className="text-[#E7DBEF]/50 capitalize">{k.replace(/_/g, ' ')}</p>
                  <p className="text-[#E7DBEF]/80 text-right">{v}</p>
                </Fragment>
              ))}
            </div>
          </div>

          {isOwner && (
            <>
              {/* Pause / Unpause */}
              <div className="terminal-card p-5 space-y-3">
                <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Ban className="h-4 w-4" /> Circuit Breaker
                </h2>
                <p className="text-[#E7DBEF]/50 text-xs">Pausing blocks all state-changing calls except owner actions.</p>
                <button
                  disabled={busy || !address}
                  onClick={() => withBusy(() => runTx(
                    paused ? 'Unpause contract' : 'Pause contract',
                    () => paused ? unpauseContract(address as `0x${string}`) : pauseContract(address as `0x${string}`),
                    load,
                  ))}
                  className={paused ? btnClass : dangerBtnClass}
                >
                  {paused ? <PlayCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  {paused ? 'Unpause Contract' : 'Pause Contract'}
                </button>
              </div>

              {/* Platform roles */}
              <div className="terminal-card p-5 space-y-3">
                <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  <UserCog className="h-4 w-4" /> Platform Roles
                </h2>
                <div>
                  <label className={labelClass}>Wallet Address</label>
                  <input value={roleWallet} onChange={e => setRoleWallet(e.target.value)} className={fieldClass} placeholder="0x…" />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <select value={roleValue} onChange={e => setRoleValue(e.target.value as typeof roleValue)} className={fieldClass}>
                    <option value="REVIEWER">REVIEWER</option>
                    <option value="EXPERT">EXPERT</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MODERATOR">MODERATOR</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={busy || !address || !roleWallet}
                    onClick={() => withBusy(() => runTx('Grant platform role', () => grantPlatformRole(address as `0x${string}`, roleWallet, roleValue), load))}
                    className={btnClass + ' flex-1'}
                  >
                    Grant Role
                  </button>
                  <button
                    disabled={busy || !address || !roleWallet}
                    onClick={() => withBusy(() => runTx('Revoke platform role', () => revokePlatformRole(address as `0x${string}`, roleWallet), load))}
                    className={dangerBtnClass + ' flex-1'}
                  >
                    Revoke Role
                  </button>
                </div>
              </div>

              {/* Domains */}
              <div className="terminal-card p-5 space-y-3">
                <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  <FolderPlus className="h-4 w-4" /> Research Domains
                </h2>
                {domains.length > 0 && (
                  <div className="text-xs text-[#E7DBEF]/60 space-y-1">
                    {domains.map((d) => (
                      <p key={String(d.domain_id)}>• {String(d.display_name)} <span className="text-[#E7DBEF]/30">({String(d.domain_id)})</span></p>
                    ))}
                  </div>
                )}
                <div>
                  <label className={labelClass}>Domain ID (slug)</label>
                  <input value={domainId} onChange={e => setDomainId(e.target.value)} className={fieldClass} placeholder="e.g. quantum_computing" />
                </div>
                <div>
                  <label className={labelClass}>Display Name</label>
                  <input value={domainName} onChange={e => setDomainName(e.target.value)} className={fieldClass} placeholder="Quantum Computing" />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea value={domainDesc} onChange={e => setDomainDesc(e.target.value)} rows={2} className={fieldClass} />
                </div>
                <button
                  disabled={busy || !address || !domainId || !domainName}
                  onClick={() => withBusy(() => runTx('Register domain', () => registerDomain(address as `0x${string}`, { domainId, displayName: domainName, description: domainDesc }), () => { load(); setDomainId(''); setDomainName(''); setDomainDesc('') }))}
                  className={btnClass}
                >
                  Register Domain
                </button>
              </div>

              {/* Transfer ownership — danger zone */}
              <div className="terminal-card border-red-500/30 p-5 space-y-3">
                <h2 className="text-red-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Skull className="h-4 w-4" /> Danger Zone — Transfer Ownership
                </h2>
                <p className="text-[#E7DBEF]/50 text-xs">This is irreversible. You will permanently lose owner access.</p>
                <div>
                  <label className={labelClass}>New Owner Address</label>
                  <input value={newOwner} onChange={e => setNewOwner(e.target.value)} className={fieldClass} placeholder="0x…" />
                </div>
                <div>
                  <label className={labelClass}>Type &quot;TRANSFER&quot; to confirm</label>
                  <input value={confirmTransfer} onChange={e => setConfirmTransfer(e.target.value)} className={fieldClass} />
                </div>
                <button
                  disabled={busy || !address || !newOwner || confirmTransfer !== 'TRANSFER'}
                  onClick={() => withBusy(() => runTx('Transfer ownership', () => transferOwnership(address as `0x${string}`, newOwner), () => { load(); setNewOwner(''); setConfirmTransfer('') }))}
                  className={dangerBtnClass}
                >
                  Transfer Ownership
                </button>
              </div>
            </>
          )}

          {isReviewer && (
            <div className="terminal-card p-5 space-y-3">
              <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <Gavel className="h-4 w-4" /> Resolve Dispute
              </h2>
              <div>
                <label className={labelClass}>Case ID</label>
                <input value={disputeCaseId} onChange={e => setDisputeCaseId(e.target.value)} className={fieldClass} placeholder="CASE-1" />
              </div>
              <div>
                <label className={labelClass}>Resolution</label>
                <select value={disputeResolution} onChange={e => setDisputeResolution(e.target.value as typeof disputeResolution)} className={fieldClass}>
                  <option value="UPHELD">UPHELD</option>
                  <option value="OVERTURNED">OVERTURNED</option>
                  <option value="REFERRED">REFERRED</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Resolution Notes</label>
                <textarea value={disputeNotes} onChange={e => setDisputeNotes(e.target.value)} rows={2} className={fieldClass} />
              </div>
              <button
                disabled={busy || !address || !disputeCaseId}
                onClick={() => withBusy(() => runTx('Resolve dispute', () => resolveDispute(address as `0x${string}`, disputeCaseId, disputeResolution, disputeNotes), () => { setDisputeCaseId(''); setDisputeNotes('') }))}
                className={btnClass}
              >
                Resolve Dispute
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
