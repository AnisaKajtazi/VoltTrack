export interface CityBuildingMetrics {
  energyConsumption: number
  monthlyCost: number
  co2Emissions: number
  efficiencyScore: number
}

export interface CityBuilding {
  id: string
  name: string
  position: [number, number, number]
  size: [number, number, number]
  color: string
  metrics: CityBuildingMetrics
}

export const voltTrackHqMetrics: CityBuildingMetrics = {
  energyConsumption: 4300,
  monthlyCost: 1200,
  co2Emissions: 890,
  efficiencyScore: 92,
}

export const cityBuildings: CityBuilding[] = [
  { id: 'volttrack-hq', name: 'VoltTrack HQ', position: [0, 0, 0], size: [4.6, 12, 4.2], color: '#38bdf8', metrics: voltTrackHqMetrics },
  { id: 'building-a', name: 'Building A', position: [-11, 0, -7], size: [3.4, 8.2, 3.2], color: '#64748b', metrics: { energyConsumption: 5200, monthlyCost: 1240, co2Emissions: 1040, efficiencyScore: 78 } },
  { id: 'building-b', name: 'Building B', position: [-5.5, 0, -9], size: [3, 6.5, 3.8], color: '#22c55e', metrics: { energyConsumption: 3200, monthlyCost: 850, co2Emissions: 640, efficiencyScore: 89 } },
  { id: 'building-c', name: 'Building C', position: [7.5, 0, -8], size: [4, 14.5, 3.5], color: '#f59e0b', metrics: { energyConsumption: 7600, monthlyCost: 1980, co2Emissions: 1510, efficiencyScore: 64 } },
  { id: 'building-d', name: 'Building D', position: [13, 0, -4], size: [3.2, 9, 4.6], color: '#8b5cf6', metrics: { energyConsumption: 4800, monthlyCost: 1110, co2Emissions: 930, efficiencyScore: 81 } },
  { id: 'building-e', name: 'Building E', position: [-14, 0, 1], size: [3.6, 5.4, 4.2], color: '#14b8a6', metrics: { energyConsumption: 2900, monthlyCost: 740, co2Emissions: 560, efficiencyScore: 91 } },
  { id: 'building-f', name: 'Building F', position: [-7.5, 0, 2.5], size: [4.2, 10.2, 3.4], color: '#0ea5e9', metrics: { energyConsumption: 6100, monthlyCost: 1460, co2Emissions: 1190, efficiencyScore: 73 } },
  { id: 'building-g', name: 'Building G', position: [8, 0, 2], size: [3.6, 7.6, 3.6], color: '#ec4899', metrics: { energyConsumption: 3600, monthlyCost: 930, co2Emissions: 700, efficiencyScore: 86 } },
  { id: 'building-h', name: 'Building H', position: [14, 0, 5], size: [4.5, 11.8, 3.2], color: '#94a3b8', metrics: { energyConsumption: 6800, monthlyCost: 1660, co2Emissions: 1320, efficiencyScore: 69 } },
  { id: 'building-i', name: 'Building I', position: [-11, 0, 9], size: [3.3, 6.8, 3.3], color: '#34d399', metrics: { energyConsumption: 3000, monthlyCost: 790, co2Emissions: 590, efficiencyScore: 88 } },
  { id: 'building-j', name: 'Building J', position: [-3, 0, 10], size: [4.8, 13, 3.8], color: '#f87171', metrics: { energyConsumption: 7200, monthlyCost: 1820, co2Emissions: 1430, efficiencyScore: 67 } },
  { id: 'building-k', name: 'Building K', position: [4.5, 0, 10], size: [3.5, 5.8, 4.8], color: '#60a5fa', metrics: { energyConsumption: 2600, monthlyCost: 690, co2Emissions: 510, efficiencyScore: 93 } },
  { id: 'building-l', name: 'Building L', position: [11, 0, 12], size: [3, 8.8, 3], color: '#a78bfa', metrics: { energyConsumption: 4100, monthlyCost: 1010, co2Emissions: 810, efficiencyScore: 84 } },
  { id: 'building-m', name: 'Building M', position: [1.5, 0, -13.5], size: [5.2, 4.8, 3.2], color: '#475569', metrics: { energyConsumption: 3400, monthlyCost: 870, co2Emissions: 670, efficiencyScore: 87 } },
]
