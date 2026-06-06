import { GlassCard, StatRow, PanelWrapper } from './GlassCard'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { getDeviceById } from '../../data/buildingData'

const TYPE_LABELS: Record<string, string> = {
  light: 'Lighting',
  computer: 'Computer',
  monitor: 'Display',
  hvac: 'HVAC',
  charger: 'Charger',
  meter: 'Smart Meter',
  appliance: 'Appliance',
  server: 'Server',
  outlet: 'Power Outlet',
  switch: 'Wall Switch',
  printer: 'Printer',
  plant: 'Decoration',
}

export function DevicePanel() {
  const selectedDeviceId = useShadowGridStore((s) => s.selectedDeviceId)
  const navigationLevel = useShadowGridStore((s) => s.navigationLevel)

  if (!selectedDeviceId || navigationLevel !== 'device') return null

  const result = getDeviceById(selectedDeviceId)
  if (!result) return null

  const { device, room } = result

  return (
    <PanelWrapper>
      <GlassCard key={device.id} title="Device Telemetry" glow="energy" className="w-80">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">{device.name}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {TYPE_LABELS[device.type] ?? device.type} · {room.name}
          </p>
        </div>

        <StatRow
          label="Current Consumption"
          value={device.status === 'on' ? device.powerUsage : 0}
          unit="W"
          highlight
        />
        <StatRow
          label="Status"
          value={device.status === 'on' ? 'Online' : 'Offline'}
        />
        <StatRow label="Health" value={`${device.health}%`} />
        <StatRow label="Daily Usage" value={device.dailyUsage} unit="kWh" />
        <StatRow label="Est. Cost" value={`$${device.estimatedCost}`} unit="/day" />

        {/* Health bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Device Health</span>
            <span className="stat-value">{device.health}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${device.health}%`,
                background:
                  device.health > 90
                    ? 'linear-gradient(90deg, #34d399, #10b981)'
                    : device.health > 70
                      ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                      : 'linear-gradient(90deg, #f87171, #ef4444)',
              }}
            />
          </div>
        </div>

        {/* Power indicator */}
        <div className="mt-4 flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${device.status === 'on' ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: device.status === 'on' ? '#34d399' : '#475569',
              boxShadow: device.status === 'on' ? '0 0 12px #34d399' : 'none',
            }}
          />
          <span className="text-xs text-slate-400">
            {device.status === 'on'
              ? `Drawing ${device.powerUsage}W — energy flow active`
              : 'Device offline — no energy flow'}
          </span>
        </div>
      </GlassCard>
    </PanelWrapper>
  )
}
