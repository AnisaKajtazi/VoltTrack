import { useMemo } from 'react'
import * as THREE from 'three'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { BUILDING_CONSTANTS } from '../../data/buildingData'

export function CrossSectionManager() {
  const crossSectionEnabled = useShadowGridStore((s) => s.crossSectionEnabled)
  const crossSectionProgress = useShadowGridStore((s) => s.crossSectionProgress)

  useMemo(() => {
    const clipOffset =
      BUILDING_CONSTANTS.BUILDING_DEPTH / 2 +
      2 -
      crossSectionProgress * (BUILDING_CONSTANTS.BUILDING_DEPTH + 4)

    const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), clipOffset)

    if (crossSectionEnabled) {
      ;(window as unknown as { __sgClipPlane?: THREE.Plane }).__sgClipPlane = plane
    } else {
      delete (window as unknown as { __sgClipPlane?: THREE.Plane }).__sgClipPlane
    }
  }, [crossSectionEnabled, crossSectionProgress])

  return null
}

export function getClipPlane(): THREE.Plane | null {
  return (window as unknown as { __sgClipPlane?: THREE.Plane }).__sgClipPlane ?? null
}

export function useClippingProps() {
  const crossSectionEnabled = useShadowGridStore((s) => s.crossSectionEnabled)
  const clipPlane = getClipPlane()

  return useMemo(() => {
    if (!crossSectionEnabled || !clipPlane) return {}
    return { clippingPlanes: [clipPlane] }
  }, [crossSectionEnabled, clipPlane])
}
