'use client'

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Preload, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.setDecoderPath('/draco/')

const MODEL_URL = '/gym-space-2k-opt.glb'

// module-level state — GymSpin.tsx (scroll owner) writes into this,
// this content component reads it each frame.
export const spinState = {
  rotationRef: { current: -Math.PI / 4 } as { current: number },
  invalidateRef: { current: () => {} } as { current: () => void },
}

function SpinModel({ onReady }: { onReady: () => void }) {
  const { scene } = useGLTF(MODEL_URL)
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry = mesh.geometry.clone()
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((m) => m.clone())
        : (mesh.material as THREE.Material).clone()
    })
    return clone
  }, [scene])
  const groupRef = useRef<THREE.Group>(null)
  const { camera, invalidate } = useThree()

  useEffect(() => {
    spinState.invalidateRef.current = invalidate
  }, [invalidate])

  useLayoutEffect(() => {
    const box    = new THREE.Box3().setFromObject(clonedScene)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    clonedScene.position.sub(center)

    const maxDim = Math.max(size.x, size.y, size.z)
    const persp  = camera as THREE.PerspectiveCamera
    const fov    = (persp.fov * Math.PI) / 180
    const dist   = ((maxDim / 2) / Math.tan(fov / 2)) * 0.9

    camera.position.set(0, size.y * 0.08, dist)
    camera.near = Math.max(dist / 100, 0.01)
    camera.far  = dist * 100
    camera.lookAt(0, 0, 0)
    persp.updateProjectionMatrix()
    invalidate()
    onReady()
  }, [clonedScene, camera, invalidate, onReady])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = spinState.rotationRef.current
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  )
}

export function SpinContent({ onReady }: { onReady: () => void }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={3.0} />
      <Suspense fallback={null}>
        <Environment files="/hdri/studio_small_03_1k.hdr">
          <Lightformer intensity={5} position={[0, 6, -4]} rotation-x={Math.PI / 2} scale={[14, 2, 1]} />
          <Lightformer intensity={2.5} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 1.5, 1]} />
          <Lightformer intensity={2} position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[10, 1, 1]} color="#ffffff" />
        </Environment>
        <SpinModel onReady={onReady} />
        <Preload all />
      </Suspense>
    </>
  )
}

useGLTF.preload(MODEL_URL)
