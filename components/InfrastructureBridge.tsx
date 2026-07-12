'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const SCROLL_VH = 300

// ponytail: stylized primitives for the app + Yale Assure lock — no GLB exists
// for these; swap for real models when assets land.

function Phone() {
  return (
    <group position={[-1.6, 0, 0]}>
      {/* body */}
      <mesh>
        <boxGeometry args={[1.1, 2.3, 0.09]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.35} />
      </mesh>
      {/* screen — booking interface glow */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[0.98, 2.14]} />
        <meshStandardMaterial color="#000" emissive="#e8fff4" emissiveIntensity={0.5} />
      </mesh>
      {/* interface blocks */}
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
    <group position={[1.6, 0, 0]}>
      {/* escutcheon plate */}
      <mesh>
        <boxGeometry args={[0.9, 1.9, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" metalness={1} roughness={0.25} />
      </mesh>
      {/* keypad ring */}
      <mesh position={[0, 0.45, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.045, 16, 48]} />
        <meshStandardMaterial color="#c9a86a" metalness={1} roughness={0.2} />
      </mesh>
      {/* status LED */}
      <mesh position={[0, 0.45, 0.14]}>
        <circleGeometry args={[0.06, 24]} />
        <meshStandardMaterial color="#000" emissive="#4dffa6" emissiveIntensity={3} />
      </mesh>
      {/* thumbturn */}
      <mesh position={[0, -0.45, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.14, 24]} />
        <meshStandardMaterial color="#0f0f0f" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  )
}

function BridgeRig({
  progressRef,
  invalidateRef,
}: {
  progressRef: { current: number }
  invalidateRef: { current: () => void }
}) {
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
    // camera pans phone → lock across the scrub, dollying in slightly
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

const BEATS = [
  { window: '0.02,0.30', side: 'right', head: 'SECURE YOUR ACCESS KEY.', body: 'One key, issued to you as node operator. No commitments. No hidden fees.' },
  { window: '0.36,0.62', side: 'left',  head: 'BOOK YOUR SOLO WINDOW.',  body: 'Reserve in-app. The entire space allocated to you alone. Zero distraction.' },
  { window: '0.68,0.96', side: 'right', head: 'UNLOCK VIA YALE ASSURE.', body: 'The door answers to your key and nothing else. Strictly private node access. Pure autonomy.' },
]

export default function InfrastructureBridge() {
  const sectionRef    = useRef<HTMLDivElement>(null)
  const progressRef   = useRef(0)
  const invalidateRef = useRef<() => void>(() => {})
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.registerPlugin(ScrollTrigger)

    const st = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   0.8,
      onUpdate(self) {
        progressRef.current = self.progress
        invalidateRef.current()
        const beats = section.querySelectorAll<HTMLElement>('[data-beat]')
        beats.forEach((el) => {
          const [a, b] = (el.dataset.beat ?? '0,1').split(',').map(Number)
          const mid = (a + b) / 2
          const p = self.progress
          const o = p <= a || p >= b ? 0 : p < mid ? (p - a) / (mid - a) : (b - p) / (b - mid)
          el.style.opacity   = String(o)
          el.style.transform = `translateY(${(1 - o) * 24}px)`
        })
      },
    })

    // dynamic 3D mount shifts layout — recompute all trigger positions
    const rid = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => { cancelAnimationFrame(rid); st.kill() }
  }, [])

  return (
    <section ref={sectionRef} style={{ height: `${SCROLL_VH}vh`, position: 'relative', background: '#000' }}>
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>
        {inView && (
          <Canvas
            frameloop="demand"
            camera={{ fov: 40, near: 0.1, far: 100, position: [-1.6, 0, 4.2] }}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            style={{ background: '#000', display: 'block', width: '100%', height: '100%' }}
          >
            <ambientLight intensity={0.25} />
            <directionalLight position={[4, 6, 5]} intensity={2.2} />
            <Suspense fallback={null}>
              <Environment preset="apartment" />
              <BridgeRig progressRef={progressRef} invalidateRef={invalidateRef} />
            </Suspense>
          </Canvas>
        )}

        {BEATS.map((beat) => (
          <div
            key={beat.head}
            data-beat={beat.window}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              [beat.side]: '6%',
              transform: 'translateY(24px)',
              opacity: 0,
              maxWidth: '42vw',
              pointerEvents: 'none',
              textAlign: beat.side as 'left' | 'right',
              zIndex: 2,
              willChange: 'opacity, transform',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 900,
                fontSize: 'clamp(40px, 6.5vw, 104px)', lineHeight: 0.9,
                letterSpacing: '-0.03em', color: '#fff', textTransform: 'uppercase',
                textShadow: '0 4px 60px rgba(0,0,0,0.95), 0 0 24px rgba(0,0,0,0.9)',
              }}
            >
              {beat.head}
            </div>
            <p
              style={{
                marginTop: 20, fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 18,
                color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, fontWeight: 500,
                textShadow: '0 0 32px rgba(0,0,0,1), 0 2px 12px rgba(0,0,0,0.9)',
              }}
            >
              {beat.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
