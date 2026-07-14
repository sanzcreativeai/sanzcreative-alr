'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-base font-semibold text-white mb-1">Something went wrong</p>
        <p className="text-sm text-slate-500 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button onClick={reset} className="btn-primary inline-flex">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  )
}
