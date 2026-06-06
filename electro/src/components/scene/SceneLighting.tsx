import { useShadowGridStore } from '../../store/useShadowGridStore'

export function SceneLighting() {
  const viewMode = useShadowGridStore((s) => s.viewMode)
  const floorMode = useShadowGridStore((s) => s.floorMode)
  const isInterior = viewMode === 'interior' || floorMode

  return (
    <>
      <ambientLight intensity={isInterior ? 0.35 : 0.25} color="#8899bb" />
      <directionalLight
        position={[15, 25, 10]}
        intensity={isInterior ? 1.0 : 1.2}
        color="#fff5e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-10, 15, -8]} intensity={0.35} color="#6699cc" />
      <directionalLight position={[0, 8, -12]} intensity={isInterior ? 0.2 : 0.1} color="#c4d4e8" />
      <pointLight position={[0, 20, 0]} intensity={0.45} color="#38bdf8" distance={40} />
      <hemisphereLight args={['#1e3a5f', '#0a0e17', isInterior ? 0.5 : 0.4]} />
    </>
  )
}
