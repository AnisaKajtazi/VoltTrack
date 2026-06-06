import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls as DreiOrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { useShadowGridStore } from '../../store/useShadowGridStore'

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()

  const cameraTarget = useShadowGridStore((s) => s.cameraTarget)
  const cameraAnimating = useShadowGridStore((s) => s.cameraAnimating)
  const setCameraAnimating = useShadowGridStore((s) => s.setCameraAnimating)
  const resetCameraTrigger = useShadowGridStore((s) => s.resetCameraTrigger)

  const targetPos = useRef(new THREE.Vector3(...cameraTarget.position))
  const targetLook = useRef(new THREE.Vector3(...cameraTarget.lookAt))
  const animProgress = useRef(1)

  useEffect(() => {
    targetPos.current.set(
      cameraTarget.position[0],
      cameraTarget.position[1],
      cameraTarget.position[2],
    )
    targetLook.current.set(
      cameraTarget.lookAt[0],
      cameraTarget.lookAt[1],
      cameraTarget.lookAt[2],
    )
    animProgress.current = 0
    setCameraAnimating(true)
  }, [cameraTarget, resetCameraTrigger, setCameraAnimating])

  useFrame((_, delta) => {
    if (!controlsRef.current) return

    if (cameraAnimating && animProgress.current < 1) {
      animProgress.current = Math.min(1, animProgress.current + delta * 1.2)
      const t = easeOutCubic(animProgress.current)

      const destPos = targetPos.current
      const destLook = targetLook.current

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, destPos.x, t)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, destPos.y, t)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, destPos.z, t)

      controlsRef.current.target.x = THREE.MathUtils.lerp(
        controlsRef.current.target.x,
        destLook.x,
        t,
      )
      controlsRef.current.target.y = THREE.MathUtils.lerp(
        controlsRef.current.target.y,
        destLook.y,
        t,
      )
      controlsRef.current.target.z = THREE.MathUtils.lerp(
        controlsRef.current.target.z,
        destLook.z,
        t,
      )

      if (animProgress.current >= 1) {
        camera.position.copy(destPos)
        controlsRef.current.target.copy(destLook)
        setCameraAnimating(false)
      }
    }

    controlsRef.current.update()
  })

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={5}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2 + 0.15}
      minPolarAngle={0.1}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.6}
    />
  )
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}
