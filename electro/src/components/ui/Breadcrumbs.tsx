import { motion } from 'framer-motion'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { buildingData } from '../../data/buildingData'
import type { BreadcrumbItem } from '../../types'

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  )
}

export function Breadcrumbs() {
  const navigationLevel = useShadowGridStore((s) => s.navigationLevel)
  const selectedFloorId = useShadowGridStore((s) => s.selectedFloorId)
  const selectedRoomId = useShadowGridStore((s) => s.selectedRoomId)
  const selectedDeviceId = useShadowGridStore((s) => s.selectedDeviceId)
  const navigateTo = useShadowGridStore((s) => s.navigateTo)

  const items: BreadcrumbItem[] = [{ id: 'building', label: buildingData.name, level: 'building' }]

  if (selectedFloorId) {
    const floor = buildingData.floors.find((f) => f.id === selectedFloorId)
    if (floor) items.push({ id: floor.id, label: floor.name, level: 'floor' })
  }

  if (selectedRoomId) {
    for (const floor of buildingData.floors) {
      const room = floor.rooms.find((r) => r.id === selectedRoomId)
      if (room) {
        items.push({ id: room.id, label: room.name, level: 'room' })
        break
      }
    }
  }

  if (selectedDeviceId) {
    for (const floor of buildingData.floors) {
      for (const room of floor.rooms) {
        const device = room.devices.find((d) => d.id === selectedDeviceId)
        if (device) {
          items.push({ id: device.id, label: device.name, level: 'device' })
          break
        }
      }
    }
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 text-sm"
    >
      {items.map((item, index) => {
        const isActive = item.level === navigationLevel

        return (
          <div key={item.id} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-slate-600">
                <ChevronIcon />
              </span>
            )}
            <button
              type="button"
              onClick={() => navigateTo(item.level, item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {index === 0 && <BuildingIcon />}
              <span className="font-medium">{item.label}</span>
            </button>
          </div>
        )
      })}
    </motion.nav>
  )
}
