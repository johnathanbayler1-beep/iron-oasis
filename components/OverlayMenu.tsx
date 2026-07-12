'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

type Pathway = { label: string; href: string; index: string };

const PATHWAYS: Pathway[] = [
  { label: 'The Space', href: '/', index: '01' },
  { label: 'The Shop', href: '/shop', index: '02' },
];

const MECH = { type: 'spring' as const, stiffness: 520, damping: 40, mass: 1 };

const panel = {
  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  open: { transition: { delayChildren: 0.12, staggerChildren: 0.07 } },
};

const item = {
  closed: { y: '110%', opacity: 0 },
  open: { y: '0%', opacity: 1, transition: MECH },
};

export function OverlayMenu() {
  const [open, setOpen] = useState(false);

  // Hard scroll-lock while the overlay owns the viewport.
  useEffect(() => {
    document.documentElement.classList.toggle('lenis-stopped', open);
    return () => document.documentElement.classList.remove('lenis-stopped');
  }, [open]);

  // Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="fixed right-6 top-6 z-[60] flex h-12 w-12 items-center justify-center border border-white bg-black text-white mix-blend-difference"
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
          {open ? 'X' : 'IO'}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.25 } }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-black"
          >
            <motion.ul
              variants={panel}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex flex-1 flex-col justify-center px-6 md:px-16"
            >
              {PATHWAYS.map((p) => (
                <li key={p.href} className="overflow-hidden border-t border-zinc-800 last:border-b">
                  <motion.div variants={item}>
                    <Link
                      href={p.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-6 py-6 md:py-10"
                    >
                      <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-600">
                        {p.index}
                      </span>
                      <span className="font-display text-[14vw] uppercase leading-[0.85] tracking-tight text-white transition-transform duration-300 group-hover:translate-x-4 md:text-[9vw]">
                        {p.label}
                      </span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </motion.ul>

            <motion.div
              variants={item}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex items-center justify-between border-t border-zinc-800 px-6 py-6 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 md:px-16"
            >
              <span>Iron Oasis</span>
              <span>24/7 Access</span>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
