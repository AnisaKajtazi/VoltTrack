import { GlassCard, StatRow, StatusBadge, PanelWrapper } from './GlassCard'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { motion } from 'framer-motion'

export function FloorPanel() {
  const selectedFloorId = useShadowGridStore((s) => s.selectedFloorId)
  const navigationLevel = useShadowGridStore((s) => s.navigationLevel)
  const enterFloor = useShadowGridStore((s) => s.enterFloor)
  const getSelectedFloor = useShadowGridStore((s) => s.getSelectedFloor)

  const floor = getSelectedFloor()

  if (!floor || navigationLevel !== 'floor' || !selectedFloorId) return null

  return (
    <PanelWrapper>
      <GlassCard key={floor.id} title="Floor Intelligence" glow="accent" className="w-80">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">{floor.name}</h2>
          <p className="text-xs text-slate-500 mt-1">Floor {floor.number} · Digital Twin Layer</p>
        </div>

        <StatRow label="Area" value={floor.area} unit="m²" />
        <StatRow label="Occupancy" value={floor.occupancy} unit="people" />
        <StatRow
          label="Energy Consumption"
          value={floor.energyConsumption}
          unit="kWh"
          highlight
        />
        <StatRow label="Room Count" value={floor.roomCount} />

        <div className="flex flex-wrap gap-2 mt-4 mb-5">
          <StatusBadge label={`HVAC: ${floor.hvacStatus}`} status={floor.hvacStatus} />
          <StatusBadge
            label={`Electrical: ${floor.electricalStatus}`}
            status={floor.electricalStatus}
          />
          <StatusBadge
            label={`Maintenance: ${floor.maintenanceStatus}`}
            status={floor.maintenanceStatus}
          />
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={enterFloor}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-shadow"
        >
          Enter Floor →
        </motion.button>
      </GlassCard>
    </PanelWrapper>
  )
}
