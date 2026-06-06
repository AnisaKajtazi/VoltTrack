import { motion } from 'framer-motion'
import { useAIStore } from '../../store/aiStore'
import type { FutureScenario } from '../../ai/optimizationEngine'

const scenarios: FutureScenario[] = ['normal', 'stress', 'optimized']

export function FutureModeTab() {
  const futureScenario = useAIStore((state) => state.futureScenario)
  const scenarioMetrics = useAIStore((state) => state.scenarioMetrics)
  const setFutureScenario = useAIStore((state) => state.setFutureScenario)
  const currentIndex = scenarios.indexOf(futureScenario)

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center px-6 pb-8 pt-28 max-md:justify-start max-md:overflow-y-auto">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-6"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-300">Predictions & Future Mode</p>
        <div className="mt-3 flex items-end justify-between gap-5 max-md:flex-col max-md:items-start">
          <div>
            <h2 className="text-3xl font-semibold text-white">{scenarioMetrics.scenarioLabel}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              The digital twin projects three futures: baseline operation, high-demand stress, and AI-optimized control.
            </p>
          </div>
          <div className="rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-2 text-sm font-semibold text-sky-100">
            {currentIndex === 0 ? 'NOW' : currentIndex === 1 ? 'STRESS' : 'OPTIMIZED'}
          </div>
        </div>

        <div className="mt-8">
          <input
            type="range"
            min="0"
            max="2"
            step="1"
            value={currentIndex}
            onChange={(event) => setFutureScenario(scenarios[Number(event.target.value)])}
            className="future-slider w-full"
            aria-label="Future scenario"
          />
          <div className="mt-3 grid grid-cols-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Now</span>
            <span className="text-center">Stress</span>
            <span className="text-right">Optimized</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <FutureMetric label="Energy" value={scenarioMetrics.totalKw} unit="kW" />
          <FutureMetric label="Cost" value={scenarioMetrics.costPerHour} unit="$/hour" />
          <FutureMetric label="CO2" value={scenarioMetrics.co2KgPerHour} unit="kg/hour" />
          <FutureMetric label="Inefficiencies" value={scenarioMetrics.inefficiencies} unit="active" />
        </div>
      </motion.section>

      <div className="mt-5 grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        <ScenarioCard title="Normal" active={futureScenario === 'normal'} body="Baseline live building values with current device load and detected inefficiencies." />
        <ScenarioCard title="High Demand" active={futureScenario === 'stress'} body="Stress projection increases energy, cost, and emissions by 40% under heavy occupancy." />
        <ScenarioCard title="Optimized AI Mode" active={futureScenario === 'optimized'} body="Approved intelligence mode lowers the load envelope by 27% and suppresses idle waste." />
      </div>
    </div>
  )
}

function FutureMetric({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <motion.div
      key={`${label}-${value}`}
      initial={{ opacity: 0.4, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-700/50 bg-slate-950/35 p-4"
    >
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="stat-value mt-3 text-3xl font-semibold text-white">
        {value}
        <span className="ml-2 text-xs text-slate-500">{unit}</span>
      </p>
    </motion.div>
  )
}

function ScenarioCard({ title, body, active }: { title: string; body: string; active: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 transition ${active ? 'border-sky-300/35 bg-sky-300/10 shadow-[0_0_24px_rgba(56,189,248,0.18)]' : 'border-slate-700/50 bg-slate-950/25'}`}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
    </div>
  )
}
