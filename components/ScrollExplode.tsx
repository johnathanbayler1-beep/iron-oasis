'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

declare global {
  interface Window { __timelines?: Record<string, gsap.core.Timeline> }
}

// ─── config ────────────────────────────────────────────────────────────────
const FRAME_COUNT    = 121         // public/frames/logo_000.webp … logo_120.webp
const frameSrc = (i: number) => `/frames/logo_${String(i).padStart(3, '0')}.webp`
const SCROLL_VH     = 150          // tightened runway — snappier scrub, no dead tail (windows are fractional, handoff stays synced)
const SCROLL_VH_MOB = 150          // mobile matches desktop
const INTRO_DUR     = 1.6          // animate-in duration in seconds
const MOBILE_BP     = 768          // px — below this we use mobile tuning

// Tagline — emerges as the logo explodes. Swap copy freely.
const TAGLINE_1 = 'PRIVATE ACCESS.'
const TAGLINE_2 = 'ZERO SHARING.'
// reveal windows in scroll-progress (0–1): [start, fullyVisible]
// widened for the 140vh scale — old windows spanned ~100vh of travel at 700vh,
// same fractions over 40vh of travel would pop instead of emerge
const T1_WINDOW: [number, number] = [0.30, 0.60]
const T2_WINDOW: [number, number] = [0.45, 0.80]
// hero overlay fades out over this scroll window (in viewport-heights scrolled)
const HERO_WINDOW: [number, number] = [0.05, 0.85]
// ───────────────────────────────────────────────────────────────────────────

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
  const framesRef  = useRef<HTMLImageElement[]>([])
  const frameRef   = useRef(0)
  const cueRef     = useRef<HTMLDivElement>(null)
  const line1Ref   = useRef<HTMLDivElement>(null)
  const line2Ref   = useRef<HTMLDivElement>(null)
  const heroRef    = useRef<HTMLDivElement>(null)
  const heroTextRef      = useRef<HTMLDivElement>(null)
  const primaryCtaRef    = useRef<HTMLButtonElement>(null)
  const secondaryCtaRef  = useRef<HTMLAnchorElement>(null)

  const handlePWADownload = () => console.log('PWA Prompt Triggered')
  const scrollLocked  = useRef(false)   // tracks whether we own the overflow lock
  const heroInRef     = useRef(false)   // hero stays hidden until the intro reveals it
  const cueGoneRef    = useRef(false)   // scroll cue fades once, on first scroll
  const scrubSTRef    = useRef<ScrollTrigger | null>(null)
  const floatTweenRef = useRef<gsap.core.Tween | null>(null)
  const lastTaglineProgressRef  = useRef<number>(-1)
  const gymPreloadFiredRef      = useRef(false)
  const [ready, setReady]       = useState(false)
  const [scrollVh, setScrollVh] = useState(SCROLL_VH)

  /* ── pick scroll length once, on mount, based on viewport width ─────── */
  useEffect(() => {
    setScrollVh(window.innerWidth < MOBILE_BP ? SCROLL_VH_MOB : SCROLL_VH)
  }, [])

  /* ── drive tagline reveal straight off scroll progress ──────────────── */
  const updateTagline = useCallback((progress: number) => {
    const l1 = line1Ref.current
    const l2 = line2Ref.current
    // taglines exit before the 3D scene takes over — no double-layered text
    const exit = 1 - ramp(progress, 0.88, 0.99)
    if (l1) {
      const o = ramp(progress, T1_WINDOW[0], T1_WINDOW[1]) * exit
      l1.style.opacity   = String(o)
      l1.style.transform = `translateY(${(1 - o) * 18}px)`
    }
    if (l2) {
      const o = ramp(progress, T2_WINDOW[0], T2_WINDOW[1]) * exit
      l2.style.opacity   = String(o)
      l2.style.transform = `translateY(${(1 - o) * 18}px)`
    }
  }, [])

  // hero fade rides raw scroll — immune to trigger ranges/kills, always correct
  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current
      if (!hero || !heroInRef.current) return
      const gone = ramp(window.scrollY / window.innerHeight, HERO_WINDOW[0], HERO_WINDOW[1])
      hero.style.opacity    = String(1 - gone)
      hero.style.transform  = `translateY(${gone * -24}px)`
      hero.style.visibility = gone > 0.98 ? 'hidden' : 'visible'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── draw a given frame index onto the canvas, cover-fit to viewport ── */
  const drawFrame = useCallback((idx: number) => {
    const canvas = canvasRef.current
    const img = framesRef.current[idx]
    if (!canvas || !img?.complete) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width, h = canvas.height
    const scale = Math.max(w / img.width, h / img.height)
    const dw = img.width * scale, dh = img.height * scale
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
  }, [])

  /* ── preload the 121-frame logo sequence, then mark ready ───────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawFrame(frameRef.current)
    }
    resize()
    window.addEventListener('resize', resize)

    let loaded = 0
    const imgs = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image()
      img.src = frameSrc(i)
      img.onload = () => {
        loaded += 1
        if (i === 0) drawFrame(0)
        if (loaded === FRAME_COUNT) setReady(true)
      }
      return img
    })
    framesRef.current = imgs

    return () => window.removeEventListener('resize', resize)
  }, [drawFrame])

  /* ── intro animate-in → hand off to scroll-scrub ───────────────────── */
  useEffect(() => {
    if (!ready) return
    gsap.registerPlugin(ScrollTrigger)

    const canvas  = canvasRef.current
    const section = sectionRef.current
    const cue     = cueRef.current
    if (!section) return

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
      scrubSTRef.current = ScrollTrigger.create({
        trigger: section,
        start:   'top top',
        end:     'bottom top',   // scrub spans the FULL 140vh section so the canvas fade lands exactly at the GymScene handoff — no trailing dead zone
        scrub:   1,   // heavier smoothing — keeps the long scrub deliberate, not snappy
        onUpdate(self) {
          if (self.progress > 0.001) fadeCue()
          // progress-driven handoff — frame sequence dissolves over the last 12% of the
          // scrub, exactly as the 3D scene (already live underneath, screen-blended)
          // takes over. No timed fade, no dead zone.
          if (!scrollLocked.current && canvas) {
            canvas.style.opacity = String(1 - ramp(self.progress, 0.88, 1))
            const idx = Math.round(ramp(self.progress, 0, 0.85) * (FRAME_COUNT - 1))
            if (idx !== frameRef.current) {
              frameRef.current = idx
              drawFrame(idx)
            }
          }
          const p = self.progress
          if (Math.abs(p - lastTaglineProgressRef.current) > 0.002) {
            lastTaglineProgressRef.current = p
            updateTagline(p)
          }
          // 0.8 of 40vh left only ~8vh of lead time before the private space canvas mounts
          if (self.progress > 0.5 && !gymPreloadFiredRef.current) {
            gymPreloadFiredRef.current = true
            onPreloadGym?.()
          }
        },
      })
    }

    // accessibility: skip the cinematic intro, go straight to scroll control
    if (reduceMotion) {
      if (canvas) gsap.set(canvas, { opacity: 1, scale: 1, filter: 'blur(0px)' })
      if (cue) gsap.set(cue, { opacity: 0.55 })
      if (heroRef.current) {
        heroInRef.current = true
        if (window.scrollY < window.innerHeight * 0.3) gsap.set(heroRef.current, { opacity: 1 })
        gsap.set([heroTextRef.current, primaryCtaRef.current, secondaryCtaRef.current], { opacity: 1 })
      }
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
      const tl = gsap.timeline()
      const _w = window as Window & { __timelines?: Record<string, gsap.core.Timeline> }
      _w.__timelines = _w.__timelines ?? {}
      _w.__timelines['scrollExplodeIntro'] = tl
      if (canvas) {
        tl.fromTo(
          canvas,
          { opacity: 0, scale: 0.86, filter: 'blur(12px)' },
          {
            opacity:  1,
            scale:    1,
            filter:   'blur(0px)',
            duration: INTRO_DUR,
            ease:     'power3.out',
            onComplete() {
              document.body.style.overflow = ''
              scrollLocked.current = false
              wireScrub()
            },
          }
        )
      } else {
        tl.call(() => {
          document.body.style.overflow = ''
          scrollLocked.current = false
          wireScrub()
        }, [], INTRO_DUR)
      }
      if (heroRef.current) {
        if (window.scrollY < window.innerHeight * 0.3) {
          // staged mount sequence: text → GET ACCESS → secondary CTA
          tl.set(heroRef.current, { opacity: 1, onComplete() { heroInRef.current = true } }, '-=0.6')
          if (heroTextRef.current) {
            tl.fromTo(
              heroTextRef.current,
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', immediateRender: false },
              '-=0.6',
            )
          }
          if (primaryCtaRef.current) {
            tl.fromTo(
              primaryCtaRef.current,
              { opacity: 0, y: 32, scale: 0.94 },
              { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', immediateRender: false },
              '-=0.35',
            )
          }
          if (secondaryCtaRef.current) {
            tl.fromTo(
              secondaryCtaRef.current,
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', immediateRender: false },
              '-=0.25',
            )
          }
        } else {
          // restored deep-scroll session — scroll ramp owns the hero, keep it hidden
          heroInRef.current = true
          gsap.set([heroTextRef.current, primaryCtaRef.current, secondaryCtaRef.current], { opacity: 1 })
        }
      }
      if (cue) {
        tl.fromTo(
          cue,
          { opacity: 0, y: 6 },
          { opacity: 0.55, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.2',
        )
      }
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
  }, [ready, updateTagline])

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
    <>
      {/* 121-frame logo sequence — position:fixed, stays pinned while the section scrolls.
          mix-blend-mode:screen drops the frame's black background out against
          the persistent SharedCanvas underneath — no flat color blocks the handoff. */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh', zIndex: 0,
          display: 'block', opacity: 0,
        }}
      />

      {/* hero overlay — CTAs live over the gateway sequence, fade out on scroll */}
      <div
        ref={heroRef}
        style={{
          position: 'fixed',
          inset: 0,
          padding: '8vh 0 16vh',
          textAlign: 'center',
          opacity: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          willChange: 'opacity, transform',
        }}
      >
        <div ref={heroTextRef} style={{
          opacity: 0, willChange: 'opacity, transform',
          padding: '48px 6vw 64px',
          // legibility scrim — dark halo lets white type read over the metallic logo below.
          // Centered on the text block (55%) and widened so lower H1 lines + subhead stay covered.
          background: 'radial-gradient(ellipse 88% 128% at 50% 55%, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.58) 48%, rgba(0,0,0,0.2) 72%, transparent 88%)',
        }}>
        <span
          style={{
            fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.4em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
            textIndent: '0.4em',
          }}
        >
          Iron Oasis — Windsor
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display), sans-serif', fontWeight: 800,
            fontSize: 'clamp(52px, 9vw, 148px)', lineHeight: 0.9,
            letterSpacing: '-0.045em', textTransform: 'uppercase', color: '#EAEAEA',
            textWrap: 'balance', margin: '16px 0 0',
          }}
        >
          Your private space. Zero sharing.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 'clamp(15px, 1.7vw, 19px)',
            fontWeight: 500, letterSpacing: '-0.01em',
            color: 'rgba(255,255,255,0.75)', margin: '18px 0 0', maxWidth: '44ch',
            marginInline: 'auto', lineHeight: 1.5,
          }}
        >
          Frictionless isolation. Park, walk up — the entire private space is yours.
        </p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', pointerEvents: 'auto', marginTop: 'auto' }}>
          <button
            ref={primaryCtaRef}
            type="button"
            onClick={handlePWADownload}
            className="io-btn io-btn--accent"
            style={{
              padding: '24px 68px', fontSize: 'clamp(18px, 2.2vw, 24px)', fontWeight: 700,
              opacity: 0, willChange: 'opacity, transform',
            }}
          >
            Download to Access
          </button>
          <a
            ref={secondaryCtaRef}
            href="/shop"
            className="io-btn"
            style={{
              padding: '22px 48px', fontSize: 'clamp(16px, 1.9vw, 20px)', textDecoration: 'none',
              opacity: 0, willChange: 'opacity, transform',
            }}
          >
            Acquire Key
          </a>
        </div>
      </div>

      {/* kinetic taglines — locked to the canvas flanks, revealed by scroll progress */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4vw',
          pointerEvents: 'none',
          fontFamily: 'monospace',
          fontWeight: 900,
          color: '#EAEAEA',
          zIndex: 2,
        }}
      >
        <div className="io-hero-headline__float" style={{ maxWidth: '26vw', textAlign: 'left' }}>
          <div
            ref={line1Ref}
            style={{
              opacity: 0,
              fontSize: 'clamp(32px, 5vw, 80px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              willChange: 'opacity, transform',
            }}
          >
            {TAGLINE_1}
          </div>
        </div>
        <div className="io-hero-headline__float" style={{ maxWidth: '26vw', textAlign: 'right' }}>
          <div
            ref={line2Ref}
            style={{
              opacity: 0,
              fontSize: 'clamp(32px, 5vw, 80px)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              textTransform: 'uppercase',
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
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'none',
          fontFamily: 'Arial, sans-serif',
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#fff',
          zIndex: 2,
        }}
      >
        <span
          style={{
            color: '#fff', fontSize: 9,
            letterSpacing: '0.35em', fontFamily: 'monospace',
            textTransform: 'uppercase', textIndent: '0.35em',
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

      {/* scroll-height ruler — ScrollTrigger target, no visual role */}
      <section
        ref={sectionRef}
        style={{ height: `${scrollVh}vh` }}
      />
    </>
  )
}
