'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AgentStormChat } from './AgentStormChat';

export function AgentStormWidget() {
  const [open, setOpen] = useState(false);
  // Greet, then clear the corner so the wide bubble stops overlapping the hero CTA.
  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      {open && <AgentStormChat onClose={() => setOpen(false)} />}

      {!open && showHint && (
        <div className="pointer-events-auto max-w-[220px] border border-white/10 bg-black px-4 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-widest text-zinc-400">
          Ask me if you have any questions or need help.
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close Agent Storm' : 'Open Agent Storm'}
        className="io-storm-float pointer-events-auto transition-transform active:scale-95"
      >
        <Image
          src="/storm.png"
          alt="Agent Storm"
          width={72}
          height={72}
          className=""
          priority={false}
        />
      </button>

      <style>{`
        .io-storm-float {
          animation: ioStormFloat 3.2s ease-in-out infinite;
        }
        @keyframes ioStormFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .io-storm-float { animation: none; }
        }
      `}</style>
    </div>
  );
}
