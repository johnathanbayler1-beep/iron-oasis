'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, DepthOfField } from '@react-three/postprocessing'
import { useEffect, useRef } from 'react'
import { GymSceneContent } from './GymSceneContent'
import { BridgeContent } from './BridgeContent'
import { SpinContent, spinState } from './SpinContent'

export type ActiveSection = 'gymScene' | 'bridge' | 'spin' | null

// Cinematic DOF, scrubbed by spinState.focusRef (0 = hero sharp, 1 = pricing-card bokeh).
function ScrollDOF() {
  const dofRef = useRef<any>(null)
  const current = useRef(0)
  const { invalidate } = useThree()

  useFrame(() => {
    const target = spinState.focusRef.current
    const c = current.current
    const next = c + (target - c) * 0.1
    current.current = next
    if (dofRef.current) {
      dofRef.current.focusDistance = 0.02 + next * 0.4
      dofRef.current.focalLength = 0.5 - next * 0.45
      dofRef.current.bokehScale = 1 + next * 5
    }
    if (Math.abs(target - next) > 0.001) invalidate()
  })

  return (
    <EffectComposer multisampling={0}>
      <DepthOfField ref={dofRef} focusDistance={0.02} focalLength={0.5} bokehScale={1} height={480} />
    </EffectComposer>
  )
}

// frameloop="demand" only renders on invalidate(). When activeSection swaps,
// the freshly-mounted scene must be forced to draw or it shows the stale
// (black) buffer until an unrelated invalidate fires — the black dead-zones
// seen at every phase handoff. Kick a few frames to also cover async Suspense
// (Environment HDR) resolving right after the swap.
function ForceRenderOnSwap({ dep }: { dep: unknown }) {
  const { invalidate } = useThree()
  useEffect(() => {
    invalidate()
    let n = 0
    let raf = requestAnimationFrame(function tick() {
      invalidate()
      if (++n < 8) raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [dep, invalidate])
  return null
}

export function SharedCanvas({
  activeSection,
  onSpinReady,
}: {
  activeSection: ActiveSection
  onSpinReady: () => void
}) {
  // Warm the HTTP cache for the per-scene HDRIs so the first handoff into a
  // scene doesn't flash black while its Environment map downloads cold.
  useEffect(() => {
    for (const u of ['/hdri/lebombo_1k.hdr', '/hdri/studio_small_03_1k.hdr']) {
      fetch(u, { cache: 'force-cache' }).catch(() => {})
    }
  }, [])

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      camera={{ fov: 45, near: 0.1, far: 1000 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, zIndex: 1, display: 'block', width: '100%', height: '100%', background: 'transparent', pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault() }, false)
      }}
    >
      {activeSection === 'gymScene' && <GymSceneContent />}
      {activeSection === 'bridge' && <BridgeContent />}
      {activeSection === 'spin' && <SpinContent onReady={onSpinReady} />}
      <ForceRenderOnSwap dep={activeSection} />
      <ScrollDOF />
    </Canvas>
  )
}
