import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassCardProps {
  title?: string
  children: ReactNode
  className?: string
  glow?: 'accent' | 'energy' | 'none'
}

export function GlassCard({ title, children, className = '', glow = 'none' }: GlassCardProps) {
  const glowClass =
    glow === 'accent' ? 'glow-accent' : glow === 'energy' ? 'glow-energy' : ''

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel rounded-2xl p-5 ${glowClass} ${className}`}
    >
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  )
}

interface StatRowProps {
  label: string
  value: string | number
  unit?: string
  highlight?: boolean
}

export function StatRow({ label, value, unit, highlight }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span
        className={`stat-value text-sm font-medium ${highlight ? 'text-sky-400' : 'text-slate-200'}`}
      >
        {value}
        {unit && <span className="text-slate-500 ml-1 text-xs">{unit}</span>}
      </span>
    </div>
  )
}

interface StatusBadgeProps {
  label: string
  status: string
}

const STATUS_COLORS = {
  good: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  normal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  optimal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  scheduled: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  elevated: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  overload: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function StatusBadge({ label, status }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.normal
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  )
}

export function PanelWrapper({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">{children}</AnimatePresence>
  )
}
