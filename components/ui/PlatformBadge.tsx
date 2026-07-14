import type { Platform } from '@/types'

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string }> = {
  facebook: { label: 'Facebook', color: 'bg-blue-600/20 text-blue-400 ring-blue-500/20' },
  instagram: { label: 'Instagram', color: 'bg-pink-600/20 text-pink-400 ring-pink-500/20' },
  both: { label: 'FB + IG', color: 'bg-purple-600/20 text-purple-400 ring-purple-500/20' },
}

export default function PlatformBadge({ platform }: { platform: Platform }) {
  const { label, color } = PLATFORM_CONFIG[platform]
  return <span className={`badge ${color}`}>{label}</span>
}
