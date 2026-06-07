import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { buildingData, BUILDING_CONSTANTS } from '../../data/buildingData'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { FloorMesh } from './FloorMesh'
import { WindowMesh } from './WindowMesh'
import { RooftopLogo } from './RooftopLogo'

export function Building() {
  const viewMode = useShadowGridStore((s) => s.viewMode)
  const selectedFloorId = useShadowGridStore((s) => s.selectedFloorId)
  const floorMode = useShadowGridStore((s) => s.floorMode)
  const crossSectionEnabled = useShadowGridStore((s) => s.crossSectionEnabled)
  const showAllInterior = viewMode === 'interior' || crossSectionEnabled
  const { gl } = useThree()

  useEffect(() => {
    gl.localClippingEnabled = crossSectionEnabled
  }, [crossSectionEnabled, gl])

  const { width, depth, floors } = buildingData
  const totalHeight = BUILDING_CONSTANTS.TOTAL_HEIGHT

  return (
    <group>
      {/* Ground pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[width + 12, depth + 12]} />
        <meshStandardMaterial color="#111827" metalness={0.2} roughness={0.85} />
      </mesh>

      {/* Structural columns at corners */}
      {[
        [-width / 2 + 0.3, 0, -depth / 2 + 0.3],
        [width / 2 - 0.3, 0, -depth / 2 + 0.3],
        [-width / 2 + 0.3, 0, depth / 2 - 0.3],
        [width / 2 - 0.3, 0, depth / 2 - 0.3],
      ].map((pos, i) => (
        <mesh key={`col-${i}`} position={[pos[0], totalHeight / 2, pos[2]]} castShadow>
          <boxGeometry args={[0.4, totalHeight, 0.4]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {floors.map((floor) => (
        <FloorMesh
          key={floor.id}
          floor={floor}
          buildingWidth={width}
          buildingDepth={depth}
          isSelected={selectedFloorId === floor.id}
          isDimmed={selectedFloorId !== null && selectedFloorId !== floor.id && !showAllInterior}
          showInterior={showAllInterior || (floorMode && selectedFloorId === floor.id)}
          hideExterior={(viewMode === 'interior' || crossSectionEnabled) && (floorMode ? selectedFloorId === floor.id : showAllInterior)}
        />
      ))}

      {/* Roof */}
      {viewMode === 'exterior' && !floorMode && (
        <group position={[0, totalHeight, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width + 0.6, 0.4, depth + 0.6]} />
            <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2, 1.2, 2]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.7}
              roughness={0.3}
              emissive="#38bdf8"
              emissiveIntensity={0.15}
            />
          </mesh>
          <RooftopLogo />
        </group>
      )}

      {/* All windows */}
      {floors.flatMap((floor) =>
        floor.windows.map((win) => (
          <WindowMesh
            key={win.id}
            window={win}
            floorId={floor.id}
            hidden={floorMode && selectedFloorId === floor.id && viewMode === 'interior'}
          />
        )),
      )}
    </group>
  )
}
