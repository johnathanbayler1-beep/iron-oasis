'use client';

import { useState } from 'react';
import { CTA_COPY, highConvertingEntries } from '@/lib/concierge-knowledge';

// Pulls only the high-converting entries from the shared knowledge base —
// no generic filler, and no copy forked from lib/concierge-knowledge.ts.
const FAQ_ENTRIES = highConvertingEntries();

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ENTRIES[0]?.id ?? null);

  return (
    <section className="bg-black px-6 py-24 md:px-16 md:py-32" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          Questions
        </p>
        <h2
          id="faq-heading"
          className="mt-3 font-mono text-2xl uppercase tracking-widest text-white md:text-3xl"
        >
          Before You Reserve
        </h2>

        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {FAQ_ENTRIES.map((entry) => {
            const isOpen = openId === entry.id;
            return (
              <div key={entry.id} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : entry.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${entry.id}`}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="font-mono text-[13px] uppercase tracking-wide text-white md:text-sm">
                    {entry.question}
                  </span>
                  <span
                    aria-hidden
                    className={`font-mono text-lg text-zinc-500 transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>

                <div
                  id={`faq-panel-${entry.id}`}
                  role="region"
                  className={`grid overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="min-h-0">
                    <p className="font-mono text-[12px] leading-relaxed tracking-wide text-zinc-400 md:text-[13px]">
                      {entry.answer}
                    </p>
                    <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-white underline decoration-white/30 underline-offset-4">
                      {CTA_COPY[entry.cta]} &rarr;
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Full category set (experience, access, subscription, location, first
// experience, objections, conversion) lives in lib/concierge-knowledge.ts
// for Agent Storm and future sales surfaces; this section intentionally
// renders only the highConverting subset.
