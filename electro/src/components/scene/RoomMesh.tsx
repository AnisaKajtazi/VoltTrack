import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Room } from '../../types'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { useClippingProps } from './CrossSectionManager'
import { DeviceMesh } from './DeviceMesh'
import { OfficeFurniture } from './OfficeFurniture'

interface RoomMeshProps {
  room: Room
  floorYOffset: number
  isOnSelectedFloor: boolean
}

type Quadrant = 'nw' | 'ne' | 'sw' | 'se' | 'other'

function getQuadrant(room: Room): Quadrant {
  const [x, , z] = room.position
  if (x < 0 && z > 0) return 'nw'
  if (x > 0 && z > 0) return 'ne'
  if (x < 0 && z < 0) return 'sw'
  if (x > 0 && z < 0) return 'se'
  return 'other'
}

function WallSegment({
  position,
  size,
  opacity,
  clippingProps,
}: {
  position: [number, number, number]
  size: [number, number, number]
  opacity: number
  clippingProps: Record<string, unknown>
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color="#94a3b8"
        transparent
        opacity={opacity}
        roughness={0.15}
        metalness={0.05}
        transmission={0.35}
        thickness={0.1}
        {...clippingProps}
      />
    </mesh>
  )
}

function WallWithDoor({
  axis,
  size,
  center,
  hasDoor,
  wallOpacity,
  clippingProps,
}: {
  axis: 'x' | 'z'
  size: [number, number, number]
  center: [number, number, number]
  hasDoor: boolean
  wallOpacity: number
  clippingProps: Record<string, unknown>
}) {
  const doorW = 1.0
  const doorH = 2.2
  const [w, h, d] = size
  const doorY = center[1] - h / 2 + doorH / 2

  if (!hasDoor) {
    return (
      <WallSegment
        position={center}
        size={size}
        opacity={wallOpacity}
        clippingProps={clippingProps}
      />
    )
  }

  const span = axis === 'z' ? w : d
  const segLen = (span - doorW) / 2

  if (axis === 'z') {
    return (
      <>
        <WallSegment
          position={[center[0] - (doorW / 2 + segLen / 2), doorY, center[2]]}
          size={[segLen, doorH, d]}
          opacity={wallOpacity}
          clippingProps={clippingProps}
        />
        <WallSegment
          position={[center[0] + (doorW / 2 + segLen / 2), doorY, center[2]]}
          size={[segLen, doorH, d]}
          opacity={wallOpacity}
          clippingProps={clippingProps}
        />
        <WallSegment
          position={[center[0], center[1] + (h - doorH) / 2 - h / 2 + doorH / 2, center[2]]}
          size={[doorW, h - doorH, d]}
          opacity={wallOpacity}
          clippingProps={clippingProps}
        />
      </>
    )
  }

  return (
    <>
      <WallSegment
        position={[center[0], doorY, center[2] - (doorW / 2 + segLen / 2)]}
        size={[w, doorH, segLen]}
        opacity={wallOpacity}
        clippingProps={clippingProps}
      />
      <WallSegment
        position={[center[0], doorY, center[2] + (doorW / 2 + segLen / 2)]}
        size={[w, doorH, segLen]}
        opacity={wallOpacity}
        clippingProps={clippingProps}
      />
      <WallSegment
        position={[center[0], center[1] + (h - doorH) / 2 - h / 2 + doorH / 2, center[2]]}
        size={[w, h - doorH, doorW]}
        opacity={wallOpacity}
        clippingProps={clippingProps}
      />
    </>
  )
}

function InteriorWalls({
  width,
  depth,
  height,
  quadrant,
  wallOpacity,
  clippingProps,
}: {
  width: number
  depth: number
  height: number
  quadrant: Quadrant
  wallOpacity: number
  clippingProps: Record<string, unknown>
}) {
  const corridorEast = quadrant === 'nw' || quadrant === 'sw'
  const corridorWest = quadrant === 'ne' || quadrant === 'se'
  const corridorSouth = quadrant === 'nw' || quadrant === 'ne'
  const corridorNorth = quadrant === 'sw' || quadrant === 'se'

  return (
    <>
      <WallWithDoor
        axis="z"
        size={[width, height, 0.06]}
        center={[0, 0, depth / 2 - 0.05]}
        hasDoor={corridorNorth}
        wallOpacity={wallOpacity}
        clippingProps={clippingProps}
      />
      <WallWithDoor
        axis="z"
        size={[width, height, 0.06]}
        center={[0, 0, -depth / 2 + 0.05]}
        hasDoor={corridorSouth}
        wallOpacity={wallOpacity}
        clippingProps={clippingProps}
      />
      <WallWithDoor
        axis="x"
        size={[0.06, height, depth]}
        center={[-width / 2 + 0.05, 0, 0]}
        hasDoor={corridorWest}
        wallOpacity={wallOpacity}
        clippingProps={clippingProps}
      />
      <WallWithDoor
        axis="x"
        size={[0.06, height, depth]}
        center={[width / 2 - 0.05, 0, 0]}
        hasDoor={corridorEast}
        wallOpacity={wallOpacity}
        clippingProps={clippingProps}
      />
    </>
  )
}

export function RoomMesh({ room, floorYOffset, isOnSelectedFloor }: RoomMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const selectedRoomId = useShadowGridStore((s) => s.selectedRoomId)
  const viewMode = useShadowGridStore((s) => s.viewMode)
  const floorMode = useShadowGridStore((s) => s.floorMode)
  const selectRoom = useShadowGridStore((s) => s.selectRoom)
  const clippingProps = useClippingProps()

  const isSelected = selectedRoomId === room.id
  const { width, depth, height } = room.dimensions
  const y = floorYOffset + height / 2 + 0.1
  const quadrant = getQuadrant(room)

  useFrame(({ clock }) => {
    if (groupRef.current && isSelected) {
      groupRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * 0.005)
    } else if (groupRef.current) {
      groupRef.current.scale.setScalar(1)
    }
  })

  const wallOpacity = viewMode === 'interior' ? 0.18 : 0.55
  const floorColor = new THREE.Color(room.color)
  const highlightIntensity = isSelected ? 0.6 : hovered ? 0.3 : 0
  const showLabel = isOnSelectedFloor || (floorMode && viewMode === 'interior')
  const showFurniture = viewMode === 'interior' || floorMode

  return (
    <group
      ref={groupRef}
      position={[room.position[0], y, room.position[2]]}
      onClick={(e) => {
        e.stopPropagation()
        selectRoom(room.id)
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
      {/* Room floor */}
      <mesh position={[0, -height / 2 + 0.05, 0]} receiveShadow>
        <boxGeometry args={[width - 0.12, 0.08, depth - 0.12]} />
        <meshStandardMaterial
          color={floorColor}
          emissive={floorColor}
          emissiveIntensity={highlightIntensity * 0.35}
          roughness={0.65}
          metalness={0.05}
          {...clippingProps}
        />
      </mesh>

      {/* Room baseboard */}
      <mesh position={[0, -height / 2 + 0.12, 0]}>
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial color="#475569" roughness={0.8} {...clippingProps} />
      </mesh>

      {/* Walls */}
      {viewMode === 'interior' && (
        <InteriorWalls
          width={width}
          depth={depth}
          height={height}
          quadrant={quadrant}
          wallOpacity={wallOpacity}
          clippingProps={clippingProps}
        />
      )}

      {/* Office furniture */}
      {showFurniture && <OfficeFurniture room={room} />}

      {/* Selection outline */}
      {(isSelected || hovered) && (
        <mesh>
          <boxGeometry args={[width + 0.12, height + 0.12, depth + 0.12]} />
          <meshBasicMaterial
            color={isSelected ? '#38bdf8' : '#64748b'}
            wireframe
            transparent
            opacity={isSelected ? 0.85 : 0.3}
          />
        </mesh>
      )}

      {/* Room label */}
      {showLabel && (
        <Text
          position={[0, height / 2 + 0.35, 0]}
          fontSize={0.38}
          color={isSelected ? '#38bdf8' : '#e2e8f0'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#0a0e17"
        >
          {room.name}
        </Text>
      )}

      {/* Devices */}
      {room.devices.map((device) => (
        <DeviceMesh
          key={device.id}
          device={device}
          roomHeight={height}
          roomId={room.id}
          isRoomSelected={isSelected}
        />
      ))}
    </group>
  )
}
