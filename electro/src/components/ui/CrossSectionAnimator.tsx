import { useEffect } from 'react'
import { useShadowGridStore } from '../../store/useShadowGridStore'

export function CrossSectionAnimator() {
  const crossSectionEnabled = useShadowGridStore((s) => s.crossSectionEnabled)
  const crossSectionProgress = useShadowGridStore((s) => s.crossSectionProgress)
  const setCrossSectionProgress = useShadowGridStore((s) => s.setCrossSectionProgress)

  useEffect(() => {
    const target = crossSectionEnabled ? 1 : 0
    if (Math.abs(crossSectionProgress - target) < 0.01) {
      if (crossSectionProgress !== target) setCrossSectionProgress(target)
      return
    }

    const interval = setInterval(() => {
      const current = useShadowGridStore.getState().crossSectionProgress
      const next = crossSectionEnabled
        ? Math.min(1, current + 0.04)
        : Math.max(0, current - 0.04)
      setCrossSectionProgress(next)
    }, 16)

    return () => clearInterval(interval)
  }, [crossSectionEnabled, crossSectionProgress, setCrossSectionProgress])

  return null
}
