import LiveAvailabilityBoard from '@/components/LiveAvailabilityBoard';
import FAQSection from '@/components/FAQSection';

// The API-backed availability board. Linked from the homepage's closing CTA
// (components/v3/scenes/Scene7FinalAccess.tsx) as of 2026-09-09; still fails
// closed with a visible message until the production env vars below are set
// (see docs/AVAILABILITY_PRODUCTION_CONFIG.md).
//
// Renders fresh per request so "today" always matches the visit, not a
// build-time snapshot.
export const dynamic = 'force-dynamic';

// No real locationId exists in this repo (Firebase/location config lives in
// the Factory OS project, not here) — read it from env rather than
// hardcoding a guessed value. Until it's set, the board surfaces its own
// configuration error state instead of silently faking data.
const LOCATION_ID = process.env.NEXT_PUBLIC_DEFAULT_LOCATION_ID ?? '';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AvailabilityPage() {
  return (
    <main className="relative min-h-screen bg-black">
      <LiveAvailabilityBoard locationId={LOCATION_ID} date={todayIsoDate()} />
      <FAQSection />
    </main>
  );
}
