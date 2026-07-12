'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
// GymSpin lazy-loaded via GymSpinLazy wrapper
import { RevealObserver } from '@/components/RevealObserver';

const ScrollExplode = dynamic(
  () => import('../components/ScrollExplode'),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100vh', background: '#000' }} /> }
)
import { TheHook } from '@/components/TheHook';
import { AccessKeys } from '@/components/AccessKeys';
import { About } from '@/app/components/About';
import { FindYourWayIn } from '@/components/FindYourWayIn';
import { Expanding } from '@/components/Expanding';
import GymSpin from '@/components/GymSpinLazy';
import GymScene from '@/app/components/GymSceneLazy';
import { EditorialDescent } from '@/components/EditorialDescent';

export default function Home() {
  const [gymMounted, setGymMounted] = useState(false)
  const [gymSceneReady, setGymSceneReady] = useState(false)
  const preloadGym = useCallback(() => setGymMounted(true), [])

  return (
    <main className="relative min-h-screen" style={{ backgroundColor: '#000', minHeight: '100vh', position: 'relative' }}>
      {/* Toggles `io-hl-visible` on every reveal target as it scrolls in. */}
      <RevealObserver />

      {/* Gateway hero — 121-frame logo sequence + hero CTAs, completes before 3D handoff */}
      <ScrollExplode onPreloadGym={preloadGym} />

      {gymMounted && <GymScene onReady={() => setGymSceneReady(true)} />}

      {gymMounted && <GymSpin />}

      {/* Bottom half — continuous GSAP-scrubbed descent over a parallaxed coordinate grid */}
      <EditorialDescent>
        {/* Section A — HOW IT WORKS */}
        <section data-descent className="io-editorial">
          <TheHook />
        </section>

        {/* Section B — ACCESS KEYS */}
        <section data-descent id="access-keys" className="io-editorial">
          <AccessKeys />
        </section>

        <div data-descent>
          <About />
        </div>

        {/* Section C — FIND YOUR WAY IN */}
        <section data-descent className="io-editorial">
          <FindYourWayIn />
        </section>

        {/* Section D — EXPANDING */}
        <section data-descent className="io-editorial">
          <Expanding />
        </section>
      </EditorialDescent>
    </main>
  );
}
