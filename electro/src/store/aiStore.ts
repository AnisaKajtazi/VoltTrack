import { create } from 'zustand'
import { getCurrentEnergyModel, type BuildingInsight, type ConsumptionRow, type DeviceRanking, type EnergyMetrics } from '../ai/energyAnalyzer'
import { detectMalfunctions, type DeviceAnomaly } from '../ai/malfunctionDetector'
import {
  getScenarioLabel,
  OPTIMIZATION_REDUCTION,
  runOptimization,
  scenarioMultiplier,
  type FutureScenario,
  type OptimizationResult,
} from '../ai/optimizationEngine'
import { buildingData } from '../data/buildingData'

export type IntelligenceTab = 'digitalTwin' | 'dashboard' | 'brain' | 'future'

interface ScenarioMetrics extends EnergyMetrics {
  scenarioLabel: string
}

interface AIState {
  activeTab: IntelligenceTab
  aiActive: boolean
  isOptimized: boolean
  optimizationApproved: boolean
  optimizationFactor: number
  optimizationResult: OptimizationResult | null
  optimizationStatusMessage: string | null
  futureScenario: FutureScenario
  metrics: EnergyMetrics
  floors: ConsumptionRow[]
  rooms: ConsumptionRow[]
  devices: DeviceRanking[]
  anomalies: DeviceAnomaly[]
  insight: BuildingInsight
  scenarioMetrics: ScenarioMetrics
  setActiveTab: (tab: IntelligenceTab) => void
  setAIActive: (active: boolean) => void
  approveOptimization: () => void
  setFutureScenario: (scenario: FutureScenario) => void
  resetOptimization: () => void
}

function buildModel(optimizationFactor: number) {
  return getCurrentEnergyModel(optimizationFactor)
}

function buildScenarioMetrics(baseMetrics: EnergyMetrics, scenario: FutureScenario): ScenarioMetrics {
  const multiplier = scenarioMultiplier(scenario)
  return {
    scenarioLabel: getScenarioLabel(scenario),
    totalKw: Number((baseMetrics.totalKw * multiplier).toFixed(1)),
    costPerHour: Number((baseMetrics.costPerHour * multiplier).toFixed(2)),
    co2KgPerHour: Number((baseMetrics.co2KgPerHour * multiplier).toFixed(1)),
    activeDevices: scenario === 'optimized' ? Math.max(1, baseMetrics.activeDevices - 8) : baseMetrics.activeDevices,
    inefficiencies: scenario === 'optimized' ? Math.max(0, baseMetrics.inefficiencies - 5) : baseMetrics.inefficiencies,
  }
}

const initialModel = buildModel(0)
let optimizationAnimationFrame: number | null = null

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export const useAIStore = create<AIState>((set, get) => ({
  activeTab: 'digitalTwin',
  aiActive: false,
  isOptimized: false,
  optimizationApproved: false,
  optimizationFactor: 0,
  optimizationResult: null,
  optimizationStatusMessage: null,
  futureScenario: 'normal',
  metrics: initialModel.metrics,
  floors: initialModel.floors,
  rooms: initialModel.rooms,
  devices: initialModel.devices,
  anomalies: detectMalfunctions(buildingData),
  insight: initialModel.insight,
  scenarioMetrics: buildScenarioMetrics(initialModel.metrics, 'normal'),

  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      aiActive: tab === 'brain',
    }),

  setAIActive: (active) => set({ aiActive: active }),

  approveOptimization: () => {
    const optimizationResult = runOptimization()
    const { futureScenario, optimizationFactor } = get()
    const startFactor = optimizationFactor
    const durationMs = 1400
    const startedAt = performance.now()

    if (optimizationAnimationFrame !== null) {
      cancelAnimationFrame(optimizationAnimationFrame)
    }

    set({
      isOptimized: true,
      optimizationApproved: true,
      optimizationResult,
      optimizationStatusMessage: 'Applying optimization plan...',
    })

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs)
      const factor = startFactor + (OPTIMIZATION_REDUCTION - startFactor) * easeOutCubic(progress)
      const model = buildModel(factor)

      set({
        optimizationFactor: factor,
        metrics: model.metrics,
        floors: model.floors,
        rooms: model.rooms,
        devices: model.devices,
        anomalies: model.anomalies,
        insight: model.insight,
        scenarioMetrics: buildScenarioMetrics(model.metrics, futureScenario),
      })

      if (progress < 1) {
        optimizationAnimationFrame = requestAnimationFrame(animate)
        return
      }

      optimizationAnimationFrame = null
      set({
        optimizationFactor: OPTIMIZATION_REDUCTION,
        optimizationStatusMessage: `Optimization complete. Energy consumption reduced by ${optimizationResult.savingsPercent}%.`,
      })
    }

    optimizationAnimationFrame = requestAnimationFrame(animate)
  },

  setFutureScenario: (futureScenario) => {
    const model = buildModel(futureScenario === 'optimized' ? OPTIMIZATION_REDUCTION : get().optimizationFactor)

    set({
      futureScenario,
      scenarioMetrics: buildScenarioMetrics(model.metrics, futureScenario),
    })
  },

  resetOptimization: () => {
    const model = buildModel(0)

    if (optimizationAnimationFrame !== null) {
      cancelAnimationFrame(optimizationAnimationFrame)
      optimizationAnimationFrame = null
    }

    set({
      isOptimized: false,
      optimizationApproved: false,
      optimizationFactor: 0,
      optimizationResult: null,
      optimizationStatusMessage: null,
      metrics: model.metrics,
      floors: model.floors,
      rooms: model.rooms,
      devices: model.devices,
      anomalies: model.anomalies,
      insight: model.insight,
      scenarioMetrics: buildScenarioMetrics(model.metrics, get().futureScenario),
    })
  },
}))
