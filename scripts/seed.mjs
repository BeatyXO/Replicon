// One-off seed script: generates 3 local test accounts and fires ~30
// write transactions against the deployed Replicon contract on GenLayer
// StudioNet, exercising every public.write method that doesn't require
// the contract owner (platform-role grants, domain registration, pause,
// ownership transfer, and dispute resolution are owner/reviewer-gated
// and are intentionally skipped — run those with the deployer key).
//
// Usage: node scripts/seed.mjs

import { createAccount, createClient } from 'genlayer-js'
import { studionet } from 'genlayer-js/chains'
import fs from 'node:fs'

const RPC = 'https://studio.genlayer.com/api'
const CONTRACT = '0xb9Ff76e428997FeBfcC0BfE350e4FE69709C08a4'

const now = () => new Date().toISOString()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function client(account) {
  return createClient({ chain: studionet, endpoint: RPC, account })
}

const log = []
function record(label, ok, extra) {
  const line = `${ok ? 'OK  ' : 'FAIL'} ${label}${extra ? ' :: ' + extra : ''}`
  console.log(line)
  log.push(line)
}

async function write(c, label, functionName, args) {
  try {
    const hash = await c.writeContract({ address: CONTRACT, functionName, args, value: BigInt(0) })
    await c.waitForTransactionReceipt({ hash, status: 'FINALIZED', retries: 60, interval: 4000 })
    record(label, true, hash)
    return hash
  } catch (err) {
    record(label, false, err?.message ?? String(err))
    return null
  }
}

async function main() {
  // 1. Generate 3 fresh local test accounts.
  const accounts = [createAccount(), createAccount(), createAccount()]
  const [alice, bob, carol] = accounts
  const keys = accounts.map((a) => ({ address: a.address, privateKey: a.privateKey }))
  fs.writeFileSync('scripts/seed-keys.json', JSON.stringify(keys, null, 2))
  console.log('Generated 3 test accounts (saved to scripts/seed-keys.json):')
  keys.forEach((k, i) => console.log(`  [${i}] ${k.address}`))

  const cAlice = client(alice)
  const cBob = client(bob)
  const cCarol = client(carol)

  // 2. Researcher registration (3 tx)
  await write(cAlice, 'register_researcher(alice)', 'register_researcher',
    ['Dr. Alice Nguyen', 'Helix Institute', 'PhD Molecular Biology, 12 published papers', 'Molecular Biology, Genomics', 'https://orcid.org/0000-0001-alice', 'meta-alice-1', now()])
  await write(cBob, 'register_researcher(bob)', 'register_researcher',
    ['Dr. Bob Ferreira', 'Aurora Labs', 'PhD Statistics, replication science', 'Statistics, Meta-analysis', 'https://orcid.org/0000-0002-bob', 'meta-bob-1', now()])
  await write(cCarol, 'register_researcher(carol)', 'register_researcher',
    ['Dr. Carol Whitfield', 'Independent Researcher', 'MSc Computer Science, 8 years applied ML research', 'Machine Learning, NLP', 'https://orcid.org/0000-0003-carol', 'meta-carol-1', now()])

  await write(cAlice, 'update_researcher_profile(alice)', 'update_researcher_profile',
    ['Helix Institute (Senior Fellow)', 'PhD Molecular Biology, 12 published papers, 3 replications led', 'Molecular Biology, Genomics, CRISPR', 'https://orcid.org/0000-0001-alice', 'meta-alice-2', now()])

  // 3. Create research cases (4 tx)
  const caseIdA1 = `${now()}`.slice(0, 0) // placeholder unused
  const mkCase = async (c, label, title, domain, claim) => {
    const hash = await write(c, label, 'create_research_case', [
      '', title, domain, 'A. Nguyen, R. Costa', `Does ${claim.toLowerCase()}?`,
      `A study investigating whether ${claim.toLowerCase()}.`,
      claim, `We hypothesize that ${claim.toLowerCase()}.`,
      'Evidence includes a peer-reviewed dataset and an independent benchmark repository.',
      'Randomized controlled design, n=240, double-blind where applicable.', now(),
    ])
    return hash
  }

  await mkCase(cAlice, 'create_research_case(alice #1)', 'Gene Expression Response to Cold Stress in C. elegans', 'Molecular Biology', 'cold stress upregulates the hsp-16.2 gene cluster')
  await mkCase(cAlice, 'create_research_case(alice #2)', 'Meta-analysis of Intermittent Fasting on Metabolic Markers', 'Nutrition Science', 'intermittent fasting improves fasting insulin levels')
  await mkCase(cBob, 'create_research_case(bob #1)', 'Replication Crisis Indicators in Social Priming Literature', 'Psychology', 'social priming effects fail to replicate under pre-registration')
  await mkCase(cCarol, 'create_research_case(carol #1)', 'Benchmark Reproducibility of Transformer Pruning Methods', 'Machine Learning', 'structured pruning retains 95% of baseline accuracy at 40% sparsity')

  // We need the actual case_ids the contract assigned — fetch via owner index.
  const readClient = createClient({ chain: studionet, endpoint: RPC })
  const getOwnerCases = async (address) => {
    const raw = await readClient.readContract({ address: CONTRACT, functionName: 'get_owner_case_index', args: [address] })
    return String(raw || '').split('|').map((s) => s.trim()).filter(Boolean)
  }
  await sleep(2000)
  const aliceCases = await getOwnerCases(alice.address)
  const bobCases = await getOwnerCases(bob.address)
  const carolCases = await getOwnerCases(carol.address)
  console.log('alice cases:', aliceCases, 'bob cases:', bobCases, 'carol cases:', carolCases)

  const [caseA1, caseA2] = aliceCases
  const [caseB1] = bobCases
  const [caseC1] = carolCases

  // 4. Contributor + config + update (3 tx)
  await write(cAlice, 'add_case_contributor(alice adds bob to A1)', 'add_case_contributor', [caseA1, bob.address, 'REVIEWER', now()])
  await write(cAlice, 'set_case_review_config(A1)', 'set_case_review_config', [caseA1, 60, 80, 65, 30, now()])
  await write(cAlice, 'update_research_case(A2)', 'update_research_case', [
    caseA2, 'Updated meta-analysis summary incorporating two additional cohort studies.',
    'intermittent fasting improves fasting insulin levels', 'Fasting improves insulin sensitivity across diverse cohorts.',
    'Now includes 5 RCTs and 2 cohort studies totalling n=1,840.', 'Fixed-effects meta-analysis, I^2 heterogeneity reported.', now(),
  ])

  // 5. Evidence submissions (8 tx) — use real, stable URLs so the grounded
  // evidence-fetch in adjudicate_review has something real to read.
  const mkEvidence = (c, label, caseId, title, type, url, source, note) =>
    write(c, label, 'submit_evidence', ['', caseId, title, type, url, `hash-${Math.random().toString(36).slice(2)}`, source, note, '2023', 'Various', now()])

  await mkEvidence(cAlice, 'submit_evidence(A1 #1)', caseA1, 'HSP16.2 stress response dataset', 'Dataset', 'https://en.wikipedia.org/wiki/Heat_shock_protein', 'Wikipedia', 'Background on heat-shock protein induction under stress, relevant to hsp-16.2 regulation.')
  await mkEvidence(cBob, 'submit_evidence(A1 #2, by contributor bob)', caseA1, 'C. elegans cold-shock physiology overview', 'Research Paper', 'https://en.wikipedia.org/wiki/Caenorhabditis_elegans', 'Wikipedia', 'General organism background supporting the experimental model choice.')
  await mkEvidence(cAlice, 'submit_evidence(A2 #1)', caseA2, 'Intermittent fasting overview', 'Journal Article', 'https://en.wikipedia.org/wiki/Intermittent_fasting', 'Wikipedia', 'Summarizes existing trial landscape for intermittent fasting protocols.')
  await mkEvidence(cAlice, 'submit_evidence(A2 #2)', caseA2, 'Insulin resistance background', 'Journal Article', 'https://en.wikipedia.org/wiki/Insulin_resistance', 'Wikipedia', 'Defines the metabolic marker used as the primary outcome.')
  await mkEvidence(cBob, 'submit_evidence(B1 #1)', caseB1, 'Replication crisis overview', 'Research Paper', 'https://en.wikipedia.org/wiki/Replication_crisis', 'Wikipedia', 'Establishes prior base rates of replication failure across social psychology.')
  await mkEvidence(cBob, 'submit_evidence(B1 #2)', caseB1, 'Priming (psychology) background', 'Research Paper', 'https://en.wikipedia.org/wiki/Priming_(psychology)', 'Wikipedia', 'Defines the priming paradigm under evaluation.')
  await mkEvidence(cCarol, 'submit_evidence(C1 #1)', caseC1, 'Neural network pruning overview', 'Technical Whitepaper', 'https://en.wikipedia.org/wiki/Neural_network_pruning', 'Wikipedia', 'Surveys structured vs unstructured pruning methods relevant to the benchmark.')
  await mkEvidence(cCarol, 'submit_evidence(C1 #2)', caseC1, 'Transformer architecture background', 'Technical Whitepaper', 'https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)', 'Wikipedia', 'Architecture reference for the pruning target model.')

  // 6. AI consensus review — request_and_adjudicate (4 tx, slow: LLM + web fetch)
  await write(cAlice, 'request_and_adjudicate(A1)', 'request_and_adjudicate', [caseA1, now(), now()])
  await write(cAlice, 'request_and_adjudicate(A2)', 'request_and_adjudicate', [caseA2, now(), now()])
  await write(cBob, 'request_and_adjudicate(B1)', 'request_and_adjudicate', [caseB1, now(), now()])
  await write(cCarol, 'request_and_adjudicate(C1)', 'request_and_adjudicate', [caseC1, now(), now()])

  // 7. Retry review on one case (1 tx)
  await write(cAlice, 'retry_review(A2)', 'retry_review', [caseA2, now()])
  await write(cAlice, 'adjudicate_review(A2 retry)', 'adjudicate_review', [/* filled below */])

  // The retry needs the new review_id — fetch it from case state.
  const getCase = async (id) => {
    const raw = await readClient.readContract({ address: CONTRACT, functionName: 'get_research_case', args: [id] })
    return JSON.parse(raw || '{}')
  }
  const a2 = await getCase(caseA2)
  if (a2.last_review_id) {
    await write(cAlice, 'adjudicate_review(A2 retry, real)', 'adjudicate_review', [a2.last_review_id, now()])
  }

  // 8. Expert review + dispute (2 tx)
  await write(cAlice, 'submit_expert_review(A1, by case owner)', 'submit_expert_review', [
    caseA1, 'credible', 72, 78, 'Manual expert pass: methodology sound, replication likelihood moderate-high.',
    'Concurs with AI consensus; minor concerns about sample size noted.', 'expert-hash-a1', now(),
  ])
  await write(cBob, 'dispute_verdict(B1)', 'dispute_verdict', [caseB1, 'Disagree with confidence scoring given small evidence base.', 'ref-dispute-b1', now()])

  // 9. Replication attempts (2 tx) — must be non-owner
  await write(cBob, 'submit_replication_attempt(A1, by bob)', 'submit_replication_attempt', [
    caseA1, '', 'PARTIALLY_REPLICATED', 'Repeated the cold-stress protocol with n=40; observed upregulation but at lower magnitude.',
    'Used a different C. elegans strain (N2 vs CB4856).', 'Room temp 20C, cold shock 4C for 2h.', 'rep-hash-1', now(),
  ])
  await write(cCarol, 'submit_replication_attempt(C1, by carol)', 'submit_replication_attempt', [
    caseC1, '', 'REPLICATED', 'Reproduced pruning benchmark on an independent codebase and dataset split.',
    'None significant.', 'A100 GPU, PyTorch 2.3.', 'rep-hash-2', now(),
  ])

  // 10. Citations (2 tx)
  await write(cCarol, 'add_citation(C1 -> A2)', 'add_citation', [caseC1, caseA2, 'Cited for meta-analysis methodology reference.', 'RELATED', now()])
  await write(cBob, 'add_citation(B1 -> A1)', 'add_citation', [caseB1, caseA1, 'Cross-domain replication-rate comparison.', 'RELATED', now()])

  // 11. Upvotes + follows (7 tx)
  await write(cBob, 'upvote_case(A1, by bob)', 'upvote_case', [caseA1, now()])
  await write(cCarol, 'upvote_case(A1, by carol)', 'upvote_case', [caseA1, now()])
  await write(cCarol, 'upvote_case(C1... skip self)', 'follow_case', [caseA2, now()]) // carol follows A2 instead of self-upvote
  await write(cAlice, 'follow_case(alice follows B1)', 'follow_case', [caseB1, now()])
  await write(cAlice, 'follow_case(alice follows C1)', 'follow_case', [caseC1, now()])
  await write(cBob, 'unfollow_case(bob never followed — expect fail, tests guard)', 'unfollow_case', [caseA2])
  await write(cBob, 'remove_upvote(bob removes A1 upvote)', 'remove_upvote', [caseA1])

  // 12. Archive one case (1 tx)
  await write(cCarol, 'archive_research_case(C1)', 'archive_research_case', [caseC1, now()])

  fs.writeFileSync('scripts/seed-log.txt', log.join('\n'))
  console.log(`\nDone. ${log.filter((l) => l.startsWith('OK')).length} succeeded, ${log.filter((l) => l.startsWith('FAIL')).length} failed.`)
  console.log('Full log written to scripts/seed-log.txt')
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
