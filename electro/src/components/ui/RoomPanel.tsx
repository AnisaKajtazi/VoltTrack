import { GlassCard, StatRow, PanelWrapper } from './GlassCard'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { getRoomById } from '../../data/buildingData'
import { getPowerFlowColor, formatWatts } from '../../utils/energyUtils'

export function RoomPanel() {
  const selectedRoomId = useShadowGridStore((s) => s.selectedRoomId)
  const navigationLevel = useShadowGridStore((s) => s.navigationLevel)
  const selectDevice = useShadowGridStore((s) => s.selectDevice)

  if (!selectedRoomId || (navigationLevel !== 'room' && navigationLevel !== 'device')) return null

  const result = getRoomById(selectedRoomId)
  if (!result) return null

  const { room } = result
  const activeDevices = room.devices.filter((d) => d.status === 'on').length

  return (
    <PanelWrapper>
      <GlassCard key={room.id} title="Room Analysis" glow="energy" className="w-80">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">{room.name}</h2>
          <div
            className="w-3 h-3 rounded-full inline-block ml-2"
            style={{ backgroundColor: room.color }}
          />
        </div>

        <StatRow label="Area" value={room.area} unit="m²" />
        <StatRow
          label="Dimensions"
          value={`${room.dimensions.width}×${room.dimensions.depth}×${room.dimensions.height}`}
          unit="m"
        />
        <StatRow label="Occupancy" value={room.occupancy} unit="people" />
        <StatRow label="Energy Usage" value={room.energyUsage} unit="kWh" highlight />
        <StatRow label="Active Devices" value={`${activeDevices}/${room.devices.length}`} />

        <div className="mt-4 pt-3 border-t border-slate-700/30">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Devices in Room</p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {room.devices
              .filter((d) => d.type !== 'plant')
              .map((device) => {
                const flowColor = getPowerFlowColor(
                  device.powerUsage,
                  device.status === 'on',
                  device.health,
                )
                return (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() => selectDevice(device.id)}
                    className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-800/40 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <span className="text-slate-300 text-left">{device.name}</span>
                    <span
                      className="stat-value font-mono"
                      style={{ color: device.status === 'on' ? flowColor : '#64748b' }}
                    >
                      {device.status === 'on' ? formatWatts(device.powerUsage) : 'OFF'}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>
      </GlassCard>
    </PanelWrapper>
  )
}
