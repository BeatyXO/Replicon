import Link from 'next/link'
import { Microscope } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Microscope className="h-12 w-12 text-[#A56ABD]/40 mb-6" />
      <h1 className="text-5xl font-bold text-[#F5EBFA] mb-4">404</h1>
      <p className="text-[#E7DBEF]/60 mb-8">This research record does not exist in the registry.</p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-md bg-[#6E3482] text-[#F5EBFA] text-sm border border-[#A56ABD]/40 hover:bg-[#6E3482]/80 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
