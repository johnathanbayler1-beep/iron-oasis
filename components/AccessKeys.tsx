'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type AccessKey = {
  id: string;
  name: string;
  tagline: string;
  price: number;
};

const KEYS: AccessKey[] = [
  { id: 'lite', name: 'Oasis Lite', tagline: 'The Daily Reset', price: 65 },
  { id: 'mid', name: 'Oasis Mid', tagline: 'The Routine', price: 89 },
  { id: 'unlimited', name: 'Oasis Unlimited', tagline: 'Total Autonomy', price: 109 },
];

// Heavy, mechanical spring — no float, no bounce drift.
const MECH = { type: 'spring' as const, stiffness: 520, damping: 38, mass: 1 };

export function AccessKeys() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-px bg-zinc-800 md:grid-cols-3">
      {KEYS.map((key) => {
        const isOpen = open === key.id;
        return (
          <motion.button
            key={key.id}
            type="button"
            onClick={() => setOpen(isOpen ? null : key.id)}
            aria-expanded={isOpen}
            className="group relative flex flex-col justify-between gap-10 border border-zinc-800 bg-black p-8 text-left outline-none focus-visible:border-white"
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
          </motion.button>
        );
      })}
    </section>
  );
}
