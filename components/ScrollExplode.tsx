'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

declare global {
  interface Window { __timelines?: Record<string, gsap.core.Timeline> }
}

// ─── config ────────────────────────────────────────────────────────────────
const FRAME_COUNT   = 121          // logo_000.webp … logo_120.webp
const FRAMES_PATH   = '/frames/'   // → public/frames/
const FRAME_EXT     = 'webp'       // full-res 1200px WebP
const SCROLL_VH     = 700          // desktop scroll distance in vh (explosion speed)
const SCROLL_VH_MOB = 450          // mobile scroll distance — shorter so it's not a marathon
const INTRO_DUR     = 1.6          // animate-in duration in seconds
const MOBILE_BP     = 768          // px — below this we use mobile tuning

// Tagline — emerges as the logo explodes. Swap copy freely.
const TAGLINE_1 = 'THE WHOLE GYM.'
const TAGLINE_2 = 'JUST YOU.'
// reveal windows in scroll-progress (0–1): [start, fullyVisible]
const T1_WINDOW: [number, number] = [0.46, 0.62]
const T2_WINDOW: [number, number] = [0.56, 0.74]
// ───────────────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(3, '0')
}

// 0 below `start`, 1 at/after `end`, linear between — used to map scroll → reveal
function ramp(p: number, start: number, end: number) {
  return Math.min(1, Math.max(0, (p - start) / (end - start)))
}

interface ScrollExplodeProps {
  onPreloadGym?: () => void
}

export default function ScrollExplode({ onPreloadGym }: ScrollExplodeProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const cueRef     = useRef<HTMLDivElement>(null)
  const line1Ref   = useRef<HTMLDivElement>(null)
  const line2Ref   = useRef<HTMLDivElement>(null)
  const imagesRef  = useRef<HTMLImageElement[]>([])
  const frameRef     = useRef(0)
  const scrollLocked  = useRef(false)   // tracks whether we own the overflow lock
  const cueGoneRef    = useRef(false)   // scroll cue fades once, on first scroll
  const scrubSTRef    = useRef<ScrollTrigger | null>(null)
  const floatTweenRef = useRef<gsap.core.Tween | null>(null)
  const lastTaglineProgressRef  = useRef<number>(-1)
  const gymPreloadFiredRef      = useRef(false)
  const [loadPct, setLoadPct]   = useState(0)
  const [ready, setReady]       = useState(false)
  const [scrollVh, setScrollVh] = useState(SCROLL_VH)

  /* ── pick scroll length once, on mount, based on viewport width ─────── */
  useEffect(() => {
    setScrollVh(window.innerWidth < MOBILE_BP ? SCROLL_VH_MOB : SCROLL_VH)
  }, [])

  /* ── draw a frame to canvas (DPR-aware, letterbox-centered) ─────────── */
  const draw = useCallback((index: number) => {
    const canvas = canvasRef.current
    const img    = imagesRef.current[index]
    if (!canvas || !img?.complete) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // canvas.width/height are device pixels; math runs in that space so the
    // chrome stays sharp on retina / high-DPI screens instead of going soft.
    const cw = canvas.width
    const ch = canvas.height
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, cw, ch)
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
    const dw = img.naturalWidth  * scale
    const dh = img.naturalHeight * scale
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
  }, [])

  /* ── drive tagline reveal straight off scroll progress ──────────────── */
  const updateTagline = useCallback((progress: number) => {
    const l1 = line1Ref.current
    const l2 = line2Ref.current
    if (l1) {
      const o = ramp(progress, T1_WINDOW[0], T1_WINDOW[1])
      l1.style.opacity   = String(o)
      l1.style.transform = `translateY(${(1 - o) * 18}px)`
    }
    if (l2) {
      const o = ramp(progress, T2_WINDOW[0], T2_WINDOW[1])
      l2.style.opacity   = String(o)
      l2.style.transform = `translateY(${(1 - o) * 18}px)`
    }
  }, [])

  /* ── canvas resize (backing store = device pixels) ──────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) // cap at 1.5 (perf)
      canvas.width  = Math.round(window.innerWidth  * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      draw(frameRef.current)
      ScrollTrigger.refresh()
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [draw])

  /* ── preload all frames (decode before marking ready → no flash) ────── */
  useEffect(() => {
    let done = 0
    const imgs: HTMLImageElement[] = new Array(FRAME_COUNT)

    const tick = () => {
      done++
      if (done % 10 === 0 || done === FRAME_COUNT) {
        setLoadPct(Math.round((done / FRAME_COUNT) * 100))
      }
      if (done === FRAME_COUNT) setReady(true)
    }

    const BATCH_SIZE = 10
    const preloadFrames = async () => {
      for (let batchStart = 0; batchStart < FRAME_COUNT; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, FRAME_COUNT)
        const batchPromises: Promise<void>[] = []
        for (let i = batchStart; i < batchEnd; i++) {
          const img = new Image()
          img.src = `${FRAMES_PATH}logo_${pad(i)}.${FRAME_EXT}`
          imgs[i] = img
          batchPromises.push(
            new Promise<void>((resolve) => {
              img.onload = () => {
                ;(img.decode?.() ?? Promise.resolve())
                  .catch(() => {})
                  .finally(() => { tick(); resolve() })
              }
              img.onerror = () => { tick(); resolve() }
            })
          )
        }
        await Promise.all(batchPromises)
      }
      imagesRef.current = imgs
    }
    preloadFrames()
  }, [])

  /* ── intro animate-in → hand off to scroll-scrub ───────────────────── */
  useEffect(() => {
    if (!ready) return
    gsap.registerPlugin(ScrollTrigger)

    const canvas  = canvasRef.current
    const section = sectionRef.current
    const cue     = cueRef.current
    if (!canvas || !section) return

    draw(0)
    updateTagline(0) // tagline starts hidden

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // fade the scroll cue out the first time the user scrolls
    const fadeCue = () => {
      if (cueGoneRef.current || !cue) return
      cueGoneRef.current = true
      gsap.to(cue, { opacity: 0, duration: 0.4, ease: 'power1.out' })
    }

    const wireScrub = () => {
      ScrollTrigger.refresh()
      scrubSTRef.current = ScrollTrigger.create({
        trigger: section,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   0.3,
        onUpdate(self) {
          if (self.progress > 0.001) fadeCue()
          // round * (FRAME_COUNT - 1): maps progress 0->0 and 1.0->120 exactly.
          const idx = Math.round(self.progress * (FRAME_COUNT - 1))
          if (idx !== frameRef.current) {
            frameRef.current = idx
            draw(idx)
          }
          const p = self.progress
          if (Math.abs(p - lastTaglineProgressRef.current) > 0.002) {
            lastTaglineProgressRef.current = p
            updateTagline(p)
          }
          if (self.progress > 0.8 && !gymPreloadFiredRef.current) {
            gymPreloadFiredRef.current = true
            onPreloadGym?.()
          }
        },
      })
    }

    // accessibility: skip the cinematic intro, go straight to scroll control
    if (reduceMotion) {
      gsap.set(canvas, { opacity: 1, scale: 1, filter: 'blur(0px)' })
      if (cue) gsap.set(cue, { opacity: 0.55 })
      wireScrub()
      return () => {
        scrubSTRef.current?.kill()
        scrubSTRef.current = null
      }
    }

    // lock scroll so the intro can't be skipped mid-materialize
    document.body.style.overflow = 'hidden'
    scrollLocked.current = true

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete() {
          document.body.style.overflow = ''
          scrollLocked.current = false
          wireScrub()
          if (cue) {
            gsap.fromTo(cue,
              { opacity: 0, y: 8 },
              { opacity: 0.55, y: 0, duration: 0.7, ease: 'power2.out' }
            )
          }
        },
      })
      const _w = window as Window & { __timelines?: Record<string, gsap.core.Timeline> }
      _w.__timelines = _w.__timelines ?? {}
      _w.__timelines['scrollExplodeIntro'] = introTl
      introTl.fromTo(
        canvas,
        { opacity: 0, filter: 'blur(20px)', y: 60 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.6, ease: 'power3.out', delay: 0.3 }
      )
    })

    return () => {
      ctx.revert()
      scrubSTRef.current?.kill()
      scrubSTRef.current = null
      if (window.__timelines) delete window.__timelines['scrollExplodeIntro']
      if (scrollLocked.current) {        // always release, even if onComplete never ran
        document.body.style.overflow = ''
        scrollLocked.current = false
      }
    }
  }, [ready, draw, updateTagline])

  /* ── sine-yoyo float on .io-hero-headline__float ───────────────────── */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const floatTween = gsap.to('.io-hero-headline__float', {
      y: -12, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1,
    })
    floatTweenRef.current = floatTween
    return () => { floatTweenRef.current?.kill() }
  }, [])

  /* ── render ─────────────────────────────────────────────────────────── */
  return (
    <section
      ref={sectionRef}
      style={{ height: `${scrollVh}vh`, position: 'relative' }}
    >
      {/* preload overlay */}
      {!ready && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, background: '#000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 14, zIndex: 9999,
          }}
        >
          <div style={{ width: 180, height: 1, background: 'rgba(255,255,255,0.08)' }}>
            <div
              style={{
                width: `${loadPct}%`, height: '100%',
                background: '#fff', transition: 'width 0.25s linear',
              }}
            />
          </div>
          <span
            style={{
              color: 'rgba(255,255,255,0.2)', fontSize: 10,
              letterSpacing: '0.2em', fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}
          >
            {loadPct}%
          </span>
        </div>
      )}

      {/* sticky canvas — fills viewport, holds while the section scrolls */}
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%', opacity: 0, mixBlendMode: 'difference' }}
        />

        {/* tagline — revealed by scroll progress, emerges as the logo explodes.
            Swap font-family to your brand heading font (e.g. 'Bebas Neue'). */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '14%',
            textAlign: 'center',
            pointerEvents: 'none',
            fontFamily: "'Bebas Neue', 'Oswald', system-ui, sans-serif",
            color: '#fff',
          }}
        >
          <div className="io-hero-headline__float">
            <div
              ref={line1Ref}
              style={{
                opacity: 0,
                fontSize: 'clamp(28px, 5.5vw, 64px)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                lineHeight: 1.05,
                willChange: 'opacity, transform',
              }}
            >
              {TAGLINE_1}
            </div>
            <div
              ref={line2Ref}
              style={{
                opacity: 0,
                fontSize: 'clamp(28px, 5.5vw, 64px)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                lineHeight: 1.05,
                color: 'rgba(255,255,255,0.55)',
                willChange: 'opacity, transform',
              }}
            >
              {TAGLINE_2}
            </div>
          </div>
        </div>

        {/* scroll cue — fades in after intro, fades out on first scroll */}
        <div
          ref={cueRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              color: '#fff',
              fontSize: 9,
              letterSpacing: '0.35em',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              textIndent: '0.35em',
            }}
          >
            Scroll
          </span>
          <span className="io-scroll-line" />
          <style>{`
            .io-scroll-line {
              width: 1px;
              height: 38px;
              background: linear-gradient(to bottom, #fff, rgba(255,255,255,0));
              transform-origin: top;
              animation: ioScrollPulse 1.8s ease-in-out infinite;
            }
            @keyframes ioScrollPulse {
              0%   { transform: scaleY(0.3); opacity: 0.3; }
              50%  { transform: scaleY(1);   opacity: 1;   }
              100% { transform: scaleY(0.3); opacity: 0.3; }
            }
            @media (prefers-reduced-motion: reduce) {
              .io-scroll-line { animation: none; }
            }
          `}</style>
        </div>
      </div>
    </section>
  )
}
