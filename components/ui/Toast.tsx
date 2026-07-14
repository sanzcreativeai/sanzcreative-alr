'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />,
    error:   <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
    info:    <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />,
  }

  const colors = {
    success: 'bg-surface-2 border-green-500/20',
    error:   'bg-surface-2 border-red-500/20',
    info:    'bg-surface-2 border-blue-500/20',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast stack */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-black/30',
              'animate-in slide-in-from-right-4 fade-in duration-200',
              colors[t.type]
            )}
          >
            {icons[t.type]}
            <p className="text-sm text-slate-200 flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
