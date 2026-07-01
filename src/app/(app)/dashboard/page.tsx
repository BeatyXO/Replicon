'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useWalletStore } from '@/store/wallet'
import {
  getRecentCases,
  getCasesByOwner,
  getPlatformStats,
  getCredibilityLeaderboard,
} from '@/lib/genlayer/contract'
import { ResearchCase, PlatformStats, LeaderboardEntry } from '@/types'
import { CaseCard } from '@/components/cases/CaseCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  FlaskConical,
  Plus,
  Activity,
  FileSearch,
  Trophy,
  Users,
  GitBranch,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  Microscope,
  ArrowRight,
} from 'lucide-react'
import { CONTRACT_ADDRESS, VERDICT_LABELS } from '@/lib/constants'
import { verdictColor, scoreColor } from '@/lib/utils'

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  sub?: string
}) {
  return (
    <div className="terminal-card p-4 flex items-center gap-4">
      <div className="p-2 rounded bg-[#6E3482]/50 shrink-0">
        <Icon className="h-5 w-5 text-[#A56ABD]" />
      </div>
      <div>
        <p className="text-2xl font-mono font-bold text-[#F5EBFA]">{value}</p>
        <p className="text-xs text-[#E7DBEF]/50">{label}</p>
        {sub && <p className="text-xs text-[#A56ABD]/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function VerdictBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-[#E7DBEF]/60 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[#E7DBEF]/50 w-8 text-right font-mono">{value}</span>
    </div>
  )
}

export default function DashboardPage() {
  const { address, isConnected } = useWalletStore()
  const [recentCases, setRecentCases] = useState<ResearchCase[]>([])
  const [myCases, setMyCases] = useState<ResearchCase[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!CONTRACT_ADDRESS) { setLoading(false); return }
      try {
        setLoading(true)
        setError(null)
        const [cases, platformStats, board] = await Promise.all([
          getRecentCases(12),
          getPlatformStats(),
          getCredibilityLeaderboard(5),
        ])
        setRecentCases(cases)
        setStats(platformStats)
        setLeaderboard(board)
        if (address) {
          const mine = await getCasesByOwner(address)
          setMyCases(mine)
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [address])

  const totalVerdicts = stats
    ? Object.values(stats.verdict_breakdown).reduce((a, b) => a + b, 0)
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-[#F5EBFA] tracking-wide">DASHBOARD</h1>
          <p className="text-[#E7DBEF]/50 text-sm mt-1">Research credibility intelligence console</p>
        </div>
        <Link
          href="/cases/new"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#6E3482] hover:bg-[#6E3482]/80 text-[#F5EBFA] text-sm font-medium transition-colors border border-[#A56ABD]/40"
        >
          <Plus className="h-4 w-4" />
          New Case
        </Link>
      </div>

      {!CONTRACT_ADDRESS && (
        <div className="terminal-card border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-yellow-400 text-sm">
            Contract address not configured. Set{' '}
            <code className="font-mono text-xs bg-[#6E3482]/50 px-1 py-0.5 rounded">
              NEXT_PUBLIC_CONTRACT_ADDRESS
            </code>{' '}
            in <code className="font-mono text-xs">.env.local</code>.
          </p>
        </div>
      )}

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Cases"
          value={stats?.total_cases ?? recentCases.length}
          icon={FlaskConical}
        />
        <StatCard
          label="Under Review"
          value={stats?.open_cases ?? 0}
          icon={Activity}
          sub="awaiting verdict"
        />
        <StatCard
          label="Verdicts Issued"
          value={stats?.total_verdicts ?? 0}
          icon={ShieldCheck}
        />
        <StatCard
          label="Evidence Items"
          value={stats?.total_evidence ?? 0}
          icon={BookOpen}
        />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Researchers"
          value={stats?.total_researchers ?? '—'}
          icon={Users}
        />
        <StatCard
          label="Replication Attempts"
          value={stats?.total_replications ?? '—'}
          icon={GitBranch}
        />
        <StatCard
          label="Expert Reviews"
          value={stats?.total_expert_reviews ?? '—'}
          icon={Microscope}
        />
        <StatCard
          label="Citations"
          value={stats?.total_citations ?? '—'}
          icon={TrendingUp}
        />
      </div>

      {/* Verdict breakdown + Leaderboard */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Verdict distribution */}
        <div className="terminal-card-elevated p-6 space-y-4">
          <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#A56ABD]" />
            Verdict Distribution
          </h2>
          {stats ? (
            <div className="space-y-3">
              <VerdictBar
                label="Highly Credible"
                value={stats.verdict_breakdown.highly_credible}
                total={totalVerdicts}
                color="bg-emerald-400"
              />
              <VerdictBar
                label="Credible"
                value={stats.verdict_breakdown.credible}
                total={totalVerdicts}
                color="bg-green-400"
              />
              <VerdictBar
                label="Partially Credible"
                value={stats.verdict_breakdown.partially_credible}
                total={totalVerdicts}
                color="bg-yellow-400"
              />
              <VerdictBar
                label="Insufficient Evidence"
                value={stats.verdict_breakdown.insufficient_evidence}
                total={totalVerdicts}
                color="bg-orange-400"
              />
              <VerdictBar
                label="Not Credible"
                value={stats.verdict_breakdown.not_credible}
                total={totalVerdicts}
                color="bg-red-400"
              />
              <p className="text-[#E7DBEF]/30 text-xs pt-1">
                {totalVerdicts} total verdicts issued by GenLayer consensus
              </p>
            </div>
          ) : (
            <p className="text-[#E7DBEF]/40 text-sm">No verdicts yet</p>
          )}
        </div>

        {/* Credibility leaderboard */}
        <div className="terminal-card-elevated p-6 space-y-4">
          <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#A56ABD]" />
            Top Credibility Scores
          </h2>
          {leaderboard.length === 0 ? (
            <p className="text-[#E7DBEF]/40 text-sm">No reviewed cases yet</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, i) => (
                <Link
                  key={entry.case_id}
                  href={`/cases/${entry.case_id}`}
                  className="flex items-center gap-3 group"
                >
                  <span className="font-mono text-xs text-[#A56ABD]/60 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F5EBFA] truncate group-hover:text-[#A56ABD] transition-colors">
                      {entry.title}
                    </p>
                    <p className="text-xs text-[#E7DBEF]/40">{entry.domain}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-mono font-bold ${scoreColor(entry.replication_score)}`}>
                      {entry.replication_score}%
                    </p>
                    <p className={`text-xs ${verdictColor(entry.credibility_verdict)}`}>
                      {VERDICT_LABELS[entry.credibility_verdict] ?? entry.credibility_verdict}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/cases"
            className="flex items-center gap-1 text-xs text-[#A56ABD]/70 hover:text-[#A56ABD] transition-colors"
          >
            View all cases <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* My cases */}
      {isConnected && (
        <section>
          <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider mb-4">
            My Research Cases
          </h2>
          {loading ? (
            <LoadingSpinner label="Loading your cases…" />
          ) : myCases.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="No cases yet"
              description="Create your first research case to begin the credibility assessment process."
              action={
                <Link
                  href="/cases/new"
                  className="px-4 py-2 rounded-md bg-[#6E3482] text-[#F5EBFA] text-sm border border-[#A56ABD]/40 hover:bg-[#6E3482]/80 transition-colors"
                >
                  Create Case
                </Link>
              }
            />
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {myCases.map(c => <CaseCard key={c.case_id} case_={c} />)}
            </div>
          )}
        </section>
      )}

      {/* All recent cases */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider">
            Recent Research Cases
          </h2>
          <Link
            href="/cases"
            className="flex items-center gap-1 text-xs text-[#A56ABD]/70 hover:text-[#A56ABD] transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner label="Loading research cases…" />
        ) : error ? (
          <div className="terminal-card border-red-500/30 p-4 text-red-400 text-sm">{error}</div>
        ) : recentCases.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No research cases found"
            description="Be the first to submit a research case for credibility assessment."
          />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recentCases.map(c => <CaseCard key={c.case_id} case_={c} />)}
          </div>
        )}
      </section>
    </div>
  )
}
