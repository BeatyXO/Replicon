export const APP_NAME = 'Replicon'
export const APP_TAGLINE = 'Decentralized Research Interpretation and Replication Consensus'

export const GENLAYER_RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? 'https://studio.genlayer.com/api'
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '') as `0x${string}`
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://studio.genlayer.com'

export const RESEARCH_DOMAINS = [
  'Biology',
  'Chemistry',
  'Physics',
  'Medicine',
  'Computer Science',
  'Psychology',
  'Neuroscience',
  'Economics',
  'Environmental Science',
  'Materials Science',
  'Genomics',
  'Pharmacology',
  'Epidemiology',
  'Engineering',
  'Mathematics',
  'Other',
] as const

export const EVIDENCE_TYPES = [
  'Research Paper',
  'Dataset',
  'Benchmark Report',
  'Experimental Repository',
  'Clinical Study',
  'Public Code Repository',
  'Technical Whitepaper',
  'Conference Paper',
  'Government Report',
  'Journal Article',
  'Other',
] as const

export const VERDICT_LABELS: Record<string, string> = {
  highly_credible: 'Highly Credible',
  credible: 'Credible',
  partially_credible: 'Partially Credible',
  insufficient_evidence: 'Insufficient Evidence',
  not_credible: 'Not Credible',
  pending: 'Pending Review',
}
