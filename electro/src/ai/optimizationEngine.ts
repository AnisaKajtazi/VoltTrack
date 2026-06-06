import { getCurrentEnergyModel, type EnergyMetrics } from './energyAnalyzer'

export type FutureScenario = 'normal' | 'stress' | 'optimized'

export interface OptimizationResult {
  before: EnergyMetrics
  after: EnergyMetrics
  savingsPercent: number
  actions: string[]
}

export const OPTIMIZATION_REDUCTION = 0.27

export function runOptimization(): OptimizationResult {
  const before = getCurrentEnergyModel(0).metrics
  const after = getCurrentEnergyModel(OPTIMIZATION_REDUCTION).metrics

  return {
    before,
    after,
    savingsPercent: Math.round(((before.totalKw - after.totalKw) / before.totalKw) * 100),
    actions: [
      'AC load reduced on Floor 2',
      'Lighting disabled in low-occupancy rooms',
      'Server cooling shifted to efficient cycle',
      'Energy flow throttled across noncritical devices',
    ],
  }
}

export function scenarioToOptimizationFactor(scenario: FutureScenario): number {
  if (scenario === 'optimized') return OPTIMIZATION_REDUCTION
  return 0
}

export function scenarioMultiplier(scenario: FutureScenario): number {
  if (scenario === 'stress') return 1.4
  if (scenario === 'optimized') return 1 - OPTIMIZATION_REDUCTION
  return 1
}

export function getScenarioLabel(scenario: FutureScenario): string {
  if (scenario === 'stress') return 'High Demand'
  if (scenario === 'optimized') return 'Optimized AI Mode'
  return 'Normal'
}
