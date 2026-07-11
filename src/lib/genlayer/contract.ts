import { getGenLayerClient } from './client'
import { CONTRACT_ADDRESS } from '@/lib/constants'
import type { ResearchCase, Evidence, ConsensusVerdict, PlatformStats, LeaderboardEntry, AuditLog } from '@/types'

type TxHash = `0x${string}` & { length: 66 }

function addr(): `0x${string}` {
  if (!CONTRACT_ADDRESS) throw new Error('CONTRACT_ADDRESS not set')
  return CONTRACT_ADDRESS
}

function parseJson<T>(raw: unknown, fallback: T): T {
  if (!raw || raw === '') return fallback
  try {
    if (typeof raw === 'string') return JSON.parse(raw) as T
    return raw as T
  } catch {
    return fallback
  }
}

function splitIds(raw: unknown): string[] {
  if (!raw || raw === '') return []
  return String(raw).split('|').map(s => s.trim()).filter(Boolean)
}

// ─── Read (no signer needed) ───────────────────────────────────

function rc() { return getGenLayerClient() }

export async function getPlatformStats(): Promise<PlatformStats | null> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_platform_stats', args: [] })
  return parseJson<PlatformStats | null>(result as unknown as string, null)
}

export async function getContractSummary(): Promise<Record<string, string> | null> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_contract_summary', args: [] })
  return parseJson<Record<string, string> | null>(result as unknown as string, null)
}

export async function getRecentCases(limit = 20): Promise<ResearchCase[]> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_recent_cases', args: [limit] })
  return parseJson<ResearchCase[]>(result as unknown as string, [])
}

export async function getCasesByStatus(status: string): Promise<ResearchCase[]> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_cases_by_status', args: [status] })
  return parseJson<ResearchCase[]>(result as unknown as string, [])
}

export async function getResearchCase(caseId: string): Promise<ResearchCase | null> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_research_case', args: [caseId] })
  return parseJson<ResearchCase | null>(result as unknown as string, null)
}

export async function getCaseWithVerdict(caseId: string): Promise<ResearchCase | null> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_case_with_verdict', args: [caseId] })
  return parseJson<ResearchCase | null>(result as unknown as string, null)
}

export async function getCaseFullDetail(caseId: string): Promise<ResearchCase | null> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_case_full_detail', args: [caseId] })
  return parseJson<ResearchCase | null>(result as unknown as string, null)
}

export async function getCaseSummary(caseId: string): Promise<ResearchCase | null> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_case_summary', args: [caseId] })
  return parseJson<ResearchCase | null>(result as unknown as string, null)
}

export async function getOwnerCaseIds(wallet: string): Promise<string[]> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_owner_case_index', args: [wallet] })
  return splitIds(result as unknown as string)
}

export async function getCasesByOwner(wallet: string): Promise<ResearchCase[]> {
  const ids = await getOwnerCaseIds(wallet)
  if (ids.length === 0) return []
  const cases = await Promise.all(ids.map(id => getCaseSummary(id)))
  return cases.filter(Boolean) as ResearchCase[]
}

export async function getCredibilityLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_credibility_leaderboard', args: [limit] })
  return parseJson<LeaderboardEntry[]>(result as unknown as string, [])
}

export async function getCaseEvidence(caseId: string): Promise<Evidence[]> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_case_full_evidence', args: [caseId] })
  return parseJson<Evidence[]>(result as unknown as string, [])
}

export async function getEvidence(evidenceId: string): Promise<Evidence | null> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_evidence', args: [evidenceId] })
  return parseJson<Evidence | null>(result as unknown as string, null)
}

export async function getCaseVerdict(caseId: string): Promise<ConsensusVerdict | null> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_case_verdict', args: [caseId] })
  return parseJson<ConsensusVerdict | null>(result as unknown as string, null)
}

export async function getCaseAuditLogs(caseId: string): Promise<AuditLog[]> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_case_audit_logs', args: [caseId] })
  return parseJson<AuditLog[]>(result as unknown as string, [])
}

// ─── Admin reads ────────────────────────────────────────────

export async function getOwner(): Promise<string> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_owner', args: [] })
  return String(result ?? '')
}

export async function getIsPaused(): Promise<boolean> {
  const result = await rc().readContract({ address: addr(), functionName: 'is_paused', args: [] })
  return Boolean(result)
}

export async function getPlatformRole(wallet: string): Promise<string> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_platform_role', args: [wallet] })
  return String(result ?? '')
}

export async function getAllDomains(): Promise<Array<Record<string, unknown>>> {
  const result = await rc().readContract({ address: addr(), functionName: 'get_all_domains', args: [] })
  return parseJson<Array<Record<string, unknown>>>(result as unknown as string, [])
}

// ─── Write (signer passed into client) ────────────────────────

function wc(signer: `0x${string}`) { return getGenLayerClient(signer) }

export async function createResearchCase(
  senderAddress: `0x${string}`,
  params: {
    title: string
    domain: string
    authors: string
    researchQuestion: string
    summary: string
    mainClaim: string
    hypothesis: string
    evidenceSummary: string
    methodologyNotes?: string
  }
): Promise<string> {
  const now = new Date().toISOString()
  const txHash = await wc(senderAddress).writeContract({
    address: addr(),
    functionName: 'create_research_case',
    args: [
      '',
      params.title,
      params.domain,
      params.authors,
      params.researchQuestion,
      params.summary,
      params.mainClaim,
      params.hypothesis,
      params.evidenceSummary,
      params.methodologyNotes ?? '',
      now,
    ],
    value: BigInt(0),
  })
  return txHash as string
}

export async function submitEvidence(
  senderAddress: `0x${string}`,
  params: {
    caseId: string
    title: string
    evidenceType: string
    url: string
    hash: string
    sourceName: string
    relevanceNote: string
    publicationYear?: string
    authorList?: string
  }
): Promise<string> {
  const now = new Date().toISOString()
  const txHash = await wc(senderAddress).writeContract({
    address: addr(),
    functionName: 'submit_evidence',
    args: [
      '',
      params.caseId,
      params.title,
      params.evidenceType,
      params.url,
      params.hash,
      params.sourceName,
      params.relevanceNote,
      params.publicationYear ?? '',
      params.authorList ?? '',
      now,
    ],
    value: BigInt(0),
  })
  return txHash as string
}

export async function requestReview(
  senderAddress: `0x${string}`,
  caseId: string
): Promise<string> {
  const now = new Date().toISOString()
  const txHash = await wc(senderAddress).writeContract({
    address: addr(),
    functionName: 'request_and_adjudicate',
    args: [caseId, now, now],
    value: BigInt(0),
  })
  return txHash as string
}

export async function upvoteCase(senderAddress: `0x${string}`, caseId: string): Promise<string> {
  const now = new Date().toISOString()
  const txHash = await wc(senderAddress).writeContract({
    address: addr(),
    functionName: 'upvote_case',
    args: [caseId, now],
    value: BigInt(0),
  })
  return txHash as string
}

export async function followCase(senderAddress: `0x${string}`, caseId: string): Promise<string> {
  const now = new Date().toISOString()
  const txHash = await wc(senderAddress).writeContract({
    address: addr(),
    functionName: 'follow_case',
    args: [caseId, now],
    value: BigInt(0),
  })
  return txHash as string
}

export async function waitForTransaction(txHash: string): Promise<void> {
  await rc().waitForTransactionReceipt({ hash: txHash as TxHash })
}

// ─── Admin writes (owner-only unless noted) ────────────────────

export async function grantPlatformRole(
  senderAddress: `0x${string}`,
  wallet: string,
  role: 'REVIEWER' | 'EXPERT' | 'ADMIN' | 'MODERATOR'
): Promise<string> {
  const txHash = await wc(senderAddress).writeContract({
    address: addr(),
    functionName: 'grant_platform_role',
    args: [wallet, role, new Date().toISOString()],
    value: BigInt(0),
  })
  return txHash as string
}

export async function revokePlatformRole(senderAddress: `0x${string}`, wallet: string): Promise<string> {
  const txHash = await wc(senderAddress).writeContract({
    address: addr(),
    functionName: 'revoke_platform_role',
    args: [wallet, new Date().toISOString()],
    value: BigInt(0),
  })
  return txHash as string
}

export async function registerDomain(
  senderAddress: `0x${string}`,
  params: { domainId: string; displayName: string; description: string; parentDomain?: string }
): Promise<string> {
  const txHash = await wc(senderAddress).writeContract({
    address: addr(),
    functionName: 'register_domain',
    args: [params.domainId, params.displayName, params.description, params.parentDomain ?? '', new Date().toISOString()],
    value: BigInt(0),
  })
  return txHash as string
}

export async function pauseContract(senderAddress: `0x${string}`): Promise<string> {
  const txHash = await wc(senderAddress).writeContract({
    address: addr(), functionName: 'pause', args: [], value: BigInt(0),
  })
  return txHash as string
}

export async function unpauseContract(senderAddress: `0x${string}`): Promise<string> {
  const txHash = await wc(senderAddress).writeContract({
    address: addr(), functionName: 'unpause', args: [], value: BigInt(0),
  })
  return txHash as string
}

export async function transferOwnership(senderAddress: `0x${string}`, newOwner: string): Promise<string> {
  const txHash = await wc(senderAddress).writeContract({
    address: addr(),
    functionName: 'transfer_ownership',
    args: [newOwner, new Date().toISOString()],
    value: BigInt(0),
  })
  return txHash as string
}

// ─── Platform reviewer writes ───────────────────────────────

export async function resolveDispute(
  senderAddress: `0x${string}`,
  caseId: string,
  resolution: 'UPHELD' | 'OVERTURNED' | 'REFERRED',
  notes: string
): Promise<string> {
  const txHash = await wc(senderAddress).writeContract({
    address: addr(),
    functionName: 'resolve_dispute',
    args: [caseId, resolution, notes, new Date().toISOString()],
    value: BigInt(0),
  })
  return txHash as string
}
