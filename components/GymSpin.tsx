'use client'

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

useGLTF.setDecoderPath('/draco/')

const MODEL_URL = '/gym-space-2k.glb'

// value stack — no prices here; the Final Close reveals numbers
const BEATS = [
  {
    heading: 'IRON OASIS LITE.',
    sub: 'GET STARTED',
    perks: ['4 PRIVATE SESSIONS / MONTH', 'THE WHOLE GYM TO YOURSELF', 'SMART LOCK ENTRY'],
  },
  {
    heading: 'IRON OASIS PLUS.',
    sub: 'TRAIN MORE',
    perks: ['8 PRIVATE SESSIONS / MONTH', 'BOOK FURTHER AHEAD', 'LONGER SESSIONS'],
  },
  {
    heading: 'IRON OASIS UNLIMITED.',
    sub: 'ANYTIME ACCESS',
    perks: ['UNLIMITED SESSIONS', 'TRAIN ANY HOUR, DAY OR NIGHT', 'THE GYM, WHENEVER YOU WANT'],
  },
]

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

        // Entry: scale(1.05) blur(15px) y(40) → scale(1) blur(0) y(0)
        tl.fromTo(
          el,
          { opacity: 0, scale: 1.05, filter: 'blur(15px)', y: 40 },
          { opacity: 1, scale: 1,    filter: 'blur(0px)',  y: 0,   duration: 0.18, ease: 'power2.out', immediateRender: false },
          ps,
        )
        // Exit
        tl.fromTo(
          el,
          { opacity: 1, scale: 1,    filter: 'blur(0px)',  y: 0 },
          { opacity: 0, scale: 0.95, filter: 'blur(6px)',  y: -30, duration: 0.12, ease: 'power2.in', immediateRender: false },
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
        scrub:   1.2,
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
      {/* 300vh invisible scroll track — compressed, hands off instantly to next scene */}
      <div ref={trackRef} style={{ height: '300vh', position: 'relative', zIndex: 1 }} />

      {/* Fixed Canvas — hidden until section is active */}
      <div
        ref={canvasWrap}
        style={{ position: 'fixed', inset: 0, zIndex: 0, visibility: 'hidden' }}
      >
        {inView && (
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            performance={{ min: 0.5 }}
            camera={{ fov: 45, near: 0.1, far: 1000 }}
            gl={{ powerPreference: 'high-performance', antialias: false }}
            style={{ display: 'block', width: '100%', height: '100%' }}
            onCreated={({ gl }) => gl.setClearColor('#000000', 1)}
          >
            <ambientLight intensity={0.15} />
            <directionalLight position={[5, 8, 5]} intensity={3.0} />
            <Suspense fallback={null}>
              <Environment preset="studio">
                {/* hard overhead + side strips for specular kicks on the hardware */}
                <Lightformer intensity={5} position={[0, 6, -4]} rotation-x={Math.PI / 2} scale={[14, 2, 1]} />
                <Lightformer intensity={2.5} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 1.5, 1]} />
                <Lightformer intensity={2} position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[10, 1, 1]} color="#e8fff4" />
              </Environment>
              <SpinModel />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Fixed text layer */}
      <div
        ref={textWrap}
        style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none', visibility: 'hidden' }}
      >
        <div
          ref={parallaxEl}
          style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
        >
          {BEATS.map((beat, i) => (
            <div
              key={i}
              ref={el => { beatRefs.current[i] = el }}
              style={{
                position: 'absolute',
                left: '3rem',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0,
                willChange: 'transform, opacity, filter',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-grotesk), sans-serif',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.04em',
                  fontSize: 'clamp(3rem, 8vw, 8rem)',
                  lineHeight: 0.9,
                  color: 'white',
                  mixBlendMode: 'difference',
                }}
              >
                {beat.heading}
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-jetbrains), monospace',
                  fontWeight: 700,
                  letterSpacing: '0.3em',
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.8)',
                  marginTop: '1rem',
                  mixBlendMode: 'difference',
                }}
              >
                {beat.sub}
              </span>
              <ul style={{ listStyle: 'none', margin: '1.5rem 0 0', padding: 0 }}>
                {beat.perks.map((perk) => (
                  <li
                    key={perk}
                    style={{
                      fontFamily: 'var(--font-jetbrains), monospace',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      letterSpacing: '0.12em',
                      color: '#fff',
                      padding: '10px 0',
                      borderTop: '1px solid rgba(255,255,255,0.35)',
                      textShadow: '0 0 24px rgba(0,0,0,0.9)',
                    }}
                  >
                    + {perk}
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
