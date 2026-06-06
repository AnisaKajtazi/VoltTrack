import { buildingData } from '../data/buildingData'
import type { Building, Device, Floor, Room } from '../types'
import { detectMalfunctions, type DeviceAnomaly } from './malfunctionDetector'

export interface EnergyMetrics {
  totalKw: number
  costPerHour: number
  co2KgPerHour: number
  activeDevices: number
  inefficiencies: number
}

export interface ConsumptionRow {
  id: string
  name: string
  value: number
  percent: number
  status: 'efficient' | 'watch' | 'critical'
}

export interface DeviceRanking {
  id: string
  name: string
  roomName: string
  floorName: string
  type: string
  watts: number
  percent: number
}

export interface BuildingInsight {
  message: string
  findings: string[]
  suggestion: string
  confidence: number
}

const COST_PER_KWH = 0.18
const CO2_KG_PER_KWH = 0.39

function allDevices(building: Building): Array<{ device: Device; room: Room; floor: Floor }> {
  return building.floors.flatMap((floor) =>
    floor.rooms.flatMap((room) => room.devices.map((device) => ({ device, room, floor }))),
  )
}

function statusFor(percent: number): ConsumptionRow['status'] {
  if (percent >= 28) return 'critical'
  if (percent >= 16) return 'watch'
  return 'efficient'
}

export function getEffectivePower(device: Device, optimizationFactor: number): number {
  if (device.status === 'off') return 0
  if (device.type === 'plant') return 0

  const optimizedTypes = ['hvac', 'light', 'server', 'computer', 'monitor']
  const reduction = optimizedTypes.includes(device.type) ? optimizationFactor : optimizationFactor * 0.35
  return Math.round(device.powerUsage * (1 - reduction))
}

export function analyzeEnergy(building: Building, optimizationFactor = 0): EnergyMetrics {
  const devices = allDevices(building)
  const totalWatts = devices.reduce((sum, { device }) => sum + getEffectivePower(device, optimizationFactor), 0)
  const totalKw = totalWatts / 1000
  const anomalies = detectMalfunctions(building)

  return {
    totalKw: Number(totalKw.toFixed(1)),
    costPerHour: Number((totalKw * COST_PER_KWH).toFixed(2)),
    co2KgPerHour: Number((totalKw * CO2_KG_PER_KWH).toFixed(1)),
    activeDevices: devices.filter(({ device }) => device.status === 'on' && getEffectivePower(device, optimizationFactor) > 0).length,
    inefficiencies: anomalies.length,
  }
}

export function getFloorConsumption(building: Building, optimizationFactor = 0): ConsumptionRow[] {
  const totalWatts = allDevices(building).reduce(
    (sum, { device }) => sum + getEffectivePower(device, optimizationFactor),
    0,
  )

  return building.floors.map((floor) => {
    const watts = floor.rooms.reduce(
      (floorSum, room) =>
        floorSum + room.devices.reduce((roomSum, device) => roomSum + getEffectivePower(device, optimizationFactor), 0),
      0,
    )
    const percent = totalWatts ? (watts / totalWatts) * 100 : 0

    return {
      id: floor.id,
      name: floor.name,
      value: Number((watts / 1000).toFixed(1)),
      percent: Number(percent.toFixed(0)),
      status: statusFor(percent),
    }
  })
}

export function getRoomConsumption(building: Building, optimizationFactor = 0): ConsumptionRow[] {
  const rooms = building.floors.flatMap((floor) => floor.rooms)
  const totalWatts = rooms.reduce(
    (sum, room) => sum + room.devices.reduce((roomSum, device) => roomSum + getEffectivePower(device, optimizationFactor), 0),
    0,
  )

  return rooms
    .map((room) => {
      const watts = room.devices.reduce((sum, device) => sum + getEffectivePower(device, optimizationFactor), 0)
      const percent = totalWatts ? (watts / totalWatts) * 100 : 0

      return {
        id: room.id,
        name: room.name,
        value: Number((watts / 1000).toFixed(1)),
        percent: Number(percent.toFixed(0)),
        status: statusFor(percent),
      }
    })
    .sort((a, b) => b.value - a.value)
}

export function getDeviceRanking(building: Building, optimizationFactor = 0): DeviceRanking[] {
  const devices = allDevices(building)
  const totalWatts = devices.reduce((sum, { device }) => sum + getEffectivePower(device, optimizationFactor), 0)

  return devices
    .map(({ device, room, floor }) => {
      const watts = getEffectivePower(device, optimizationFactor)
      return {
        id: device.id,
        name: device.name,
        roomName: room.name,
        floorName: floor.name,
        type: device.type,
        watts,
        percent: totalWatts ? Number(((watts / totalWatts) * 100).toFixed(0)) : 0,
      }
    })
    .filter((row) => row.watts > 0)
    .sort((a, b) => b.watts - a.watts)
}

export function buildInsight(anomalies: DeviceAnomaly[]): BuildingInsight {
  const high = anomalies.filter((anomaly) => anomaly.severity === 'high')
  const findings = [
    high[0]
      ? `${high[0].deviceName} in ${high[0].roomName} is consuming ${Math.round((high[0].currentUsage / high[0].baselineUsage - 1) * 100)}% more energy than normal`
      : 'Primary electrical load is stable',
    'Lighting in low-occupancy rooms is still drawing avoidable power',
    'Server room cooling is inefficient under current thermal load',
  ]

  return {
    message: 'Hello. I analyzed your building.',
    findings,
    suggestion: 'I can optimize your system and reduce consumption by 27%',
    confidence: 0.86,
  }
}

export function getCurrentEnergyModel(optimizationFactor = 0) {
  const anomalies = detectMalfunctions(buildingData)
  return {
    metrics: analyzeEnergy(buildingData, optimizationFactor),
    floors: getFloorConsumption(buildingData, optimizationFactor),
    rooms: getRoomConsumption(buildingData, optimizationFactor),
    devices: getDeviceRanking(buildingData, optimizationFactor),
    anomalies,
    insight: buildInsight(anomalies),
  }
}
