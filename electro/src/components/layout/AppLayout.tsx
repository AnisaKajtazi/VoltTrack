import { Suspense, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion } from 'framer-motion'
import { Scene } from '../scene/Scene'
import { Breadcrumbs } from '../ui/Breadcrumbs'
import { FloorPanel } from '../ui/FloorPanel'
import { RoomPanel } from '../ui/RoomPanel'
import { DevicePanel } from '../ui/DevicePanel'
import { ModeToggle, BuildingOverview } from '../ui/ModeToggle'
import { CrossSectionAnimator } from '../ui/CrossSectionAnimator'
import { buildingData } from '../../data/buildingData'
import { useAIStore, type IntelligenceTab } from '../../store/aiStore'
import { DashboardTab } from '../tabs/DashboardTab'
import { AIBrainTab } from '../tabs/AIBrainTab'
import { FutureModeTab } from '../tabs/FutureModeTab'
import { CityPanel } from '../ui/CityPanel'
import { cityBuildings } from '../../data/cityData'

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#38bdf8" wireframe />
    </mesh>
  )
}

export function AppLayout() {
  const [portfolioView, setPortfolioView] = useState<'building' | 'city'>('building')
  const [selectedCityBuildingId, setSelectedCityBuildingId] = useState('volttrack-hq')
  const activeTab = useAIStore((state) => state.activeTab)
  const aiActive = useAIStore((state) => state.aiActive)
  const optimizationApproved = useAIStore((state) => state.optimizationApproved)
  const setActiveTab = useAIStore((state) => state.setActiveTab)
  const showDigitalTwin = activeTab === 'digitalTwin'
  const showCityMode = showDigitalTwin && portfolioView === 'city'
  const selectedCityBuilding = useMemo(
    () => cityBuildings.find((building) => building.id === selectedCityBuildingId) ?? cityBuildings[0],
    [selectedCityBuildingId],
  )

  return (
    <div className="relative w-full h-full overflow-hidden">
      <CrossSectionAnimator />
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [28, 18, 28], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, localClippingEnabled: true }}
        dpr={[1, 2]}
        className="absolute inset-0"
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            cityMode={showCityMode}
            selectedCityBuildingId={selectedCityBuilding.id}
            onSelectCityBuilding={setSelectedCityBuildingId}
          />
        </Suspense>
      </Canvas>

      <IntelligenceEffects active={aiActive || optimizationApproved} optimized={optimizationApproved} />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pointer-events-auto relative z-20 flex items-start justify-between gap-4 px-6 py-4"
        >
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-sky-400">Volt</span>
              <span className="text-white">Track</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-0.5">
              Digital Twin - {buildingData.name}
            </p>
          </div>

          <div className="flex items-center gap-4 max-xl:flex-col max-xl:items-end">
            <IntelligenceTabs activeTab={activeTab} onSelect={setActiveTab} />
            {showDigitalTwin && (
              <div className="flex items-center gap-4">
                <PortfolioViewToggle view={portfolioView} onSelect={setPortfolioView} />
                {portfolioView === 'building' && (
                  <>
                    <BuildingOverview />
                    <ModeToggle />
                  </>
                )}
              </div>
            )}
          </div>
        </motion.header>

        {showDigitalTwin && (
          portfolioView === 'city' ? (
            <CityOverlay selectedBuilding={selectedCityBuilding} onSelectBuilding={setSelectedCityBuildingId} />
          ) : (
            <DigitalTwinOverlay />
          )
        )}

        <AnimatePresence mode="wait">
          {!showDigitalTwin && (
            <motion.main
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-auto absolute inset-0 z-10 bg-slate-950/45 backdrop-blur-[2px]"
            >
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'brain' && <AIBrainTab />}
              {activeTab === 'future' && <FutureModeTab />}
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DigitalTwinOverlay() {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="pointer-events-auto px-6 mt-1">
        <Breadcrumbs />
      </div>

      {/* Side panels */}
      <div className="absolute right-6 top-28 pointer-events-auto flex flex-col gap-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <FloorPanel />
        <RoomPanel />
        <DevicePanel />
      </div>

      {/* Bottom hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-6 pointer-events-none"
      >
        <div className="glass-panel rounded-xl px-4 py-2.5 text-xs text-slate-500 space-y-1">
          <p>Click windows, floors, rooms, or devices to explore</p>
          <p>Scroll to zoom - Drag to orbit - Use breadcrumbs to return to overview</p>
        </div>
      </motion.div>

      {/* Energy legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-24 left-6 pointer-events-none"
      >
        <div className="glass-panel rounded-xl px-4 py-3 text-xs space-y-1.5">
          <p className="text-slate-500 uppercase tracking-wider text-[10px] mb-2">Energy Flow</p>
          {[
            { color: '#fbbf24', label: 'Grid -> Main Panel' },
            { color: '#38bdf8', label: 'Panel -> Floor Panel' },
            { color: '#818cf8', label: 'Floor Panel -> Room' },
            { color: '#34d399', label: 'Room -> Device' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
              <span className="text-slate-400">{label}</span>
            </div>
          ))}
          <p className="text-slate-600 uppercase tracking-wider text-[10px] mt-2 mb-1">Load Level</p>
          {[
            { color: '#34d399', label: 'Normal' },
            { color: '#fbbf24', label: 'Medium' },
            { color: '#ef4444', label: 'High' },
            { color: '#a855f7', label: 'Anomaly' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
              <span className="text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  )
}

const tabs: Array<{ id: IntelligenceTab; label: string }> = [
  { id: 'digitalTwin', label: '3D Digital Twin' },
  { id: 'dashboard', label: 'Energy Intelligence Dashboard' },
  { id: 'brain', label: 'AI Building Brain' },
  { id: 'future', label: 'Predictions & Future Mode' },
]

function PortfolioViewToggle({ view, onSelect }: { view: 'building' | 'city'; onSelect: (view: 'building' | 'city') => void }) {
  return (
    <div className="glass-panel rounded-xl p-1 flex">
      {[
        { id: 'building' as const, label: 'Building View' },
        { id: 'city' as const, label: 'City Mode' },
      ].map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            view === option.id
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function CityOverlay({
  selectedBuilding,
  onSelectBuilding,
}: {
  selectedBuilding: (typeof cityBuildings)[number]
  onSelectBuilding: (buildingId: string) => void
}) {
  return (
    <>
      <div className="pointer-events-auto px-6 mt-1">
        <div className="glass-panel inline-flex items-center gap-3 rounded-xl px-4 py-2 text-xs text-slate-400">
          <span className="text-sky-300">City Mode</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>Click a building to compare portfolio costs</span>
        </div>
      </div>
      <CityPanel selectedBuilding={selectedBuilding} onSelectBuilding={onSelectBuilding} />
    </>
  )
}

function IntelligenceTabs({ activeTab, onSelect }: { activeTab: IntelligenceTab; onSelect: (tab: IntelligenceTab) => void }) {
  return (
    <nav className="glass-panel pointer-events-auto flex max-w-[min(920px,calc(100vw-2rem))] flex-wrap items-center gap-1 rounded-xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
            activeTab === tab.id
              ? 'bg-sky-300/20 text-sky-100 shadow-[0_0_18px_rgba(56,189,248,0.18)]'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

function IntelligenceEffects({ active, optimized }: { active: boolean; optimized: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`building-aura ${optimized ? 'building-aura-optimized' : ''}`} />
      <div className="nerve-line nerve-line-a" />
      <div className="nerve-line nerve-line-b" />
      <div className="nerve-line nerve-line-c" />
      <div className="problem-pulse problem-pulse-a" />
      <div className="problem-pulse problem-pulse-b" />
      <div className="efficiency-pulse efficiency-pulse-a" />
      <div className="efficiency-pulse efficiency-pulse-b" />
    </div>
  )
}
