import { ContactShadows, Environment, OrbitControls, Stars, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { cityBuildings, type CityBuilding } from '../../data/cityData'

interface CitySceneProps {
  selectedBuildingId: string
  onSelectBuilding: (buildingId: string) => void
}

export function CityScene({ selectedBuildingId, onSelectBuilding }: CitySceneProps) {
  return (
    <>
      <color attach="background" args={['#0a0e17']} />
      <fog attach="fog" args={['#0a0e17', 48, 90]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[18, 26, 12]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-15, 10, -12]} intensity={1.2} color="#38bdf8" />
      <Environment preset="night" />
      <Stars radius={95} depth={48} count={2400} factor={3} saturation={0.18} fade speed={0.35} />

      <CityCamera />
      <CityGround />

      {cityBuildings.map((building) => (
        <CityBuildingMesh
          key={building.id}
          building={building}
          selected={selectedBuildingId === building.id}
          onSelect={() => onSelectBuilding(building.id)}
        />
      ))}

      <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={54} blur={3} far={40} color="#0a0e17" />
    </>
  )
}

function CityCamera() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(25, 24, 28)
    camera.lookAt(0, 5, 0)
  }, [camera])

  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.08}
      minDistance={14}
      maxDistance={70}
      maxPolarAngle={Math.PI / 2 + 0.08}
      minPolarAngle={0.18}
      rotateSpeed={0.45}
      zoomSpeed={0.7}
      panSpeed={0.45}
    />
  )
}

function CityGround() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[46, 42]} />
        <meshStandardMaterial color="#111827" metalness={0.18} roughness={0.88} />
      </mesh>
      {[-14, -7, 0, 7, 14].map((x) => (
        <mesh key={`road-x-${x}`} position={[x, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.16, 38]} />
          <meshStandardMaterial color="#1f2937" emissive="#38bdf8" emissiveIntensity={0.08} />
        </mesh>
      ))}
      {[-12, -4, 4, 12].map((z) => (
        <mesh key={`road-z-${z}`} position={[0, 0.016, z]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <planeGeometry args={[0.16, 42]} />
          <meshStandardMaterial color="#1f2937" emissive="#38bdf8" emissiveIntensity={0.08} />
        </mesh>
      ))}
    </group>
  )
}

function CityBuildingMesh({ building, selected, onSelect }: { building: CityBuilding; selected: boolean; onSelect: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [width, height, depth] = building.size

  useFrame((state) => {
    if (!meshRef.current) return
    const pulse = selected ? Math.sin(state.clock.elapsedTime * 3) * 0.04 : 0
    meshRef.current.scale.setScalar(hovered ? 1.04 : 1 + pulse)
  })

  return (
    <group position={building.position}>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation()
          onSelect()
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={building.color}
          metalness={0.45}
          roughness={0.42}
          emissive={selected ? building.color : '#000000'}
          emissiveIntensity={selected ? 0.18 : hovered ? 0.08 : 0.02}
        />
      </mesh>

      <mesh position={[0, height + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 1.08, depth * 1.08]} />
        <meshStandardMaterial color={selected ? '#e0f2fe' : '#334155'} metalness={0.25} roughness={0.55} />
      </mesh>

      {Array.from({ length: Math.max(2, Math.floor(height / 2.5)) }).map((_, index) => (
        <mesh key={index} position={[0, 1.5 + index * 2.2, depth / 2 + 0.012]}>
          <planeGeometry args={[width * 0.72, 0.22]} />
          <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={selected ? 0.45 : 0.18} />
        </mesh>
      ))}

      <Text
        position={[0, height + 1, 0]}
        rotation={[-Math.PI / 5, 0, 0]}
        fontSize={0.55}
        color={selected ? '#f8fafc' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {building.name}
      </Text>
    </group>
  )
}
