import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { getFloorPanelPosition } from '../../data/buildingData'
import { useClippingProps } from './CrossSectionManager'

interface FloorDistributionPanelProps {
  floorName: string
  floorYOffset: number
  energyConsumption: number
}

export function FloorDistributionPanel({
  floorName,
  floorYOffset,
  energyConsumption,
}: FloorDistributionPanelProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const clippingProps = useClippingProps()
  const position = getFloorPanelPosition(floorYOffset)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.sin(clock.elapsedTime * 2.5) * 0.15
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.6, 0.9, 0.15]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.7}
          roughness={0.3}
          emissive="#38bdf8"
          emissiveIntensity={0.3}
          {...clippingProps}
        />
      </mesh>

      {/* Status LEDs */}
      {[0.15, 0, -0.15].map((offset, i) => (
        <mesh key={i} position={[0.32, offset, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color={i === 0 ? '#34d399' : i === 1 ? '#fbbf24' : '#38bdf8'}
            emissive={i === 0 ? '#34d399' : i === 1 ? '#fbbf24' : '#38bdf8'}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      <Text
        position={[0, 0.65, 0.1]}
        fontSize={0.1}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {floorName}
      </Text>

      <Text
        position={[0, -0.55, 0.1]}
        fontSize={0.08}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
      >
        {energyConsumption} kWh
      </Text>

      <pointLight color="#38bdf8" intensity={0.3} distance={3} />
    </group>
  )
}
