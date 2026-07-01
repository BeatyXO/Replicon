'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { Microscope } from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/cases', label: 'Research Cases' },
  { href: '/evidence', label: 'Evidence Registry' },
  { href: '/settings', label: 'Settings' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-[#6E3482]/40 bg-[#49225B]/90 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded bg-[#6E3482]/60 border border-[#A56ABD]/30 group-hover:border-[#A56ABD]/60 transition-colors">
            <Microscope className="h-5 w-5 text-[#A56ABD]" />
          </div>
          <span className="font-bold text-lg text-[#F5EBFA] tracking-wide">REPLICON</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                pathname?.startsWith(link.href)
                  ? 'bg-[#6E3482]/50 text-[#F5EBFA]'
                  : 'text-[#E7DBEF]/70 hover:text-[#F5EBFA] hover:bg-[#6E3482]/30',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <ConnectButton />
      </nav>
    </header>
  )
}
