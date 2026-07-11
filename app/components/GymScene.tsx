'use client'

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const MODEL_URL = '/gym-space-2k.glb'
const SCROLL_VH = 400

const _lookAt = new THREE.Vector3()

type WayPoint = { pos: THREE.Vector3; lookAt: THREE.Vector3 }

function Model({ waypointsRef }: { waypointsRef: { current: WayPoint[] } }) {
  const { scene } = useGLTF(MODEL_URL)
  const cloned  = useMemo(() => scene.clone(true), [scene])

  useLayoutEffect(() => {
    const box    = new THREE.Box3().setFromObject(cloned)
    const size   = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const c = center
    const s = size
    console.log('[GymScene] center:', center.toArray(), 'size:', size.toArray())
    ;(window as any).__gymBBox = { center: center.toArray(), size: size.toArray() }

    waypointsRef.current = [
      {
        pos:    new THREE.Vector3(c.x,               c.y + s.y * 0.25, c.z + s.z * 1.4),
        lookAt: c.clone(),
      },
      {
        pos:    new THREE.Vector3(c.x - s.x * 0.5,  c.y + s.y * 0.2,  c.z + s.z * 0.5),
        lookAt: c.clone(),
      },
      {
        pos:    new THREE.Vector3(c.x + s.x * 0.1,  c.y + s.y * 0.05, c.z + s.z * 0.1),
        lookAt: new THREE.Vector3(c.x, c.y + s.y * 0.15, c.z - s.z * 0.3),
      },
      {
        pos:    new THREE.Vector3(c.x + s.x * 0.45, c.y + s.y * 0.2,  c.z - s.z * 0.2),
        lookAt: c.clone(),
      },
      {
        pos:    new THREE.Vector3(c.x,               c.y + s.y * 0.5,  c.z + s.z * 0.6),
        lookAt: c.clone(),
      },
    ]
  }, [cloned, waypointsRef])

  return <primitive object={cloned} />
}

function CameraRig({
  waypointsRef,
  progressRef,
  invalidateRef,
}: {
  waypointsRef:  { current: WayPoint[] }
  progressRef:   { current: number }
  invalidateRef: { current: () => void }
}) {
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

    const idle   = Date.now() - lastChangeRef.current > 1500
    const scaled = prog * (pts.length - 1)
    const lo     = Math.floor(scaled)
    const hi     = Math.min(lo + 1, pts.length - 1)
    const t      = scaled - lo

    camera.position.lerpVectors(pts[lo].pos, pts[hi].pos, t)
    _lookAt.lerpVectors(pts[lo].lookAt, pts[hi].lookAt, t)

    if (idle) {
      const now = Date.now()
      camera.position.x += Math.sin(now * 0.0004) * 0.003
      camera.position.y += Math.cos(now * 0.0003) * 0.0015
    }

    camera.lookAt(_lookAt)

    if (idle || changed) invalidate()
  })

  return null
}

export default function GymScene({ onReady }: { onReady?: () => void }) {
  const sectionRef     = useRef<HTMLDivElement>(null)
  const progressRef    = useRef(0)
  const waypointsRef   = useRef<WayPoint[]>([])
  const invalidateRef  = useRef<() => void>(() => {})
  const readyFiredRef  = useRef(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!inView || readyFiredRef.current) return
    let raf1 = 0, raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        readyFiredRef.current = true
        onReady?.()
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [inView, onReady])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    )
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
        // scroll-driven text beats — triangle ramp: fade in to mid-window, out by end
        const beats = sectionRef.current?.querySelectorAll<HTMLElement>('[data-beat]')
        beats?.forEach((el) => {
          const [a, b] = (el.dataset.beat ?? '0,1').split(',').map(Number)
          const mid = (a + b) / 2
          const p = self.progress
          const o = p <= a || p >= b ? 0 : p < mid ? (p - a) / (mid - a) : (b - p) / (b - mid)
          el.style.opacity   = String(o)
          el.style.transform = `translateY(${(1 - o) * 24}px)`
        })
      },
    })

    return () => { st.kill() }
  }, [])

  return (
    <section ref={sectionRef} style={{ height: `${SCROLL_VH}vh`, position: 'relative' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {inView && (
          <Canvas
            frameloop="demand"
            camera={{ fov: 45, near: 0.1, far: 1000 }}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            style={{ background: '#000', display: 'block', width: '100%', height: '100%' }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault() }, false)
              gl.domElement.addEventListener('webglcontextrestored', () => {}, false)
            }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <Suspense fallback={null}>
              <Environment preset="apartment" />
              <Model waypointsRef={waypointsRef} />
              <CameraRig
                waypointsRef={waypointsRef}
                progressRef={progressRef}
                invalidateRef={invalidateRef}
              />
            </Suspense>
          </Canvas>
        )}

        {/* scroll-animated copy layered over the 3D canvas — beats on the 40% flanks */}
        {[
          { window: '0.05,0.32', side: 'left',  head: 'ONE KEY.',          body: 'Your Access Key opens a space reserved to you alone.' },
          { window: '0.38,0.62', side: 'right', head: 'NO AUDIENCE.',      body: 'Every rack and machine uncontested for the full solo window.' },
          { window: '0.68,0.95', side: 'left',  head: 'SPATIAL AUTONOMY.', body: 'A high-end premium environment that resets between sessions.' },
        ].map((beat) => (
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
              maxWidth: '34vw',
              pointerEvents: 'none',
              textAlign: beat.side as 'left' | 'right',
              zIndex: 2,
              willChange: 'opacity, transform',
            }}
          >
            <div
              style={{
                fontFamily: 'Arial, sans-serif', fontWeight: 900,
                fontSize: 'clamp(28px, 4.5vw, 64px)', lineHeight: 0.95,
                letterSpacing: '-0.02em', color: '#fff', textTransform: 'uppercase',
                textShadow: '0 0 40px rgba(0,0,0,0.8)',
              }}
            >
              {beat.head}
            </div>
            <p
              style={{
                marginTop: 12, fontFamily: 'monospace', fontSize: 12,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.65)', lineHeight: 1.6,
                textShadow: '0 0 24px rgba(0,0,0,0.9)',
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

if (typeof window !== 'undefined') {
  useGLTF.preload(MODEL_URL)
}
