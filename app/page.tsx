'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { RevealObserver } from '@/components/RevealObserver';

const ScrollExplode = dynamic(
  () => import('../components/ScrollExplode'),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100vh', background: '#000' }} /> }
)
const InfrastructureBridge = dynamic(
  () => import('../components/InfrastructureBridge'),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '300vh', background: '#000' }} /> }
)
import GymSpin from '@/components/GymSpinLazy';
import GymScene from '@/app/components/GymSceneLazy';
import { HowItWorks } from '@/components/HowItWorks';
import { FinalClose } from '@/components/FinalClose';

export default function Home() {
  const [gymMounted, setGymMounted] = useState(false)
  const preloadGym = useCallback(() => setGymMounted(true), [])

  return (
    <main className="relative min-h-screen" style={{ backgroundColor: '#000', minHeight: '100vh', position: 'relative' }}>
      <RevealObserver />

      {/* Phase 1 — gateway hero: 121-frame logo sequence, scrub hands off to the 3D scene */}
      <ScrollExplode onPreloadGym={preloadGym} />

      {gymMounted && <GymScene />}

      {/* Phase 2 — infrastructure bridge: app interface + Yale Assure, keyed autonomy narrative */}
      {gymMounted && <InfrastructureBridge />}

      {/* Phase 3 — 360 spin: the value stack, no prices */}
      {gymMounted && <GymSpin />}

      {/* Phase 4 — how it works: the process + the model, stated plainly */}
      <HowItWorks />

      {/* Phase 5 — final close: the only place prices exist */}
      <FinalClose />
    </main>
  );
}
