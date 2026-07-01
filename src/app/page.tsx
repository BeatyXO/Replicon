import Link from 'next/link'
import { Microscope, Zap, Shield, BarChart3, Globe, ArrowRight } from 'lucide-react'

const FEATURES = [
  {
    icon: Microscope,
    title: 'Research Case Creation',
    desc: 'Submit research findings with full context — methodology, claims, hypotheses, and supporting evidence.',
  },
  {
    icon: Zap,
    title: 'AI Consensus Engine',
    desc: 'GenLayer validators produce non-deterministic evaluations, capturing the full range of scientific interpretation.',
  },
  {
    icon: BarChart3,
    title: 'Credibility Scoring',
    desc: 'Replication probability, statistical significance, methodology quality, and evidence strength scored on-chain.',
  },
  {
    icon: Shield,
    title: 'Immutable Verdicts',
    desc: 'Canonical credibility assessments stored permanently on GenLayer — transparent and tamper-proof.',
  },
  {
    icon: Globe,
    title: 'Public Evidence Registry',
    desc: 'A decentralized registry of public research evidence, linked by DOI, arXiv, GitHub, and clinical trial IDs.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#49225B]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#6E3482]/40">
        <div className="flex items-center gap-2">
          <Microscope className="h-5 w-5 text-[#A56ABD]" />
          <span className="font-bold text-lg text-[#F5EBFA] tracking-wide">REPLICON</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-[#E7DBEF]/70 hover:text-[#F5EBFA] transition-colors">Dashboard</Link>
          <Link href="/cases" className="text-sm text-[#E7DBEF]/70 hover:text-[#F5EBFA] transition-colors">Cases</Link>
          <Link
            href="/dashboard"
            className="px-4 py-1.5 rounded-md bg-[#6E3482] hover:bg-[#6E3482]/80 text-[#F5EBFA] text-sm border border-[#A56ABD]/40 transition-colors"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-20 text-center scan-line">
        <div className="absolute inset-0 bg-gradient-to-b from-[#6E3482]/10 via-transparent to-[#49225B] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#A56ABD]/30 bg-[#6E3482]/20 text-xs text-[#A56ABD] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A56ABD] animate-pulse" />
            Powered by GenLayer · StudioNet · GEN Token
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-[#F5EBFA] mb-6 tracking-widest">
            REPLICON
          </h1>

          <p className="text-[#A56ABD] text-lg md:text-xl font-semibold mb-4 tracking-wider uppercase">
            Decentralized Research Interpretation &amp; Replication Consensus
          </p>

          <p className="text-[#E7DBEF]/60 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Scientific findings are ambiguous. Replicon uses decentralized AI consensus to determine
            whether research is credible, statistically meaningful, and likely to replicate —
            recorded immutably on-chain.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#6E3482] hover:bg-[#6E3482]/80 text-[#F5EBFA] font-medium transition-colors border border-[#A56ABD]/40 group"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/cases/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-[#A56ABD]/30 bg-[#6E3482]/10 hover:bg-[#6E3482]/30 text-[#E7DBEF] font-medium transition-colors"
            >
              Submit Research
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 border-t border-[#6E3482]/30">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <p className="text-[#A56ABD] text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-2xl font-bold text-[#F5EBFA]">From Research to Consensus in 5 Steps</h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-4 text-center">
          {[
            { step: '01', label: 'Create Case', desc: 'Submit research title, claims & hypothesis' },
            { step: '02', label: 'Add Evidence', desc: 'Link public papers, datasets, repositories' },
            { step: '03', label: 'Request Review', desc: 'Trigger GenLayer AI evaluation' },
            { step: '04', label: 'AI Consensus', desc: 'Validators assess credibility independently' },
            { step: '05', label: 'Verdict', desc: 'Immutable score recorded on-chain' },
          ].map((s) => (
            <div key={s.step} className="terminal-card p-4">
              <p className="text-[#A56ABD] font-mono text-xs mb-2">{s.step}</p>
              <p className="text-[#F5EBFA] font-semibold text-sm mb-1">{s.label}</p>
              <p className="text-[#E7DBEF]/50 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[#E7DBEF]/50 text-xs font-semibold uppercase tracking-widest mb-10">
            Core Capabilities
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="terminal-card p-5 hover:border-[#A56ABD]/40 transition-colors group">
                <div className="p-2 rounded bg-[#6E3482]/40 w-fit mb-4 group-hover:bg-[#6E3482]/70 transition-colors">
                  <f.icon className="h-5 w-5 text-[#A56ABD]" />
                </div>
                <h3 className="text-[#F5EBFA] font-medium mb-2 text-sm">{f.title}</h3>
                <p className="text-[#E7DBEF]/50 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-[#6E3482]/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#F5EBFA] mb-4">READY TO SUBMIT RESEARCH?</h2>
          <p className="text-[#E7DBEF]/60 text-sm mb-8">
            Connect your wallet, create a research case, and request AI consensus evaluation.
          </p>
          <Link
            href="/cases/new"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-[#6E3482] hover:bg-[#6E3482]/80 text-[#F5EBFA] font-medium transition-colors border border-[#A56ABD]/40"
          >
            Create Research Case <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#6E3482]/30 py-6 px-4 text-center">
        <p className="text-xs text-[#E7DBEF]/30">
          Replicon Protocol · Powered by GenLayer · StudioNet · GEN Token
        </p>
      </footer>
    </div>
  )
}
