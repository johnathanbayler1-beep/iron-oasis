'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IOReveal from '@/app/components/IOReveal';

type AccessKey = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  features: string[];
};

const KEYS: AccessKey[] = [
  {
    id: 'lite',
    name: 'Oasis Lite',
    tagline: 'The Daily Reset',
    price: 99,
    features: [
      '3 sessions every week — the room is yours, no one else in it',
      'Non-peak access — before 3PM & after 8PM, when the space is quietest',
      'Up to 12 private sessions a month',
    ],
  },
  {
    id: 'mid',
    name: 'Oasis Mid',
    tagline: 'The Routine',
    price: 135,
    features: [
      '4 sessions every week — enough to build a real rhythm',
      'Full peak-hour access — train on your schedule, not around the clock',
      'Up to 16 private sessions a month',
    ],
  },
  {
    id: 'unlimited',
    name: 'Ultimate Oasis',
    tagline: 'Total Autonomy',
    price: 179,
    features: [
      'Daily access — 7 sessions a week, every single day if you want it',
      'Every hour unlocked — no peak limits, no off-limits windows',
      'Priority booking 48 hours ahead — lock your slot before anyone else',
      'Up to 30 private sessions a month',
    ],
  },
];

// Heavy, mechanical spring — no float, no bounce drift.
const MECH = { type: 'spring' as const, stiffness: 520, damping: 38, mass: 1 };

export function AccessKeys() {
  const [open, setOpen] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <span className="io-rule block font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
        Clearance windows
      </span>

      <h2 className="io-edit-heading mt-8 font-display text-6xl uppercase leading-[0.9] tracking-tight text-white md:text-8xl">
        Choose your key.
      </h2>

      <div className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-3">
        {KEYS.map((key) => {
          const isOpen = open === key.id;
          return (
            <IOReveal key={key.id} className="flex flex-col">
            <motion.button
              type="button"
              onClick={() => setOpen(isOpen ? null : key.id)}
              aria-expanded={isOpen}
              className="io-tier group flex flex-col justify-between gap-10 text-left outline-none"
              initial={false}
            >
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
                  {key.tagline}
                </span>
                <h3 className="font-display text-4xl uppercase leading-none tracking-tight text-white">
                  {key.name}
                </h3>
              </div>

              {mounted && (
              <AnimatePresence initial={false} mode="wait">
                {isOpen ? (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={MECH}
                    className="overflow-hidden"
                  >
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-7xl leading-none text-white">
                        ${key.price}
                      </span>
                      <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                        / mo
                      </span>
                    </div>

                    <ul className="mt-6 flex flex-col gap-3 border-t border-zinc-800 pt-6">
                      {key.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex gap-3 font-mono text-[11px] uppercase leading-relaxed tracking-[0.15em] text-zinc-400"
                        >
                          <span aria-hidden className="text-zinc-600">
                            /
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <motion.span
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...MECH, delay: 0.05 }}
                      className="mt-6 inline-flex w-full items-center justify-center border border-white bg-white px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors hover:bg-black hover:text-white"
                    >
                      Secure Access
                    </motion.span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600 group-hover:text-zinc-400"
                  >
                    Reveal Key →
                  </motion.span>
                )}
              </AnimatePresence>
              )}
            </motion.button>
            </IOReveal>
          );
        })}
      </div>

      <p className="mt-8 font-mono text-[11px] leading-relaxed text-zinc-600">
        All Access Keys are subscriptions — auto-renews every 30 days, cancel
        anytime. No fees. No commitment. No refunds. Weekly bookings reset each
        cycle and expire if unused.
      </p>
    </div>
  );
}
