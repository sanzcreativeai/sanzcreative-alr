export default function Loading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/10 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-600">Loading…</p>
      </div>
    </div>
  )
}
