'use client'

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Preload, Text, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const HEADLINE_BEATS: { window: [number, number]; side: 'left' | 'right'; text: string }[] = [
  { window: [0.04, 0.36], side: 'left',  text: 'ONE KEY.' },
  { window: [0.34, 0.67], side: 'right', text: 'ZERO SHARING.' },
  { window: [0.65, 0.98], side: 'left',  text: 'PURE PRIVACY.' },
]

function KineticHeadline({ window: [a, b], side, text }: { window: [number, number]; side: 'left' | 'right'; text: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef   = useRef<THREE.MeshStandardMaterial>(null)
  const _pos   = useMemo(() => new THREE.Vector3(), [])
  const _fwd   = useMemo(() => new THREE.Vector3(), [])
  const _right = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera }) => {
    const grp = groupRef.current
    if (!grp) return
    const p    = gymSceneState.progressRef.current
    const span = b - a
    const inEnd    = a + span * 0.3
    const outStart = b - span * 0.3
    const o = p <= a || p >= b ? 0
      : p < inEnd ? (p - a) / (inEnd - a)
      : p > outStart ? (b - p) / (b - outStart)
      : 1

    camera.getWorldDirection(_fwd)
    _right.crossVectors(_fwd, camera.up).normalize()
    const depth = THREE.MathUtils.lerp(10, 2.2, o)
    const xOff  = (side === 'left' ? -1 : 1) * 1.7
    _pos.copy(camera.position).addScaledVector(_fwd, depth).addScaledVector(_right, xOff)
    grp.position.copy(_pos)
    grp.quaternion.copy(camera.quaternion)
    grp.visible = o > 0.01
    if (matRef.current) matRef.current.opacity = o
  })

  return (
    <group ref={groupRef}>
      <Text
        fontSize={0.7}
        letterSpacing={-0.03}
        maxWidth={4}
        anchorX={side === 'left' ? 'left' : 'right'}
        anchorY="middle"
        textAlign={side}
      >
        {text}
        <meshStandardMaterial ref={matRef} color="#eaeaea" metalness={0.8} roughness={0.2} transparent depthWrite={false} />
      </Text>
    </group>
  )
}

useGLTF.setDecoderPath('/draco/')

const MODEL_URL = '/gym-space-2k-opt.glb'

const _lookAt = new THREE.Vector3()
const _camPos = new THREE.Vector3()

type WayPoint = { pos: THREE.Vector3; lookAt: THREE.Vector3 }

// module-level state — GymScene.tsx (scroll owner) writes progress into this,
// this content component reads it each frame. Same pattern GymSpin already used.
export const gymSceneState = {
  progressRef: { current: 0 } as { current: number },
  invalidateRef: { current: () => {} } as { current: () => void },
  waypointsRef: { current: [] as WayPoint[] },
  curveRef: { current: null as THREE.CatmullRomCurve3 | null },
  heightRef: { current: 0 } as { current: number }, // model bbox height, for reframe bias
}

function Model() {
  const { waypointsRef, curveRef, heightRef } = gymSceneState
  const { scene } = useGLTF(MODEL_URL)
  const cloned = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    const box    = new THREE.Box3().setFromObject(cloned)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const c = center
    const s = size
    heightRef.current = s.y

    waypointsRef.current = [
      { pos: new THREE.Vector3(c.x,               c.y + s.y * 0.25, c.z + s.z * 1.4),  lookAt: c.clone() },
      { pos: new THREE.Vector3(c.x - s.x * 0.5,  c.y + s.y * 0.2,  c.z + s.z * 0.5),  lookAt: c.clone() },
      { pos: new THREE.Vector3(c.x + s.x * 0.1,  c.y + s.y * 0.05, c.z + s.z * 0.1),  lookAt: new THREE.Vector3(c.x, c.y + s.y * 0.15, c.z - s.z * 0.3) },
      { pos: new THREE.Vector3(c.x + s.x * 0.45, c.y + s.y * 0.2,  c.z - s.z * 0.2),  lookAt: c.clone() },
      { pos: new THREE.Vector3(c.x,               c.y + s.y * 0.5,  c.z + s.z * 0.6),  lookAt: c.clone() },
    ]

    curveRef.current = new THREE.CatmullRomCurve3(
      waypointsRef.current.map((w) => w.pos),
      false,
      'centripetal',
    )
  }, [cloned, waypointsRef, curveRef, heightRef])

  return <primitive object={cloned} />
}

function CameraRig() {
  const { waypointsRef, curveRef, progressRef, invalidateRef } = gymSceneState
  const { camera, invalidate, size, scene } = useThree()
  const lastProgRef   = useRef(progressRef.current)
  const lastChangeRef = useRef(Date.now())

  useEffect(() => {
    invalidateRef.current = invalidate
  }, [invalidate, invalidateRef])

  // Fog belongs to GymScene only; clear it so Bridge/Spin (shared Canvas/scene) render clean.
  useEffect(() => () => { scene.fog = null }, [scene])

  useFrame(() => {
    const pts = waypointsRef.current
    if (pts.length < 2) return

    const prog    = progressRef.current
    const changed = prog !== lastProgRef.current
    if (changed) {
      lastProgRef.current   = prog
      lastChangeRef.current = Date.now()
    }

    const idle  = Date.now() - lastChangeRef.current > 1500
    const curve = curveRef.current
    if (!curve) return

    const p = prog
    const eased = p < 0.5
      ? 8 * p * p * p * p
      : 1 - Math.pow(-2 * p + 2, 4) / 2

    curve.getPoint(eased, _camPos)
    camera.position.copy(_camPos)

    const scaled = eased * (pts.length - 1)
    const lo     = Math.floor(scaled)
    const hi     = Math.min(lo + 1, pts.length - 1)
    const t      = scaled - lo
    _lookAt.lerpVectors(pts[lo].lookAt, pts[hi].lookAt, t)

    // Reframe: the scan is floor-dominant and open above, so at these waypoints
    // the geometry is a sliver with void filling the top. Dolly the camera
    // toward its target so the model fills the frame and the void crops off the
    // edges, then tilt the look-target down so what void remains bleeds off the
    // top. Portrait (more vertical void) pulls tighter than landscape.
    // ponytail: dolly + bias are the tuning knobs — nudge if void returns or the
    // scan reads too close on real devices.
    const aspect = size.width / Math.max(size.height, 1)
    const dolly  = THREE.MathUtils.clamp(0.74 - (1 - aspect) * 0.12, 0.55, 0.82)
    const bias   = THREE.MathUtils.clamp(0.62 - (aspect - 1) * 0.12, 0.4, 0.62)
    camera.position.sub(_lookAt).multiplyScalar(dolly).add(_lookAt)
    _lookAt.y -= gymSceneState.heightRef.current * bias

    if (idle) {
      const now = Date.now()
      camera.position.x += Math.sin(now * 0.0004) * 0.0008
      camera.position.y += Math.cos(now * 0.0003) * 0.0004
    }

    camera.lookAt(_lookAt)

    // Environment lights but draws no background, so the scan's finite far edge
    // meets a hard black void seam. Dense exponential black fog (matches #000 bg)
    // dissolves the finite mesh edges into a cinematic void. Distance-relative —
    // model is raw GLB scale, so density tracks camera distance: subject stays
    // crisp, far floor fades to black. ponytail: 0.5 is the density knob.
    const d = camera.position.distanceTo(_lookAt)
    const density = 0.5 / Math.max(d, 0.001)
    if (scene.fog instanceof THREE.FogExp2) scene.fog.density = density
    else scene.fog = new THREE.FogExp2(0x000000, density)

    if (idle || changed) invalidate()
  })

  return null
}

export function GymSceneContent() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Suspense fallback={null}>
        <Environment files="/hdri/lebombo_1k.hdr" />
        <Model />
        <CameraRig />
        {HEADLINE_BEATS.map((beat) => (
          <KineticHeadline key={beat.text} {...beat} />
        ))}
        <Preload all />
      </Suspense>
    </>
  )
}

if (typeof window !== 'undefined') {
  useGLTF.preload(MODEL_URL)
}
