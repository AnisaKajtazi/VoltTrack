import { Text } from '@react-three/drei'
import { BUILDING_CONSTANTS } from '../../data/buildingData'
import { useClippingProps } from './CrossSectionManager'

interface CorridorMeshProps {
  floorYOffset: number
  buildingWidth: number
  buildingDepth: number
}

export function CorridorMesh({ floorYOffset, buildingWidth, buildingDepth }: CorridorMeshProps) {
  const clippingProps = useClippingProps()
  const corridorW = BUILDING_CONSTANTS.CORRIDOR_WIDTH
  const y = floorYOffset + 0.12

  return (
    <group>
      {/* Horizontal corridor */}
      <mesh position={[0, y, 0]} receiveShadow>
        <boxGeometry args={[buildingWidth - 1, 0.06, corridorW]} />
        <meshStandardMaterial
          color="#cbd5e1"
          roughness={0.55}
          metalness={0.08}
          {...clippingProps}
        />
      </mesh>

      {/* Vertical corridor */}
      <mesh position={[0, y, 0]} receiveShadow>
        <boxGeometry args={[corridorW, 0.06, buildingDepth - 1]} />
        <meshStandardMaterial
          color="#cbd5e1"
          roughness={0.55}
          metalness={0.08}
          {...clippingProps}
        />
      </mesh>

      {/* Corridor edge lines */}
      {[
        [0, y + 0.04, corridorW / 2 + 0.02, buildingWidth - 1, 0.02, 0.02],
        [0, y + 0.04, -(corridorW / 2 + 0.02), buildingWidth - 1, 0.02, 0.02],
        [corridorW / 2 + 0.02, y + 0.04, 0, 0.02, 0.02, buildingDepth - 1],
        [-corridorW / 2 - 0.02, y + 0.04, 0, 0.02, 0.02, buildingDepth - 1],
      ].map(([x, py, pz, w, h, d], i) => (
        <mesh key={i} position={[x, py, pz]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.15}
            transparent
            opacity={0.5}
            {...clippingProps}
          />
        </mesh>
      ))}

      <Text
        position={[0, y + 0.5, 0]}
        fontSize={0.22}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#0a0e17"
      >
        CORRIDOR
      </Text>
    </group>
  )
}
