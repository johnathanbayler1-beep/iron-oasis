'use client'

import { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { RevealObserver } from '@/components/RevealObserver';
import { SharedCanvas, type ActiveSection } from '@/components/scenes/SharedCanvas'

const ScrollExplode = dynamic(
  () => import('../components/ScrollExplode'),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100vh', background: '#000' }} /> }
)
const InfrastructureBridge = dynamic(
  () => import('../components/InfrastructureBridge'),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '160vh', background: '#000' }} /> }
)
import GymSpin from '@/components/GymSpinLazy';
import GymScene from '@/app/components/GymSceneLazy';
import { FinalClose } from '@/components/FinalClose';
import { PeptideStore } from '@/components/PeptideStore'

const HowItWorks = dynamic(() => import('@/components/HowItWorks').then(m => m.HowItWorks), { ssr: false })
const BookingSpace = dynamic(() => import('@/app/components/BookingSpace').then(m => m.BookingSpace), { ssr: false })
const AccessInterface = dynamic(() => import('@/components/AccessInterface').then(m => m.AccessInterface), { ssr: false })
const AgentStormWidget = dynamic(() => import('@/components/AgentStormWidget').then(m => m.AgentStormWidget), { ssr: false })

export default function Home() {
  const [gymMounted, setGymMounted] = useState(false)
  const preloadGym = useCallback(() => setGymMounted(true), [])

  const [activeSection, setActiveSection] = useState<ActiveSection>('gymScene')
  const activate = useCallback((section: Exclude<ActiveSection, null>) => (active: boolean) => {
    if (active) setActiveSection(section)
  }, [])
  const onGymSceneActive = activate('gymScene')
  const onBridgeActive   = activate('bridge')
  const onSpinActive     = activate('spin')

  return (
    <main className="relative min-h-screen" style={{ backgroundColor: '#000', minHeight: '100vh', position: 'relative' }}>
      <RevealObserver />
      <AgentStormWidget />

      {/* Phase 1 — gateway hero: 121-frame logo sequence, scrub hands off to the 3D scene */}
      <ScrollExplode onPreloadGym={preloadGym} />

      {/* Single shared Canvas — swaps content by active scroll section */}
      {gymMounted && <SharedCanvas activeSection={activeSection} onSpinReady={() => {}} />}

      {gymMounted && <GymScene onActive={onGymSceneActive} />}

      {/* Phase 2 — infrastructure bridge: app interface + Yale Assure, keyed privacy narrative */}
      {gymMounted && <InfrastructureBridge onActive={onBridgeActive} />}

      {/* Phase 3 — 360 spin: Access Keys carry the value stack and pricing */}
      {gymMounted && <GymSpin onActive={onSpinActive} />}

      {/* App scheduling preview — unshared blocks managed via the Iron Oasis app */}
      <BookingSpace />

      {/* In-app smart-lock preview — encrypted key generation */}
      <AccessInterface />

      {/* Phase 4 — how it works: the process + the model, stated plainly */}
      <HowItWorks />

      {/* Phase 5 — final close: rules + CTA, no pricing */}
      <FinalClose />

      {/* Wellness peptide affiliate catalog — MakeWellness routing */}
      <PeptideStore />

    </main>
  );
}
