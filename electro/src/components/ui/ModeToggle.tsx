import { motion } from 'framer-motion'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { getTotalBuildingEnergy, getActiveDevicePower } from '../../data/buildingData'

export function ModeToggle() {
  const viewMode = useShadowGridStore((s) => s.viewMode)
  const setViewMode = useShadowGridStore((s) => s.setViewMode)
  const crossSectionEnabled = useShadowGridStore((s) => s.crossSectionEnabled)
  const toggleCrossSection = useShadowGridStore((s) => s.toggleCrossSection)
  const resetCamera = useShadowGridStore((s) => s.resetCamera)

  return (
    <div className="flex items-center gap-2">
      {/* Exterior / Interior toggle */}
      <div className="glass-panel rounded-xl p-1 flex">
        {(['exterior', 'interior'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
              viewMode === mode
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Cross section */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={toggleCrossSection}
        className={`glass-panel px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
          crossSectionEnabled
            ? 'text-amber-400 border-amber-500/30 glow-energy'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {crossSectionEnabled ? '✂️ Cross-Section ON' : 'Cross-Section'}
      </motion.button>

      {/* Reset camera */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={resetCamera}
        className="glass-panel px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        Reset Camera
      </motion.button>
    </div>
  )
}

export function BuildingOverview() {
  const navigationLevel = useShadowGridStore((s) => s.navigationLevel)

  if (navigationLevel !== 'building') return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel rounded-2xl px-5 py-3 flex items-center gap-6"
    >
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500">Total Energy</p>
        <p className="stat-value text-lg font-semibold text-amber-400">
          {getTotalBuildingEnergy()} kWh
        </p>
      </div>
      <div className="w-px h-8 bg-slate-700/50" />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500">Live Load</p>
        <p className="stat-value text-lg font-semibold text-sky-400">
          {(getActiveDevicePower() / 1000).toFixed(1)} kW
        </p>
      </div>
      <div className="w-px h-8 bg-slate-700/50" />
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500">Floors</p>
        <p className="stat-value text-lg font-semibold text-slate-200">4</p>
      </div>
    </motion.div>
  )
}
