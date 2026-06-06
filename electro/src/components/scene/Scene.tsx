import { ContactShadows, Environment, Stars } from '@react-three/drei'
import { Building } from './Building'
import { EnergyFlow } from './EnergyFlow'
import { CameraController } from './CameraController'
import { CrossSectionManager } from './CrossSectionManager'
import { SceneLighting } from './SceneLighting'
import { GridConnection } from './GridConnection'

export function Scene() {
  return (
    <>
      <color attach="background" args={['#0a0e17']} />
      <fog attach="fog" args={['#0a0e17', 40, 80]} />

      <SceneLighting />
      <Environment preset="night" />
      <Stars radius={80} depth={50} count={3000} factor={3} saturation={0.2} fade speed={0.5} />

      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.55}
        scale={42}
        blur={2.8}
        far={32}
        color="#0a0e17"
      />

      <CrossSectionManager />
      <GridConnection />
      <Building />
      <EnergyFlow />
      <CameraController />
    </>
  )
}
