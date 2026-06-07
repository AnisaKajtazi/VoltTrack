import { motion } from 'framer-motion'
import { cityBuildings, voltTrackHqMetrics, type CityBuilding } from '../../data/cityData'

interface CityPanelProps {
  selectedBuilding: CityBuilding
  onSelectBuilding: (buildingId: string) => void
}

export function CityPanel({ selectedBuilding, onSelectBuilding }: CityPanelProps) {
  const difference = Math.round(((selectedBuilding.metrics.monthlyCost - voltTrackHqMetrics.monthlyCost) / voltTrackHqMetrics.monthlyCost) * 100)
  const betterCost = difference <= 0

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="pointer-events-auto absolute right-6 top-28 z-20 flex max-h-[calc(100vh-9rem)] w-[360px] flex-col gap-4 overflow-y-auto max-md:left-6 max-md:right-6 max-md:top-auto max-md:bottom-6 max-md:w-auto"
    >
      <section className="glass-panel rounded-2xl p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-300">City Portfolio</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{selectedBuilding.name}</h2>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Metric label="Energy Usage" value={selectedBuilding.metrics.energyConsumption.toLocaleString()} unit="kWh/mo" />
          <Metric label="Monthly Cost" value={`$${selectedBuilding.metrics.monthlyCost.toLocaleString()}`} unit="/mo" />
          <Metric label="Carbon Footprint" value={selectedBuilding.metrics.co2Emissions.toLocaleString()} unit="kg CO2" />
          <Metric label="Efficiency Rating" value={selectedBuilding.metrics.efficiencyScore} unit="/100" />
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Compare Against VoltTrack HQ</p>
        <div className="mt-4 space-y-3">
          <ComparisonRow label="VoltTrack HQ" value={`$${voltTrackHqMetrics.monthlyCost.toLocaleString()}/month`} />
          <ComparisonRow label={selectedBuilding.name} value={`$${selectedBuilding.metrics.monthlyCost.toLocaleString()}/month`} />
          <div className="rounded-xl border border-slate-700/50 bg-slate-950/35 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Difference</p>
            <p className={`stat-value mt-2 text-3xl font-semibold ${betterCost ? 'text-emerald-300' : 'text-amber-300'}`}>
              {difference > 0 ? '+' : ''}
              {difference}%
            </p>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Buildings</p>
        <div className="grid grid-cols-2 gap-2">
          {cityBuildings.map((building) => (
            <button
              key={building.id}
              type="button"
              onClick={() => onSelectBuilding(building.id)}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                selectedBuilding.id === building.id
                  ? 'border-sky-300/35 bg-sky-300/15 text-sky-100'
                  : 'border-slate-700/40 bg-slate-950/25 text-slate-400 hover:border-slate-500/60 hover:text-slate-100'
              }`}
            >
              <span className="block font-semibold">{building.name}</span>
              <span className="stat-value mt-1 block text-slate-500">${building.metrics.monthlyCost.toLocaleString()}/mo</span>
            </button>
          ))}
        </div>
      </section>
    </motion.aside>
  )
}

function Metric({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-950/35 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="stat-value mt-2 text-xl font-semibold text-white">
        {value}
        <span className="ml-1 text-[10px] text-slate-500">{unit}</span>
      </p>
    </div>
  )
}

function ComparisonRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-700/50 bg-slate-950/25 px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="stat-value text-sm font-semibold text-white">{value}</span>
    </div>
  )
}
