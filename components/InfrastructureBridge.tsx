'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

const SCROLL_VH = 190 // longer runway — each beat dwells and reads before the next (sticky-pinned, beats are fractional so pacing scales cleanly)

// ═══════════════════════════════════════════════════════════════════════
// ASSET SWAP ZONE — primitives are placeholders. Studio pipeline live:
// metalness 0.9 / roughness 0.1, studio Environment + Lightformers below.
// When GLBs land in public/models/, each component below swaps to ONE line.
// ponytail: no GLB exists yet; primitives ARE the active geometry.
// ═══════════════════════════════════════════════════════════════════════

// ┌─ INJECT: /models/smartphone.glb ──────────────────────────────────────
// │ Swap this whole <group> body for:
// │   const { scene } = useGLTF('/models/smartphone.glb')
// │   return <primitive object={scene} position={[-1.6, 0, 0]}
// │            onUpdate={(o) => o.traverse((c) => c.material &&
// │              Object.assign(c.material, { metalness: 0.9, roughness: 0.1 }))} />
// └───────────────────────────────────────────────────────────────────────
function Phone() {
  return (
    <group name="phone" position={[-1.6, 0, 0]}>
      {/* body — machined metal */}
      <mesh>
        <boxGeometry args={[1.1, 2.3, 0.09]} />
        <meshPhysicalMaterial color="#111" metalness={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      {/* screen — booking interface glow */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[0.98, 2.14]} />
        <meshStandardMaterial color="#000" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      {/* cover glass — thick dispersive slab over the screen */}
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

// ┌─ INJECT: /models/yale_lock.glb ───────────────────────────────────────
// │ Swap this whole <group> body for:
// │   const { scene } = useGLTF('/models/yale_lock.glb')
// │   return <primitive object={scene} position={[1.6, 0, 0]}
// │            onUpdate={(o) => o.traverse((c) => c.material &&
// │              Object.assign(c.material, { metalness: 0.9, roughness: 0.1 }))} />
// └───────────────────────────────────────────────────────────────────────
function YaleLock() {
  return (
    <group name="yaleLock" position={[1.6, 0, 0]}>
      {/* escutcheon plate */}
      <mesh>
        <boxGeometry args={[0.9, 1.9, 0.18]} />
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      {/* keypad ring */}
      <mesh position={[0, 0.45, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.045, 16, 48]} />
        <meshPhysicalMaterial color="#c4c7ca" metalness={1} roughness={0.12} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      {/* status LED */}
      <mesh position={[0, 0.45, 0.14]}>
        <circleGeometry args={[0.06, 24]} />
        <meshStandardMaterial color="#000" emissive="#ffffff" emissiveIntensity={3} />
      </mesh>
      {/* thumbturn */}
      <mesh position={[0, -0.45, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.14, 24]} />
        <meshPhysicalMaterial color="#0f0f0f" metalness={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.15} />
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
  { window: '0.02,0.35', side: 'right', head: 'CLAIM YOUR KEY.', body: 'Pick an Access Key in the app. Premium equipment, zero sharing, 24/7 access. No contracts, no hidden fees.' },
  { window: '0.33,0.67', side: 'left',  head: 'BOOK YOUR SESSION.',  body: 'Reserve a 1-hour block. Park on the street, walk up the property — the entire private node is yours, no one else.' },
  { window: '0.65,0.98', side: 'right', head: 'UNLOCK WITH YOUR KEY.', body: 'The Yale smart lock opens for your key alone. A frictionless, private walk-in — every time.' },
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
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
    CustomEase.create('appleOut', '0.16, 1, 0.3, 1')

    // Kowalski masked reveals — one scrub-driven timeline per beat heading
    const splits: SplitText[] = []
    const headTls = new Map<HTMLElement, gsap.core.Timeline>()
    section.querySelectorAll<HTMLElement>('[data-beat]').forEach((el) => {
      const head = el.querySelector<HTMLElement>('[data-head]')
      if (!head) return
      const split = new SplitText(head, { type: 'lines,words', mask: 'lines' })
      splits.push(split)
      const tl = gsap.timeline({ paused: true })
      tl.fromTo(split.words, { yPercent: 110 }, { yPercent: 0, stagger: 0.08, duration: 1, ease: 'appleOut' })
      headTls.set(el, tl)
    })

    const st = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   0.9,
      onUpdate(self) {
        progressRef.current = self.progress
        invalidateRef.current()
        const beats = section.querySelectorAll<HTMLElement>('[data-beat]')
        beats.forEach((el) => {
          const [a, b] = (el.dataset.beat ?? '0,1').split(',').map(Number)
          // trapezoid dwell: ramp in, HOLD centered/readable, ramp out — no flash-by
          const span = b - a
          const inEnd = a + span * 0.28
          const outStart = b - span * 0.28
          const p = self.progress
          const o = p <= a || p >= b ? 0
            : p < inEnd ? (p - a) / (inEnd - a)
            : p > outStart ? (b - p) / (b - outStart)
            : 1
          el.style.opacity   = String(o)
          el.style.transform = `translateY(${(1 - o) * 24}px)`
          // words scrub up through the line masks on entry, hold while visible
          const entry = p <= a ? 0 : Math.min(1, (p - a) / (inEnd - a))
          headTls.get(el)?.progress(entry)
        })
      },
    })

    // dynamic 3D mount shifts layout — recompute all trigger positions
    const rid = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      cancelAnimationFrame(rid)
      st.kill()
      headTls.forEach((tl) => tl.kill())
      splits.forEach((s) => s.revert())
    }
  }, [])

  return (
    <section ref={sectionRef} style={{ height: `${SCROLL_VH}vh`, position: 'relative', background: '#000' }}>
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>
        {inView && (
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            performance={{ min: 0.5 }}
            camera={{ fov: 40, near: 0.1, far: 100, position: [-1.6, 0, 4.2] }}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            style={{ background: '#000', display: 'block', width: '100%', height: '100%' }}
          >
            <ambientLight intensity={0.25} />
            <directionalLight position={[4, 6, 5]} intensity={2.2} />
            <Suspense fallback={null}>
              <Environment preset="studio">
                {/* hard specular strips raking across the metal and glass */}
                <Lightformer intensity={6} position={[0, 4, -3]} rotation-x={Math.PI / 2} scale={[12, 1.5, 1]} />
                <Lightformer intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} color="#ffffff" />
                <Lightformer intensity={2.5} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 1, 1]} />
              </Environment>
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
              data-head
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
