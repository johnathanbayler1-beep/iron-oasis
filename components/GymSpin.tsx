'use client'

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

useGLTF.setDecoderPath('/draco/')

const MODEL_URL = '/gym-space-2k.glb'

// Access Keys — access tiers. Cards sit in the right rail, never over the model.
const BEATS = [
  {
    index: 'KEY 01',
    name: 'Oasis Lite',
    tagline: 'Your first key to the node.',
    accent: false,
    glyph: 'spark' as const,
    weight: 'light' as const,
    specs: [
      ['Access', '3 days / week'],
      ['Hours', 'Non-peak only'],
      ['Locked', '3 PM – 8 PM'],
    ],
  },
  {
    index: 'KEY 02',
    name: 'Oasis Plus',
    tagline: 'Peak hours, unlocked.',
    accent: true,
    glyph: 'node' as const,
    weight: 'chrome' as const,
    specs: [
      ['Access', '4 days / week'],
      ['Hours', 'Peak included'],
      ['Booking', 'Standard window'],
    ],
  },
  {
    index: 'KEY 03',
    name: 'Oasis Max',
    tagline: 'The whole node, any hour.',
    accent: false,
    glyph: 'diamond' as const,
    weight: 'heavy' as const,
    specs: [
      ['Access', 'Every day'],
      ['Hours', '24/7 · peak & non-peak'],
      ['Priority', '48-hour booking window'],
    ],
  },
]

const ACCENT = '#e6e6e6'

// Linear-style translucent glass. Accent key gets a brighter milled edge + glow.
// Monochrome only. backdrop-filter refracts the 3D scene behind the panel.
const GLASS_BASE: React.CSSProperties = {
  backdropFilter: 'blur(20px) saturate(110%)',
  WebkitBackdropFilter: 'blur(20px) saturate(110%)',
} as React.CSSProperties
const MATERIAL: Record<string, React.CSSProperties> = {
  light: {
    ...GLASS_BASE,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  chrome: {
    ...GLASS_BASE,
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  heavy: {
    ...GLASS_BASE,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
  },
}

// Sleek monochrome geometry — floats above the card in preserve-3d, anchors each key.
function KeyGlyph({ variant, bright }: { variant: 'spark' | 'node' | 'diamond'; bright: boolean }) {
  const s = bright ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.32)'
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 'clamp(24px, 2.6vw, 34px)',
        right: 'clamp(24px, 2.8vw, 36px)',
        width: 'clamp(30px, 3.4vw, 42px)',
        height: 'clamp(30px, 3.4vw, 42px)',
        transform: 'translateZ(40px)',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      fill="none"
      stroke={s}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {variant === 'spark' && (
        <g>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
            const r = i % 2 ? 20 : 34
            const rad = (a * Math.PI) / 180
            return <line key={a} x1={50} y1={50} x2={50 + Math.cos(rad) * r} y2={50 + Math.sin(rad) * r} />
          })}
          <circle cx={50} cy={50} r={3.5} />
        </g>
      )}
      {variant === 'node' && (
        <g>
          <line x1={50} y1={50} x2={24} y2={30} />
          <line x1={50} y1={50} x2={78} y2={36} />
          <line x1={50} y1={50} x2={52} y2={80} />
          <circle cx={50} cy={50} r={7} />
          <circle cx={24} cy={30} r={4} />
          <circle cx={78} cy={36} r={4} />
          <circle cx={52} cy={80} r={4} />
        </g>
      )}
      {variant === 'diamond' && (
        <g>
          <path d="M38 26 L62 26 L82 44 L50 86 L18 44 Z" />
          <line x1={18} y1={44} x2={82} y2={44} />
          <line x1={38} y1={26} x2={50} y2={44} />
          <line x1={62} y1={26} x2={50} y2={44} />
          <line x1={18} y1={44} x2={50} y2={86} />
          <line x1={82} y1={44} x2={50} y2={86} />
          <line x1={50} y1={44} x2={50} y2={86} />
        </g>
      )}
    </svg>
  )
}

// GSAP → R3F invalidate bridge (GymSpin is a page singleton)
let _invalidate: (() => void) | null = null

// Spin proxy — GSAP scrubs rotationY; useFrame applies it each tick
const spinProxy = { rotationY: -Math.PI / 4 }

// ─── R3F sub-tree ─────────────────────────────────────────────────────────────

function SpinModel() {
  const { scene }   = useGLTF(MODEL_URL)
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  const groupRef    = useRef<THREE.Group>(null)
  const { camera, invalidate } = useThree()

  useEffect(() => {
    _invalidate = invalidate
    return () => { _invalidate = null }
  }, [invalidate])

  useLayoutEffect(() => {
    const box    = new THREE.Box3().setFromObject(clonedScene)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    clonedScene.position.sub(center)

    const maxDim = Math.max(size.x, size.y, size.z)
    const persp  = camera as THREE.PerspectiveCamera
    const fov    = (persp.fov * Math.PI) / 180
    // 0.9 — camera pushed in tight so the model fills the frame edge to edge;
    // 1.4 left dark void borders visible around the space
    const dist   = ((maxDim / 2) / Math.tan(fov / 2)) * 0.9

    camera.position.set(0, size.y * 0.08, dist)
    camera.near = Math.max(dist / 100, 0.01)
    camera.far  = dist * 100
    camera.lookAt(0, 0, 0)
    persp.updateProjectionMatrix()
    invalidate()
  }, [clonedScene, camera, invalidate])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = spinProxy.rotationY
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GymSpin() {
  const trackRef   = useRef<HTMLDivElement>(null)
  const canvasWrap = useRef<HTMLDivElement>(null)
  const textWrap   = useRef<HTMLDivElement>(null)
  const parallaxEl = useRef<HTMLDivElement>(null)
  const beatRefs   = useRef<(HTMLDivElement | null)[]>([])

  const [inView, setInView] = useState(false)
  // latch: once mounted the GL context lives for the page lifetime. Remounting on
  // every scroll in/out churns the context and triggers "Context Lost".
  const [canvasMounted, setCanvasMounted] = useState(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => { if (inView) setCanvasMounted(true) }, [inView])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Reset proxy on each mount
      spinProxy.rotationY = -Math.PI / 4

      const tl = gsap.timeline({ paused: true })
      ;(window as any).__timelines = { ...((window as any).__timelines ?? {}), gymSpin: tl }

      // Spin arc: −π/4 → π/2 across the full 300vh scroll
      tl.to(spinProxy, { rotationY: Math.PI / 2, duration: 1, ease: 'none' }, 0)

      // Beat text — Spatial Z-Push entry + blur exit
      BEATS.forEach((beat, i) => {
        const el = beatRefs.current[i]
        if (!el) return

        const SLOT = 1 / BEATS.length                              // ~0.333 per beat
        const ps   = i * SLOT
        const exit = i < BEATS.length - 1 ? ps + SLOT * 0.65 : 0.92

        gsap.set(el, { transformPerspective: 1200 })
        // Entry: tilt up from the table — rotateY(14) scale(1.05) blur → flat
        tl.fromTo(
          el,
          { opacity: 0, scale: 1.05, filter: 'blur(15px)', y: 40, rotateY: 14, rotateX: -6 },
          { opacity: 1, scale: 1,    filter: 'blur(0px)',  y: 0,  rotateY: 0,  rotateX: 0, duration: 0.18, ease: 'power2.out', immediateRender: false },
          ps,
        )
        // Exit — tilt away
        tl.fromTo(
          el,
          { opacity: 1, scale: 1,    filter: 'blur(0px)',  y: 0,   rotateY: 0,   rotateX: 0 },
          { opacity: 0, scale: 0.95, filter: 'blur(6px)',  y: -30, rotateY: -12, rotateX: 4, duration: 0.12, ease: 'power2.in', immediateRender: false },
          exit,
        )
      })

      const show = () => {
        if (!canvasWrap.current) return
        canvasWrap.current.style.visibility = 'visible'
        if (!textWrap.current) return
        textWrap.current.style.visibility = 'visible'
        _invalidate?.()
        requestAnimationFrame(() => _invalidate?.())
      }
      const hide = () => {
        if (!canvasWrap.current) return
        canvasWrap.current.style.visibility = 'hidden'
        if (!textWrap.current) return
        textWrap.current.style.visibility = 'hidden'
      }

      if (!trackRef.current) {
        console.error('[GymSpin] scrollTrackRef is null at ScrollTrigger init — aborting context')
        return
      }

      ScrollTrigger.create({
        trigger: trackRef.current,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   1.6,
        onEnter:     show,
        onLeave:     hide,
        onEnterBack: show,
        onLeaveBack: hide,
        onUpdate(self) {
          tl.progress(self.progress)
          _invalidate?.()
          if (!parallaxEl.current) return
          // Motion Law 2: parallax written directly to DOM — no GSAP.to()
          parallaxEl.current.style.transform = `translateY(${-self.progress * 120}px)`
        },
      })

    })

    // dynamic 3D mount shifts layout — recompute trigger positions, gated so a
    // fast unmount can't fire a refresh against dead triggers
    const rid = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => { cancelAnimationFrame(rid); ctx.revert() }
  }, [])

  return (
    <>
      {/* 300vh scroll track — longer runway slows the scrub so each key reads before the next */}
      <div ref={trackRef} style={{ height: '300vh', position: 'relative', zIndex: 1 }} />

      {/* Fixed Canvas — hidden until section is active */}
      <div
        ref={canvasWrap}
        style={{ position: 'fixed', inset: 0, zIndex: 0, visibility: 'hidden', willChange: 'transform' }}
      >
        {canvasMounted && (
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            performance={{ min: 0.5 }}
            camera={{ fov: 45, near: 0.1, far: 1000 }}
            gl={{ powerPreference: 'high-performance', antialias: false }}
            style={{ display: 'block', width: '100%', height: '100%' }}
            onCreated={({ gl }) => {
              gl.setClearColor('#000000', 1)
              gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false)
            }}
          >
            <ambientLight intensity={0.15} />
            <directionalLight position={[5, 8, 5]} intensity={3.0} />
            <Suspense fallback={null}>
              <Environment preset="studio">
                {/* hard overhead + side strips for specular kicks on the hardware */}
                <Lightformer intensity={5} position={[0, 6, -4]} rotation-x={Math.PI / 2} scale={[14, 2, 1]} />
                <Lightformer intensity={2.5} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 1.5, 1]} />
                <Lightformer intensity={2} position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[10, 1, 1]} color="#ffffff" />
              </Environment>
              <SpinModel />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Fixed text layer — right rail of tactile key cards, model stays left */}
      <div
        ref={textWrap}
        style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none', visibility: 'hidden' }}
      >
        {/* right-side scrim panel — gives the split its edge, keeps cards legible */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(56vw, 900px)',
            background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.82))',
          }}
        />

        {/* section eyebrow — anchored, doesn't overlap the model */}
        <span
          style={{
            position: 'absolute', top: 'clamp(28px, 6vh, 64px)', right: 'clamp(24px, 6vw, 96px)',
            fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          }}
        >
          Access Keys
        </span>

        <div
          ref={parallaxEl}
          style={{ position: 'absolute', inset: 0, perspective: 1400, willChange: 'transform' }}
        >
          {BEATS.map((beat, i) => (
            <div
              key={i}
              ref={el => { beatRefs.current[i] = el }}
              style={{
                position: 'absolute',
                right: 'clamp(24px, 6vw, 96px)',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 'min(440px, 82vw)',
                padding: 'clamp(28px, 3vw, 40px)',
                borderRadius: 12,
                opacity: 0,
                transformStyle: 'preserve-3d',
                willChange: 'transform, opacity, filter',
                ...MATERIAL[beat.weight],
              }}
            >
              <KeyGlyph variant={beat.glyph} bright={beat.accent} />
              <span
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.22em', color: beat.accent ? ACCENT : 'rgba(255,255,255,0.55)',
                }}
              >
                {beat.index}
                {beat.accent && (
                  <span
                    style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 11, letterSpacing: '0.06em',
                      color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    Most popular
                  </span>
                )}
              </span>

              <span
                style={{
                  display: 'block', marginTop: 18,
                  fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
                  fontSize: 'clamp(2.4rem, 4vw, 3.4rem)', lineHeight: 1, letterSpacing: '-0.035em',
                  color: '#f6f8f6',
                }}
              >
                {beat.name}
              </span>
              <span
                style={{
                  display: 'block', marginTop: 10,
                  fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 400,
                  fontSize: 16, lineHeight: 1.5, color: 'rgba(255,255,255,0.62)',
                }}
              >
                {beat.tagline}
              </span>

              <ul style={{ listStyle: 'none', margin: '24px 0 0', padding: 0 }}>
                {beat.specs.map(([label, value]) => (
                  <li
                    key={label}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16,
                      padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)',
                      fontFamily: 'var(--font-grotesk), sans-serif',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.5)' }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', textAlign: 'right' }}>
                      {value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

useGLTF.preload(MODEL_URL)
