export type PowerFlowLevel = 'normal' | 'medium' | 'high' | 'anomaly' | 'inactive'

export const POWER_FLOW_COLORS: Record<PowerFlowLevel, string> = {
  normal: '#34d399',
  medium: '#fbbf24',
  high: '#ef4444',
  anomaly: '#a855f7',
  inactive: '#475569',
}

export function getPowerFlowLevel(
  power: number,
  isActive: boolean,
  health = 100,
): PowerFlowLevel {
  if (!isActive || power <= 0) return 'inactive'
  if (health < 75 || (power > 2000 && health < 85)) return 'anomaly'
  if (power >= 800) return 'high'
  if (power >= 200) return 'medium'
  return 'normal'
}

export function getPowerFlowColor(
  power: number,
  isActive: boolean,
  health = 100,
): string {
  return POWER_FLOW_COLORS[getPowerFlowLevel(power, isActive, health)]
}

export function formatWatts(watts: number): string {
  if (watts >= 1000) return `${(watts / 1000).toFixed(1)}kW`
  return `${watts}W`
}
