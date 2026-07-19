'use client'

import { Canvas } from '@react-three/fiber'
import { GymSceneContent } from './GymSceneContent'
import { BridgeContent } from './BridgeContent'
import { SpinContent } from './SpinContent'

export type ActiveSection = 'gymScene' | 'bridge' | 'spin' | null

export function SharedCanvas({
  activeSection,
  onSpinReady,
}: {
  activeSection: ActiveSection
  onSpinReady: () => void
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      camera={{ fov: 45, near: 0.1, far: 1000 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: 1, display: 'block', width: '100%', height: '100%', background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault() }, false)
      }}
    >
      {activeSection === 'gymScene' && <GymSceneContent />}
      {activeSection === 'bridge' && <BridgeContent />}
      {activeSection === 'spin' && <SpinContent onReady={onSpinReady} />}
    </Canvas>
  )
}
