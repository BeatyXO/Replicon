import type { Metadata } from 'next'
import { Shantell_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { WalletProvider } from '@/components/wallet/WalletProvider'

const shantellSans = Shantell_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-shantell',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Replicon — Decentralized Research Interpretation & Replication Consensus',
  description:
    'Replicon uses GenLayer Intelligent Contracts and decentralized AI consensus to determine whether research findings are meaningful, credible, and reproducible.',
  keywords: ['research', 'reproducibility', 'AI consensus', 'GenLayer', 'scientific credibility'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={shantellSans.variable}>
      <body className="bg-[#49225B] text-[#F5EBFA] min-h-screen antialiased font-sans">
        <WalletProvider>
          {children}
        </WalletProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#6E3482',
              color: '#F5EBFA',
              border: '1px solid #A56ABD',
            },
          }}
        />
      </body>
    </html>
  )
}
