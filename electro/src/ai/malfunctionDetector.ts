import type { Building, Device, Floor, Room } from '../types'

export type Severity = 'low' | 'medium' | 'high'

export interface DeviceAnomaly {
  deviceId: string
  deviceName: string
  floorId: string
  floorName: string
  roomId: string
  roomName: string
  issue: string
  severity: Severity
  suggestion: string
  estimatedSavings: string
  currentUsage: number
  baselineUsage: number
}

function deviceBaseline(device: Device): number {
  const typeBaseline: Record<string, number> = {
    hvac: 780,
    server: 1850,
    light: 130,
    computer: 170,
    monitor: 45,
    appliance: 280,
    printer: 55,
    meter: 140,
    charger: 45,
    outlet: 10,
    switch: 2,
    plant: 0,
  }

  return typeBaseline[device.type] ?? 120
}

function severityFor(ratio: number, health: number): Severity {
  if (ratio > 1.8 || health < 88) return 'high'
  if (ratio > 1.35 || health < 93) return 'medium'
  return 'low'
}

function savingsFor(device: Device, ratio: number): string {
  const monthly = Math.max(6, (device.powerUsage * Math.max(0.15, ratio - 1) * 9 * 30 * 0.12) / 1000)
  return `$${Math.round(monthly)}/month`
}

function describeIssue(device: Device, ratio: number, room: Room): string | null {
  if (device.status === 'off' || device.powerUsage <= 0) return null

  if (device.type === 'hvac' && ratio > 1.25) return 'HVAC overuse detected'
  if (device.type === 'light' && room.occupancy <= 4) return 'Idle lighting during low occupancy'
  if (device.type === 'server' && device.health < 90) return 'Server thermal inefficiency'
  if (ratio > 1.5) return 'Overconsumption detected'
  if (device.health < 90) return 'Maintenance deviation detected'

  return null
}

function suggestionFor(device: Device, issue: string): string {
  if (device.type === 'hvac') return 'Reduce temperature load or inspect filter'
  if (device.type === 'light') return 'Switch lights to occupancy-aware mode'
  if (device.type === 'server') return 'Rebalance rack cooling and airflow'
  if (issue.includes('Maintenance')) return 'Schedule targeted inspection'
  return 'Apply automated load reduction'
}

export function detectMalfunctions(building: Building): DeviceAnomaly[] {
  const anomalies: DeviceAnomaly[] = []

  for (const floor of building.floors) {
    for (const room of floor.rooms) {
      for (const device of room.devices) {
        const baselineUsage = deviceBaseline(device)
        const ratio = baselineUsage > 0 ? device.powerUsage / baselineUsage : 0
        const issue = describeIssue(device, ratio, room)

        if (!issue) continue

        anomalies.push({
          deviceId: device.id,
          deviceName: device.name,
          floorId: floor.id,
          floorName: floor.name,
          roomId: room.id,
          roomName: room.name,
          issue,
          severity: severityFor(ratio, device.health),
          suggestion: suggestionFor(device, issue),
          estimatedSavings: savingsFor(device, ratio),
          currentUsage: device.powerUsage,
          baselineUsage,
        })
      }
    }
  }

  return anomalies.sort((a, b) => {
    const severityRank: Record<Severity, number> = { high: 3, medium: 2, low: 1 }
    return severityRank[b.severity] - severityRank[a.severity] || b.currentUsage - a.currentUsage
  })
}

export function getFloorAnomalyScore(floor: Floor, anomalies: DeviceAnomaly[]): number {
  const floorAnomalies = anomalies.filter((anomaly) => anomaly.floorId === floor.id)
  return floorAnomalies.reduce((sum, anomaly) => {
    if (anomaly.severity === 'high') return sum + 3
    if (anomaly.severity === 'medium') return sum + 2
    return sum + 1
  }, 0)
}
