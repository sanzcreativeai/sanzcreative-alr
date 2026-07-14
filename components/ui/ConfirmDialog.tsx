'use client'

import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', danger = false, loading = false
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="" maxWidth="sm">
      <div className="text-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 ${
          danger ? 'bg-red-500/10' : 'bg-amber-500/10'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
        </div>
        <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
        <p className="text-xs text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 justify-center font-medium px-4 py-2 rounded-lg transition-all duration-150 text-sm flex items-center gap-2 disabled:opacity-50 ${
              danger
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-brand-600 hover:bg-brand-500 text-white'
            }`}
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
