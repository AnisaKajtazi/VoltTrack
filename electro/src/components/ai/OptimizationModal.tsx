import { AnimatePresence, motion } from 'framer-motion'
import { useAIStore } from '../../store/aiStore'

interface OptimizationModalProps {
  open: boolean
  onClose: () => void
}

export function OptimizationModal({ open, onClose }: OptimizationModalProps) {
  const optimizationResult = useAIStore((state) => state.optimizationResult)

  return (
    <AnimatePresence>
      {open && optimizationResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                  Optimization Approved
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Building systems adjusted</h3>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                -{optimizationResult.savingsPercent}%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MetricDelta label="Energy" before={optimizationResult.before.totalKw} after={optimizationResult.after.totalKw} unit="kW" />
              <MetricDelta label="Cost" before={optimizationResult.before.costPerHour} after={optimizationResult.after.costPerHour} unit="$/h" />
              <MetricDelta label="CO2" before={optimizationResult.before.co2KgPerHour} after={optimizationResult.after.co2KgPerHour} unit="kg/h" />
            </div>

            <div className="mt-5 space-y-2">
              {optimizationResult.actions.map((action) => (
                <div key={action} className="flex items-center gap-3 rounded-lg border border-emerald-400/10 bg-emerald-400/5 px-3 py-2 text-sm text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.85)]" />
                  {action}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-lg border border-sky-300/25 bg-sky-400/15 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/25"
            >
              Continue Monitoring
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MetricDelta({ label, before, after, unit }: { label: string; before: number; after: number; unit: string }) {
  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-950/35 p-3">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="stat-value mt-2 text-lg font-semibold text-emerald-300">
        {after}
        <span className="ml-1 text-xs text-slate-500">{unit}</span>
      </p>
      <p className="stat-value text-xs text-slate-500">was {before}</p>
    </div>
  )
}
