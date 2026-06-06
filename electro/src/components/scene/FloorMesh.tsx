import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Floor } from '../../types'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { useClippingProps } from './CrossSectionManager'
import { RoomMesh } from './RoomMesh'
import { CorridorMesh } from './CorridorMesh'
import { FloorDistributionPanel } from './FloorDistributionPanel'

interface FloorMeshProps {
  floor: Floor
  buildingWidth: number
  buildingDepth: number
  isSelected: boolean
  isDimmed: boolean
  showInterior: boolean
  hideExterior: boolean
}

export function FloorMesh({
  floor,
  buildingWidth,
  buildingDepth,
  isSelected,
  isDimmed,
  showInterior,
  hideExterior,
}: FloorMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const selectFloor = useShadowGridStore((s) => s.selectFloor)
  const viewMode = useShadowGridStore((s) => s.viewMode)
  const floorMode = useShadowGridStore((s) => s.floorMode)
  const clippingProps = useClippingProps()

  const y = floor.yOffset + floor.height / 2
  const opacity = isDimmed ? 0.35 : hideExterior ? 0.08 : 1
  const emissiveIntensity = isSelected ? 0.25 : hovered ? 0.12 : 0.02
  const showCorridors = floor.id === 'floor-1' && (viewMode === 'interior' || floorMode)
  const showFloorPanel = showInterior || hideExterior || floorMode

  useFrame(({ clock }) => {
    if (meshRef.current && isSelected) {
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = 0.15 + Math.sin(clock.elapsedTime * 2) * 0.08
    }
  })

  const shellColor = isSelected ? '#1e40af' : '#1e293b'

  return (
    <group>
      {/* Floor slab */}
      {!hideExterior && (
        <mesh
          ref={meshRef}
          position={[0, y, 0]}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation()
            selectFloor(floor.id)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHovered(false)
            document.body.style.cursor = 'default'
          }}
        >
          <boxGeometry args={[buildingWidth, floor.height - 0.15, buildingDepth]} />
          <meshPhysicalMaterial
            color={shellColor}
            metalness={0.4}
            roughness={0.6}
            transparent
            opacity={opacity}
            emissive={isSelected ? '#38bdf8' : '#000000'}
            emissiveIntensity={emissiveIntensity}
            {...clippingProps}
          />
        </mesh>
      )}

      {/* Floor plate line */}
      <mesh position={[0, floor.yOffset + floor.height - 0.05, 0]}>
        <boxGeometry args={[buildingWidth + 0.1, 0.06, buildingDepth + 0.1]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : '#475569'}
          emissive={isSelected ? '#38bdf8' : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : 0}
          transparent
          opacity={hideExterior ? 0.3 : 0.9}
          {...clippingProps}
        />
      </mesh>

      {/* Corridors (Floor 1 only) */}
      {showCorridors && (
        <CorridorMesh
          floorYOffset={floor.yOffset}
          buildingWidth={buildingWidth}
          buildingDepth={buildingDepth}
        />
      )}

      {/* Floor distribution panel */}
      {showFloorPanel && (
        <FloorDistributionPanel
          floorName={floor.name}
          floorYOffset={floor.yOffset}
          energyConsumption={floor.energyConsumption}
        />
      )}

      {/* Interior rooms */}
      {(showInterior || hideExterior) &&
        floor.rooms.map((room) => (
          <RoomMesh
            key={room.id}
            room={room}
            floorYOffset={floor.yOffset}
            isOnSelectedFloor={isSelected}
          />
        ))}
    </group>
  )
}
