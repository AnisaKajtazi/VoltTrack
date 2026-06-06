import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useAIStore } from '../../store/aiStore'

export function InsightsDashboard() {
  const metrics = useAIStore((state) => state.metrics)
  const floors = useAIStore((state) => state.floors)
  const rooms = useAIStore((state) => state.rooms)
  const devices = useAIStore((state) => state.devices)
  const anomalies = useAIStore((state) => state.anomalies)

  return (
    <div className="mx-auto h-full w-full max-w-7xl overflow-y-auto px-6 pb-8 pt-28">
      <div className="grid grid-cols-5 gap-3 max-xl:grid-cols-3 max-md:grid-cols-1">
        <MetricCard label="Total Energy" value={metrics.totalKw} unit="kW" tone="sky" />
        <MetricCard label="Current Cost" value={metrics.costPerHour} unit="$/hour" tone="emerald" />
        <MetricCard label="CO2 Emissions" value={metrics.co2KgPerHour} unit="kg/hour" tone="amber" />
        <MetricCard label="Active Devices" value={metrics.activeDevices} unit="online" tone="violet" />
        <MetricCard label="Inefficiencies" value={metrics.inefficiencies} unit="detected" tone="rose" />
      </div>

      <div className="mt-5 grid grid-cols-[0.9fr_1.1fr_1fr] gap-5 max-xl:grid-cols-1">
        <Panel title="Floor-wise Consumption">
          <div className="space-y-4">
            {floors.map((floor) => (
              <BarRow key={floor.id} label={floor.name} value={`${floor.value} kW`} percent={floor.percent} status={floor.status} />
            ))}
          </div>
        </Panel>

        <Panel title="Room-wise Heatmap">
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {rooms.slice(0, 10).map((room) => (
              <div key={room.id} className={`rounded-xl border p-3 ${heatClass(room.status)}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{room.name}</p>
                  <span className="stat-value text-xs text-slate-300">{room.value} kW</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-950/60">
                  <div className="h-full rounded-full bg-current transition-all duration-700" style={{ width: `${Math.max(8, room.percent)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Top Energy Consumers">
          <div className="space-y-3">
            {devices.slice(0, 7).map((device, index) => (
              <div key={device.id} className="rounded-xl border border-slate-700/50 bg-slate-950/35 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {index + 1}. {device.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {device.floorName} / {device.roomName}
                    </p>
                  </div>
                  <span className="stat-value text-sm font-semibold text-sky-300">{device.percent}%</span>
                </div>
                <p className="stat-value mt-2 text-xs text-slate-400">{device.watts} W</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="AI Malfunction Detection Engine" className="mt-5">
        <div className="grid grid-cols-3 gap-3 max-xl:grid-cols-1">
          {anomalies.slice(0, 6).map((anomaly) => (
            <div key={anomaly.deviceId} className="rounded-xl border border-slate-700/50 bg-slate-950/35 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{anomaly.issue}</p>
                  <p className="mt-1 text-xs text-slate-500">{anomaly.deviceName}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wider ${severityClass(anomaly.severity)}`}>
                  {anomaly.severity}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{anomaly.suggestion}</p>
              <p className="mt-2 text-xs text-emerald-300">Estimated savings {anomaly.estimatedSavings}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function MetricCard({ label, value, unit, tone }: { label: string; value: number; unit: string; tone: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel rounded-xl p-4 metric-${tone}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="stat-value mt-3 text-3xl font-semibold text-white">
        {value}
        <span className="ml-2 text-xs text-slate-500">{unit}</span>
      </p>
    </motion.div>
  )
}

function Panel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel rounded-2xl p-5 ${className}`}
    >
      <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">{title}</h2>
      {children}
    </motion.section>
  )
}

function BarRow({ label, value, percent, status }: { label: string; value: string; percent: number; status: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-200">{label}</span>
        <span className="stat-value text-slate-400">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-950/60">
        <div className={`h-full rounded-full transition-all duration-700 ${barClass(status)}`} style={{ width: `${Math.max(8, percent)}%` }} />
      </div>
    </div>
  )
}

function barClass(status: string): string {
  if (status === 'critical') return 'bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.5)]'
  if (status === 'watch') return 'bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.45)]'
  return 'bg-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.45)]'
}

function heatClass(status: string): string {
  if (status === 'critical') return 'border-rose-400/25 bg-rose-400/10 text-rose-300'
  if (status === 'watch') return 'border-amber-400/25 bg-amber-400/10 text-amber-300'
  return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
}

function severityClass(severity: string): string {
  if (severity === 'high') return 'border border-rose-300/25 bg-rose-400/15 text-rose-200'
  if (severity === 'medium') return 'border border-amber-300/25 bg-amber-400/15 text-amber-200'
  return 'border border-sky-300/25 bg-sky-400/15 text-sky-200'
}
