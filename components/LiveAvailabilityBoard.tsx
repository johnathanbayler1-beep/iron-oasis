'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionButton from '@/components/ui/ActionButton';
import { getAvailability, type AvailabilitySlot } from '@/lib/api/availability';

// Conversion mechanism, not a scheduler. This board never lets a visitor
// complete a booking on the website — reservations are confirmed in the
// app (see CLAUDE.md project boundary: booking/Firebase/PWA logic lives
// outside this repo). Availability is read-only, sourced entirely from the
// getAvailability Cloud Function via lib/api/availability.ts — no
// hardcoded or randomly generated slots.
//
// Copy is locked to docs/BRAND_POSITIONING_AND_COPY_RULES.md: no gym/
// fitness terminology, no generic CTAs, no pricing, no fabricated urgency.
// Scarcity comes from showing real reserved slots next to open ones, not
// from a countdown or manufactured "X people viewing" banner.

type BoardState =
  | { status: 'loading' }
  | { status: 'loaded'; slots: AvailabilitySlot[] }
  | { status: 'error'; message: string };

interface LiveAvailabilityBoardProps {
  locationId: string;
  /** ISO date (YYYY-MM-DD) to fetch availability for. */
  date: string;
}

const STATE_LABEL: Record<AvailabilitySlot['status'], string> = {
  available: 'Reserve Your Hour',
  reserved: 'Reserved',
};

/** A visitor choosing an open hour on the website — carries everything the
 * eventual PWA handoff will need, without inventing the handoff itself. */
interface ReservationIntent {
  locationId: string;
  date: string;
  startHour: number;
  /** Where the intent originated, for attribution once a real deep link exists. */
  source: 'availability';
  /** Optional plan identifier if specified. */
  plan?: string;
}

/**
 * Single choke point for "a visitor wants this slot." Routes to the external
 * PWA reservation endpoint with all required parameters for the app to pick
 * up the flow. This function is the integration boundary: everything the PWA
 * needs (locationId, date, startHour, source, optional plan) is captured and
 * encoded here.
 */
function handleReservationIntent(intent: ReservationIntent, router: ReturnType<typeof useRouter>) {
  const params = new URLSearchParams({
    locationId: intent.locationId,
    date: intent.date,
    startHour: String(intent.startHour),
    source: intent.source,
  });

  if (intent.plan) {
    params.append('plan', intent.plan);
  }

  const pwaUrl = `https://ironoasis-b33a9.web.app/join?${params.toString()}`;
  window.location.href = pwaUrl;
}

export default function LiveAvailabilityBoard({ locationId, date }: LiveAvailabilityBoardProps) {
  const router = useRouter();
  const [state, setState] = useState<BoardState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    getAvailability({ locationId, date })
      .then((slots) => {
        if (!cancelled) setState({ status: 'loaded', slots });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // Log the technical detail for debugging; never show it to a
        // visitor — a raw "NEXT_PUBLIC_AVAILABILITY_API_URL is unset" or
        // "(500)" string breaks the premium experience this board exists
        // to sell.
        console.error('getAvailability failed:', error);
        setState({ status: 'error', message: 'Availability is temporarily unavailable.' });
      });

    return () => {
      cancelled = true;
    };
  }, [locationId, date]);

  const openCount =
    state.status === 'loaded' ? state.slots.filter((s) => s.status === 'available').length : 0;

  return (
    <section className="bg-black px-6 py-24 md:px-16 md:py-32" aria-labelledby="availability-heading">
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Live Availability
        </p>
        <h2
          id="availability-heading"
          className="mt-3 font-mono text-2xl uppercase tracking-widest text-white md:text-3xl"
        >
          Today's Private Availability
        </h2>
        <p className="mt-4 max-w-xl text-[15px] font-light leading-relaxed text-zinc-300">
          Your private time, reserved around your schedule.
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-zinc-500">
          View today's available reservation windows.
        </p>

        <div className="mt-10" aria-live="polite">
          {state.status === 'loading' && <BoardSkeleton />}

          {state.status === 'error' && (
            <div role="status" className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="font-mono text-[11px] uppercase tracking-wide text-zinc-400">
                Availability isn't loading right now.
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-zinc-600">
                {state.message}
              </p>
            </div>
          )}

          {state.status === 'loaded' && state.slots.length === 0 && (
            <div role="status" className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="font-mono text-[11px] uppercase tracking-wide text-zinc-400">
                No reservation windows remain today.
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-zinc-600">
                Check back tomorrow, or reserve ahead in the app.
              </p>
            </div>
          )}

          {state.status === 'loaded' && state.slots.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {state.slots.map((slot) => {
                const isOpen = slot.status === 'available';
                return (
                  <button
                    key={slot.slotId ?? slot.startHour}
                    type="button"
                    disabled={!isOpen}
                    onClick={
                      isOpen
                        ? () =>
                            handleReservationIntent(
                              { locationId, date, startHour: slot.startHour, source: 'availability' },
                              router,
                            )
                        : undefined
                    }
                    aria-label={`${slot.time} — ${STATE_LABEL[slot.status]}`}
                    className={`group flex flex-col items-start gap-2 rounded-xl border p-4 text-left backdrop-blur-xl transition-[border-color,background-color] duration-300 ${
                      isOpen
                        ? 'cursor-pointer border-white/10 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.07]'
                        : 'cursor-default border-white/5 bg-white/[0.015] opacity-50'
                    }`}
                  >
                    <span className="font-sans text-[15px] font-medium text-white">{slot.time}</span>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-widest ${
                        isOpen
                          ? 'text-white underline decoration-white/30 underline-offset-4'
                          : 'text-zinc-500'
                      }`}
                    >
                      {STATE_LABEL[slot.status]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 border-t border-white/10 pt-10">
          <div className="w-full max-w-xs">
            <ActionButton
              variant="solid"
              disabled={state.status !== 'loaded' || openCount === 0}
              onClick={() => {
                if (state.status === 'loaded') {
                  const firstOpen = state.slots.find((s) => s.status === 'available');
                  if (firstOpen) {
                    handleReservationIntent(
                      { locationId, date, startHour: firstOpen.startHour, source: 'availability' },
                      router,
                    );
                  }
                }
              }}
            >
              Reserve Your Hour
            </ActionButton>
          </div>
          {state.status === 'loaded' && (
            <p className="font-mono text-[10px] uppercase tracking-wide text-zinc-500">
              {openCount} open {openCount === 1 ? 'window' : 'windows'} remaining today &middot;
              access by application, confirmed in the app.
            </p>
          )}
          <p className="font-mono text-[10px] uppercase tracking-wide text-zinc-600">
            No setup fees. No cancellation fees. No hidden fees.
          </p>
        </div>
      </div>
    </section>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[76px] animate-pulse rounded-xl border border-white/5 bg-white/[0.02]"
        />
      ))}
    </div>
  );
}
