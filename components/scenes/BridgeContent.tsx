'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

// module-level state — InfrastructureBridge.tsx (scroll owner) writes progress
// into this, this content component reads it each frame.
export const bridgeState = {
  progressRef: { current: 0 } as { current: number },
  invalidateRef: { current: () => {} } as { current: () => void },
}

function Phone() {
  return (
    <group name="phone" position={[-1.6, 0, 0]}>
      <mesh>
        <boxGeometry args={[1.1, 2.3, 0.09]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[0.98, 2.14]} />
        <meshStandardMaterial color="#000" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[1.02, 2.18, 0.04]} />
        <MeshTransmissionMaterial
          thickness={0.25}
          roughness={0.04}
          ior={1.5}
          chromaticAberration={0.06}
          anisotropicBlur={0.2}
          transmission={1}
        />
      </mesh>
      {[0.75, 0.35, -0.05, -0.45].map((y, i) => (
        <mesh key={i} position={[0, y, 0.052]}>
          <planeGeometry args={[0.8, 0.22]} />
          <meshStandardMaterial color="#0a0a0a" emissive="#ffffff" emissiveIntensity={i === 0 ? 1.4 : 0.25} />
        </mesh>
      ))}
    </group>
  )
}

function YaleLock() {
  return (
    <group name="yaleLock" position={[1.6, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.9, 1.9, 0.18]} />
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, 0.45, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.045, 16, 48]} />
        <meshPhysicalMaterial color="#c4c7ca" metalness={1} roughness={0.12} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, 0.45, 0.14]}>
        <circleGeometry args={[0.06, 24]} />
        <meshStandardMaterial color="#000" emissive="#ffffff" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0, -0.45, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.14, 24]} />
        <meshPhysicalMaterial color="#0f0f0f" metalness={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
    </group>
  )
}

function BridgeRig() {
  const { progressRef, invalidateRef } = bridgeState
  const { camera, invalidate } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const lastRef = useRef(-1)

  useEffect(() => {
    invalidateRef.current = invalidate
  }, [invalidate, invalidateRef])

  useFrame(() => {
    const p = progressRef.current
    if (p === lastRef.current) return
    lastRef.current = p
    camera.position.set(
      THREE.MathUtils.lerp(-1.6, 1.6, p),
      Math.sin(p * Math.PI) * 0.3,
      THREE.MathUtils.lerp(4.2, 3.4, p),
    )
    camera.lookAt(THREE.MathUtils.lerp(-1.6, 1.6, p), 0, 0)
    if (groupRef.current) groupRef.current.rotation.y = (p - 0.5) * 0.7
    invalidate()
  })

  return (
    <group ref={groupRef}>
      <Phone />
      <YaleLock />
    </group>
  )
}

export function BridgeContent() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <Suspense fallback={null}>
        <Environment preset="studio">
          <Lightformer intensity={6} position={[0, 4, -3]} rotation-x={Math.PI / 2} scale={[12, 1.5, 1]} />
          <Lightformer intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} color="#ffffff" />
          <Lightformer intensity={2.5} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 1, 1]} />
        </Environment>
        <BridgeRig />
      </Suspense>
    </>
  )
}
