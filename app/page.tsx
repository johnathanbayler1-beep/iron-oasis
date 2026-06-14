import { AccessKeys } from '@/components/AccessKeys';

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Hero3D canvas mounts here (Step 2). Typography layers above it. */}
      <section className="flex min-h-screen items-center justify-center">
        <h1 className="font-display text-[18vw] leading-none tracking-tight uppercase">
          Iron Oasis
        </h1>
      </section>

      <section className="px-6 py-32">
        <AccessKeys />
      </section>
    </main>
  );
}
