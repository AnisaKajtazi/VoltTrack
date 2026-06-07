import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAIStore } from '../../store/aiStore'
import { speak, stopSpeaking } from '../../utils/voice/speak'
import { OptimizationModal } from './OptimizationModal'

export function AIBrainPanel() {
  const insight = useAIStore((state) => state.insight)
  const anomalies = useAIStore((state) => state.anomalies)
  const optimizationApproved = useAIStore((state) => state.optimizationApproved)
  const optimizationStatusMessage = useAIStore((state) => state.optimizationStatusMessage)
  const approveOptimization = useAIStore((state) => state.approveOptimization)
  const [modalOpen, setModalOpen] = useState(false)

  const brainText = useMemo(
    () =>
      [
        insight.message,
        ...insight.findings.map((finding) => `- ${finding}`),
        insight.suggestion,
        `Confidence ${(insight.confidence * 100).toFixed(0)}%.`,
      ].join('\n'),
    [insight],
  )

  const displayText = useMemo(
    () => [brainText, optimizationStatusMessage].filter(Boolean).join('\n\n'),
    [brainText, optimizationStatusMessage],
  )

  useEffect(() => {
    speak(brainText)

    return () => stopSpeaking()
  }, [brainText])

  useEffect(() => {
    if (optimizationStatusMessage) {
      speak(optimizationStatusMessage)
    }
  }, [optimizationStatusMessage])

  function handleApprove() {
    approveOptimization()
    setModalOpen(true)
  }

  return (
    <>
      <div className="mx-auto grid h-full w-full max-w-6xl grid-cols-[1.2fr_0.8fr] gap-5 px-6 pb-6 pt-28 max-lg:grid-cols-1 max-lg:overflow-y-auto">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel relative overflow-hidden rounded-2xl p-6"
        >
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-sky-300/20 bg-sky-300/10 blur-sm brain-pulse" />
          <div className="relative z-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-300">AI Building Brain</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">The building is awake</h2>
              </div>
              <div className="rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1 text-xs font-medium text-sky-100">
                Thinking
              </div>
            </div>

            <TypewriterText key={displayText} text={displayText} />

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={optimizationApproved}
                className="rounded-lg border border-emerald-300/30 bg-emerald-400/20 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-default disabled:border-emerald-300/10 disabled:bg-emerald-400/10 disabled:text-emerald-200/60"
              >
                {optimizationApproved ? 'Optimization Active' : 'Approve Optimization'}
              </button>
              <p className="text-sm text-slate-400">
                {optimizationApproved
                  ? 'AC load, idle lights, and cooling loops are now in reduced-flow mode.'
                  : 'Approval lets the building adjust power, lighting, and cooling automatically.'}
              </p>
            </div>
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass-panel rounded-2xl p-5"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-300">Problem Areas</p>
          <div className="mt-4 space-y-3">
            {anomalies.slice(0, 5).map((anomaly) => (
              <div key={anomaly.deviceId} className="rounded-xl border border-slate-700/50 bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{anomaly.deviceName}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {anomaly.floorName} / {anomaly.roomName}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${severityClass(anomaly.severity)}`}>
                    {anomaly.severity}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{anomaly.issue}</p>
                <p className="mt-2 text-xs text-emerald-300">{anomaly.suggestion} - {anomaly.estimatedSavings}</p>
              </div>
            ))}
          </div>
        </motion.aside>
      </div>

      <OptimizationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}

function TypewriterText({ text }: { text: string }) {
  const [visibleChars, setVisibleChars] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisibleChars((current) => Math.min(text.length, current + 2))
    }, 24)

    return () => window.clearInterval(interval)
  }, [text])

  return (
    <pre className="min-h-[290px] whitespace-pre-wrap rounded-xl border border-slate-700/50 bg-slate-950/45 p-5 font-mono text-sm leading-7 text-slate-100 shadow-inner">
      {text.slice(0, visibleChars)}
      <span className="type-cursor">|</span>
    </pre>
  )
}

function severityClass(severity: string): string {
  if (severity === 'high') return 'border border-rose-300/25 bg-rose-400/15 text-rose-200'
  if (severity === 'medium') return 'border border-amber-300/25 bg-amber-400/15 text-amber-200'
  return 'border border-sky-300/25 bg-sky-400/15 text-sky-200'
}
