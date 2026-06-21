import ScrollExplode from '@/components/ScrollExplode';
// GymSpin lazy-loaded via GymSpinLazy wrapper
import { RevealObserver } from '@/components/RevealObserver';
import { TheHook } from '@/components/TheHook';
import { AccessKeys } from '@/components/AccessKeys';
import { About } from '@/app/components/About';
import { FindYourWayIn } from '@/components/FindYourWayIn';
import { Expanding } from '@/components/Expanding';
import GymSpin from '@/components/GymSpinLazy';
import GymScene from '@/app/components/GymSceneLazy';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Toggles `io-hl-visible` on every reveal target as it scrolls in. */}
      <RevealObserver />

      <ScrollExplode />

      <GymSpin />

      <GymScene />

      {/* Section A — HOW IT WORKS */}
      <section className="io-editorial">
        <TheHook />
      </section>

      {/* Section B — ACCESS WINDOWS */}
      <section className="io-editorial">
        <AccessKeys />
      </section>

      <About />

      {/* Section C — FIND YOUR WAY IN */}
      <section className="io-editorial">
        <FindYourWayIn />
      </section>

      {/* Section D — EXPANDING */}
      <section className="io-editorial">
        <Expanding />
      </section>
    </main>
  );
}
