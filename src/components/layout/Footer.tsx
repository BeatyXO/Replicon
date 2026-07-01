import Link from 'next/link'
import { Microscope, ExternalLink } from 'lucide-react'
import { EXPLORER_URL } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-[#6E3482]/40 bg-[#49225B]/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Microscope className="h-4 w-4 text-[#A56ABD]" />
            <span className="text-[#E7DBEF]/60 text-sm">
              Replicon Protocol — Decentralized Research Consensus
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#E7DBEF]/50">
            <Link href="/dashboard" className="hover:text-[#F5EBFA] transition-colors">Dashboard</Link>
            <Link href="/cases" className="hover:text-[#F5EBFA] transition-colors">Cases</Link>
            <Link href="/evidence" className="hover:text-[#F5EBFA] transition-colors">Evidence</Link>
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#F5EBFA] transition-colors"
            >
              Explorer <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-[#E7DBEF]/30">
          Powered by GenLayer · StudioNet · GEN Token
        </p>
      </div>
    </footer>
  )
}
