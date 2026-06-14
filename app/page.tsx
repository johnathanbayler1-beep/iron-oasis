import ScrollExplode from '@/components/ScrollExplode';
import { AccessKeys } from '@/components/AccessKeys';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <ScrollExplode />

      <section className="px-6 py-32">
        <AccessKeys />
      </section>
    </main>
  );
}
