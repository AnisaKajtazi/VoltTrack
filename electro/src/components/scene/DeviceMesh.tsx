import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Device } from '../../types'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { useAIStore } from '../../store/aiStore'
import { getEffectivePower } from '../../ai/energyAnalyzer'
import { getPowerFlowColor, formatWatts } from '../../utils/energyUtils'

interface DeviceMeshProps {
  device: Device
  roomHeight: number
  roomId: string
  isRoomSelected: boolean
}

const TYPE_COLORS: Record<string, string> = {
  light: '#fbbf24',
  computer: '#38bdf8',
  monitor: '#818cf8',
  hvac: '#34d399',
  charger: '#a78bfa',
  meter: '#f97316',
  appliance: '#fb923c',
  server: '#ef4444',
  outlet: '#94a3b8',
  switch: '#e2e8f0',
  printer: '#cbd5e1',
  plant: '#22c55e',
}

export function DeviceMesh({
  device,
  roomHeight,
  roomId,
  isRoomSelected,
}: DeviceMeshProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.PointLight>(null)
  const [hovered, setHovered] = useState(false)
  const selectedDeviceId = useShadowGridStore((s) => s.selectedDeviceId)
  const selectedRoomId = useShadowGridStore((s) => s.selectedRoomId)
  const selectDevice = useShadowGridStore((s) => s.selectDevice)
  const floorMode = useShadowGridStore((s) => s.floorMode)
  const viewMode = useShadowGridStore((s) => s.viewMode)
  const crossSectionEnabled = useShadowGridStore((s) => s.crossSectionEnabled)
  const optimizationFactor = useAIStore((s) => s.optimizationFactor)

  const isSelected = selectedDeviceId === device.id
  const isOn = device.status === 'on'
  const isEnergyDevice = device.type !== 'plant' && device.type !== 'switch'
  const effectivePowerUsage = getEffectivePower(device, optimizationFactor)
  const color = TYPE_COLORS[device.type] ?? '#94a3b8'
  const flowColor = getPowerFlowColor(effectivePowerUsage, isOn, device.health)
  const showInRoom = selectedRoomId === roomId

  const localPos: [number, number, number] = [
    device.position[0],
    device.position[1] - roomHeight / 2 - 0.1,
    device.position[2],
  ]

  useFrame(({ clock }) => {
    if (groupRef.current && isOn && isEnergyDevice) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.03
    }
    if (glowRef.current && isOn && isEnergyDevice) {
      glowRef.current.intensity =
        0.25 + (effectivePowerUsage / 3000) * 0.7 + Math.sin(clock.elapsedTime * 4) * 0.12
    }
  })

  const showDevice =
    floorMode || viewMode === 'interior' || crossSectionEnabled || isSelected || showInRoom

  if (!showDevice) return null

  const scale = getDeviceScale(device.type)
  const glowScale = isOn && isEnergyDevice ? 0.25 + effectivePowerUsage / 5000 : 0
  const highlightActive = isSelected || hovered || (isRoomSelected && isOn && isEnergyDevice)
  const showLabel = hovered || isSelected || (isRoomSelected && isEnergyDevice)

  return (
    <group
      ref={groupRef}
      position={localPos}
      onClick={(e) => {
        e.stopPropagation()
        selectDevice(device.id)
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
      <mesh castShadow scale={isSelected ? 1.25 : hovered ? 1.12 : 1}>
        {getDeviceGeometry(device.type, scale)}
        <meshStandardMaterial
          color={isOn ? color : '#475569'}
          emissive={isOn ? (isEnergyDevice ? flowColor : color) : '#000000'}
          emissiveIntensity={
            isOn ? (highlightActive ? 0.65 : 0.35) + effectivePowerUsage / 5000 : 0
          }
          metalness={device.type === 'monitor' ? 0.8 : 0.55}
          roughness={device.type === 'plant' ? 0.9 : 0.35}
          transparent={!isOn}
          opacity={isOn ? 1 : 0.45}
        />
      </mesh>

      {isOn && isEnergyDevice && (
        <pointLight ref={glowRef} color={flowColor} intensity={glowScale} distance={2.5} />
      )}

      {highlightActive && isEnergyDevice && (
        <mesh scale={1.35}>
          <sphereGeometry args={[scale * 0.75, 12, 12]} />
          <meshBasicMaterial
            color={flowColor}
            wireframe
            transparent
            opacity={isSelected ? 0.7 : 0.3}
          />
        </mesh>
      )}

      {showLabel && (
        <Html
          position={[0, scale * 1.8, 0]}
          center
          distanceFactor={12}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            className="glass-panel rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap"
            style={{
              borderColor: flowColor,
              boxShadow: isOn ? `0 0 12px ${flowColor}55` : 'none',
            }}
          >
            <p className="text-[11px] font-semibold text-white leading-tight">{device.name}</p>
            {isEnergyDevice && (
              <p
                className="text-[10px] font-mono mt-0.5"
                style={{ color: isOn ? flowColor : '#64748b' }}
              >
                {isOn ? formatWatts(effectivePowerUsage) : 'OFF'}
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

function getDeviceScale(type: string): number {
  switch (type) {
    case 'server':
      return 0.55
    case 'hvac':
      return 0.45
    case 'meter':
      return 0.22
    case 'light':
      return 0.12
    case 'outlet':
      return 0.08
    case 'switch':
      return 0.06
    case 'printer':
      return 0.18
    case 'plant':
      return 0.15
    case 'monitor':
      return 0.18
    case 'computer':
      return 0.16
    default:
      return 0.18
  }
}

function getDeviceGeometry(type: string, scale: number) {
  switch (type) {
    case 'light':
      return <sphereGeometry args={[scale, 12, 12]} />
    case 'computer':
      return <boxGeometry args={[scale * 1.1, scale * 0.35, scale * 0.8]} />
    case 'monitor':
      return <boxGeometry args={[scale * 1.6, scale * 1.0, scale * 0.08]} />
    case 'hvac':
      return <boxGeometry args={[scale * 2, scale * 0.8, scale * 0.5]} />
    case 'server':
      return <boxGeometry args={[scale * 0.7, scale * 2.2, scale * 1.0]} />
    case 'meter':
      return <boxGeometry args={[scale * 1.2, scale * 1.6, scale * 0.2]} />
    case 'outlet':
      return <boxGeometry args={[scale, scale * 1.2, scale * 0.3]} />
    case 'switch':
      return <boxGeometry args={[scale * 0.8, scale * 1.4, scale * 0.15]} />
    case 'printer':
      return <boxGeometry args={[scale * 1.2, scale * 0.9, scale]} />
    case 'plant':
      return <coneGeometry args={[scale, scale * 1.4, 8]} />
    default:
      return <boxGeometry args={[scale, scale * 0.7, scale * 0.6]} />
  }
}
