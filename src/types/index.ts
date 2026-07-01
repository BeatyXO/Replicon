export interface ResearchCase {
  case_id: string
  title: string
  domain: string
  authors: string
  research_question: string
  summary: string
  main_claim: string
  hypothesis: string
  evidence_summary: string
  methodology_notes: string
  owner: string
  status: 'open' | 'under_review' | 'reviewed' | 'reviewed_needs_expert' | 'expert_reviewed' | 'disputed' | 'dispute_resolved' | 'archived'
  evidence_count: number
  review_count: number
  replication_count?: number
  successful_replications?: number
  failed_replications?: number
  created_at: string
  updated_at?: string
  last_verdict_id?: string
  expert_verdict?: string
  verdict?: ConsensusVerdict
  expert_review?: ExpertReview
  active_evidence?: Evidence[]
  citations?: Citation[]
  replications?: ReplicationAttempt[]
  upvote_count?: number
  watcher_count?: number
}

export interface Evidence {
  evidence_id: string
  case_id: string
  title: string
  evidence_type: string
  url: string
  url_hash: string
  source_name: string
  relevance_note: string
  publication_year: string
  author_list: string
  submitted_by: string
  submitted_at: string
  status: 'ACTIVE' | 'FLAGGED'
  flag_reason?: string
}

export interface ConsensusVerdict {
  verdict_id: string
  review_id: string
  case_id: string
  credibility_verdict: 'highly_credible' | 'credible' | 'partially_credible' | 'insufficient_evidence' | 'not_credible'
  replication_score: number
  novelty_score: number
  confidence_score: number
  statistical_significance: string
  methodology_quality: string
  evidence_strength: string
  contradiction_level: string
  reasoning: string
  recommended_follow_up: string
  key_supporting_evidence: string[]
  key_concerns: string[]
  methodology_strengths: string[]
  methodology_weaknesses: string[]
  replication_barriers: string[]
  suggested_follow_up: string[]
  expert_review_required: boolean
  audit_summary: string
  adjudicated_by: string
  adjudicated_at: string
}

export interface ExpertReview {
  expert_review_id: string
  case_id: string
  reviewer: string
  final_credibility_verdict: string
  expert_replication_score: number
  expert_confidence: number
  review_notes: string
  override_reasoning: string
  evidence_hash: string
  decided_at: string
}

export interface ReplicationAttempt {
  replication_id: string
  case_id: string
  submitted_by: string
  outcome: 'REPLICATED' | 'PARTIALLY_REPLICATED' | 'FAILED_TO_REPLICATE' | 'INCONCLUSIVE'
  replication_summary: string
  methodology_deviation: string
  environment_notes: string
  data_hash: string
  submitted_at: string
  status: string
}

export interface Citation {
  citation_id: string
  citing_case_id: string
  cited_case_id: string
  citation_context: string
  relationship_type: 'SUPPORTS' | 'CONTRADICTS' | 'EXTENDS' | 'REPLICATES' | 'RELATED'
  added_by: string
  added_at: string
}

export interface AuditLog {
  audit_id: string
  case_id: string
  event_type: string
  actor: string
  summary: string
  data_ref: string
  created_at: string
}

export interface PlatformStats {
  total_cases: number
  open_cases: number
  reviewed_cases: number
  expert_reviewed_cases: number
  disputed_cases: number
  verdict_breakdown: {
    highly_credible: number
    credible: number
    partially_credible: number
    insufficient_evidence: number
    not_credible: number
  }
  total_evidence: number
  total_verdicts: number
  total_researchers: string
  total_replications: string
  total_citations: string
  total_expert_reviews: string
}

export interface LeaderboardEntry {
  case_id: string
  title: string
  domain: string
  credibility_verdict: string
  replication_score: number
  confidence_score: number
  upvotes: number
}

export interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

export interface TxState {
  hash: string | null
  status: 'idle' | 'pending' | 'success' | 'error'
  error: string | null
}
