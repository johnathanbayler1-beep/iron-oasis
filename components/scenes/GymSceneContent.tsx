'use client'

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Preload, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

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
}

function Model() {
  const { waypointsRef, curveRef } = gymSceneState
  const { scene } = useGLTF(MODEL_URL)
  const cloned = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    const box    = new THREE.Box3().setFromObject(cloned)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const c = center
    const s = size

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
  }, [cloned, waypointsRef, curveRef])

  return <primitive object={cloned} />
}

function CameraRig() {
  const { waypointsRef, curveRef, progressRef, invalidateRef } = gymSceneState
  const { camera, invalidate } = useThree()
  const lastProgRef   = useRef(progressRef.current)
  const lastChangeRef = useRef(Date.now())

  useEffect(() => {
    invalidateRef.current = invalidate
  }, [invalidate, invalidateRef])

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

    if (idle) {
      const now = Date.now()
      camera.position.x += Math.sin(now * 0.0004) * 0.0008
      camera.position.y += Math.cos(now * 0.0003) * 0.0004
    }

    camera.lookAt(_lookAt)

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
        <Preload all />
      </Suspense>
    </>
  )
}

if (typeof window !== 'undefined') {
  useGLTF.preload(MODEL_URL)
}
