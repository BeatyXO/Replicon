export interface CreateCaseSchema {
  title: string
  domain: string
  authors: string
  researchQuestion: string
  summary: string
  mainClaim: string
  hypothesis: string
  evidenceSummary: string
}

export interface SubmitEvidenceSchema {
  title: string
  evidenceType: string
  url: string
  sourceName: string
  relevanceNote: string
}

export function validateUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateCreateCase(data: Partial<CreateCaseSchema>): string[] {
  const errors: string[] = []
  if (!data.title?.trim()) errors.push('Title is required')
  if (!data.domain?.trim()) errors.push('Domain is required')
  if (!data.authors?.trim()) errors.push('Authors are required')
  if (!data.researchQuestion?.trim()) errors.push('Research question is required')
  if (!data.summary?.trim()) errors.push('Summary is required')
  if (!data.mainClaim?.trim()) errors.push('Main claim is required')
  if (!data.hypothesis?.trim()) errors.push('Hypothesis is required')
  if (!data.evidenceSummary?.trim()) errors.push('Evidence summary is required')
  return errors
}

export function validateEvidence(data: Partial<SubmitEvidenceSchema>): string[] {
  const errors: string[] = []
  if (!data.title?.trim()) errors.push('Title is required')
  if (!data.evidenceType?.trim()) errors.push('Evidence type is required')
  if (!data.url?.trim()) errors.push('URL is required')
  else if (!validateUrl(data.url)) errors.push('URL must be a valid public URL')
  if (!data.sourceName?.trim()) errors.push('Source name is required')
  if (!data.relevanceNote?.trim()) errors.push('Relevance note is required')
  return errors
}

export async function hashUrl(url: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(url)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
