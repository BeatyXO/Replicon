import { ConsensusVerdict } from '@/types'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { CheckCircle, AlertTriangle, GitBranch, Microscope } from 'lucide-react'

const QUALITY_SCORES: Record<string, number> = {
  'Very High': 95, 'High': 80, 'Medium-High': 70, 'Medium': 55,
  'Medium-Low': 40, 'Low': 25, 'Very Low': 10,
}

function qualityToScore(q: string): number {
  return QUALITY_SCORES[q] ?? 50
}

export function VerdictPanel({ verdict: v }: { verdict: ConsensusVerdict }) {
  return (
    <div className="space-y-6">
      {/* Verdict Header */}
      <div className="terminal-card-elevated p-6 glow-border">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-[#F5EBFA] font-semibold text-lg mb-1">Consensus Verdict</h3>
            <p className="text-xs text-[#E7DBEF]/50">Adjudicated {v.adjudicated_at}</p>
          </div>
          <VerdictBadge verdict={v.credibility_verdict} />
        </div>

        <p className="text-[#E7DBEF]/80 text-sm leading-relaxed mb-4">{v.reasoning}</p>

        {v.expert_review_required && (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Expert human review recommended for this case
          </div>
        )}
      </div>

      {/* Scores */}
      <div className="terminal-card p-5 space-y-4">
        <h4 className="text-[#E7DBEF]/70 text-xs font-semibold uppercase tracking-wider mb-3">Assessment Metrics</h4>
        <ScoreBar label="Replication Score" value={v.replication_score} />
        <ScoreBar label="Novelty Score" value={v.novelty_score} />
        <ScoreBar label="Confidence Score" value={v.confidence_score} />
        <ScoreBar label="Methodology Quality" value={qualityToScore(v.methodology_quality)} />
        <ScoreBar label="Evidence Strength" value={qualityToScore(v.evidence_strength)} />
      </div>

      {/* Qualitative */}
      <div className="grid grid-cols-2 gap-4">
        <div className="terminal-card p-4">
          <p className="text-xs text-[#E7DBEF]/50 mb-1">Statistical Significance</p>
          <p className="text-[#F5EBFA] font-medium text-sm">{v.statistical_significance}</p>
        </div>
        <div className="terminal-card p-4">
          <p className="text-xs text-[#E7DBEF]/50 mb-1">Contradiction Level</p>
          <p className="text-[#F5EBFA] font-medium text-sm">{v.contradiction_level}</p>
        </div>
      </div>

      {/* Follow-up */}
      {v.recommended_follow_up && (
        <div className="terminal-card p-4">
          <p className="text-xs text-[#E7DBEF]/50 mb-2">Recommended Follow-Up Research</p>
          <p className="text-[#E7DBEF]/80 text-sm">{v.recommended_follow_up}</p>
        </div>
      )}

      {/* Supporting Evidence & Concerns */}
      <div className="grid md:grid-cols-2 gap-4">
        {v.key_supporting_evidence?.length > 0 && (
          <div className="terminal-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <p className="text-xs font-semibold text-green-400/80 uppercase tracking-wider">Key Supporting Evidence</p>
            </div>
            <ul className="space-y-1">
              {v.key_supporting_evidence.map((item, i) => (
                <li key={i} className="text-xs text-[#E7DBEF]/70 flex gap-2">
                  <span className="text-green-400/40 mt-0.5">▸</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {v.key_concerns?.length > 0 && (
          <div className="terminal-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <p className="text-xs font-semibold text-yellow-400/80 uppercase tracking-wider">Key Concerns</p>
            </div>
            <ul className="space-y-1">
              {v.key_concerns.map((item, i) => (
                <li key={i} className="text-xs text-[#E7DBEF]/70 flex gap-2">
                  <span className="text-yellow-400/40 mt-0.5">▸</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Methodology */}
      {(v.methodology_strengths?.length > 0 || v.methodology_weaknesses?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {v.methodology_strengths?.length > 0 && (
            <div className="terminal-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Microscope className="h-4 w-4 text-[#A56ABD]" />
                <p className="text-xs font-semibold text-[#A56ABD]/80 uppercase tracking-wider">Methodology Strengths</p>
              </div>
              <ul className="space-y-1">
                {v.methodology_strengths.map((item, i) => (
                  <li key={i} className="text-xs text-[#E7DBEF]/70 flex gap-2">
                    <span className="text-[#A56ABD]/40 mt-0.5">▸</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {v.methodology_weaknesses?.length > 0 && (
            <div className="terminal-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-orange-400" />
                <p className="text-xs font-semibold text-orange-400/80 uppercase tracking-wider">Methodology Weaknesses</p>
              </div>
              <ul className="space-y-1">
                {v.methodology_weaknesses.map((item, i) => (
                  <li key={i} className="text-xs text-[#E7DBEF]/70 flex gap-2">
                    <span className="text-orange-400/40 mt-0.5">▸</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Replication Barriers */}
      {v.replication_barriers?.length > 0 && (
        <div className="terminal-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="h-4 w-4 text-red-400" />
            <p className="text-xs font-semibold text-red-400/80 uppercase tracking-wider">Replication Barriers</p>
          </div>
          <ul className="space-y-1">
            {v.replication_barriers.map((item, i) => (
              <li key={i} className="text-xs text-[#E7DBEF]/70 flex gap-2">
                <span className="text-red-400/40 mt-0.5">▸</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
