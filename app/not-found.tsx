import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-600/20 border border-brand-500/20 rounded-2xl mb-6">
          <Zap className="w-6 h-6 text-brand-400" />
        </div>
        <p className="text-6xl font-bold text-white mb-2">404</p>
        <p className="text-base font-medium text-slate-300 mb-1">Page not found</p>
        <p className="text-sm text-slate-500 mb-8 max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/dashboard" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
