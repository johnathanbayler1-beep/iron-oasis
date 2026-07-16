'use client';

import { useEffect, useRef, useState } from 'react';

// ponytail: hardcoded FAQ pairs — swap for real backend when onboarding API exists
const FAQS = [
  {
    q: 'How does this work?',
    a: 'You get an access key, book a session in the app, and have the entire private space to yourself.',
  },
  {
    q: 'What is the cost?',
    a: 'Monthly access is $99, $125, or $149 depending on how much access you want.',
  },
  {
    q: 'Are there other people?',
    a: 'No. When you book, the private space is yours for your session — no one else is there.',
  },
];

type Line = { from: 'you' | 'storm'; text: string };

function matchFaq(input: string): string {
  const t = input.toLowerCase();
  if (/cost|price|\$|much|allocat/.test(t)) return FAQS[1].a;
  if (/people|other|crowd|alone|busy/.test(t)) return FAQS[2].a;
  if (/work|how|what is this/.test(t)) return FAQS[0].a;
  return "I didn't catch that. Ask me about access, cost, or booking a session.";
}

export function AgentStormChat({ onClose }: { onClose: () => void }) {
  const [lines, setLines] = useState<Line[]>([
    { from: 'storm', text: 'Hi — ask me anything about Iron Oasis.' },
  ]);
  const [typing, setTyping] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines, typing]);

  const typeOut = (answer: string) => {
    setBusy(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setTyping(answer.slice(0, i));
      if (i >= answer.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setTyping('');
        setLines((l) => [...l, { from: 'storm', text: answer }]);
        setBusy(false);
      }
    }, 18);
  };

  const ask = (q: string) => {
    if (busy || !q.trim()) return;
    setLines((l) => [...l, { from: 'you', text: q }]);
    typeOut(matchFaq(q));
    setInput('');
  };

  return (
    <div className="pointer-events-auto flex w-[min(420px,calc(100vw-2rem))] flex-col border border-white/10 bg-black shadow-[0_0_80px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white">
          AGENT STORM // TERMINAL
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close terminal"
          className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition-colors hover:text-white active:scale-95"
        >
          [X]
        </button>
      </div>

      <div ref={logRef} className="flex max-h-[320px] min-h-[220px] flex-col gap-3 overflow-y-auto p-5" aria-live="polite">
        {lines.map((line, i) => (
          <p
            key={i}
            className={`font-mono text-[11px] leading-relaxed tracking-wide ${
              line.from === 'storm' ? 'text-zinc-300' : 'text-white'
            }`}
          >
            <span className="mr-2 text-zinc-600">{line.from === 'storm' ? '▸' : '>_'}</span>
            {line.text}
          </p>
        ))}
        {typing && (
          <p className="font-mono text-[11px] leading-relaxed tracking-wide text-zinc-300">
            <span className="mr-2 text-zinc-600">▸</span>
            {typing}
            <span className="io-storm-cursor" aria-hidden />
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-px border-t border-white/10 bg-white/10">
        {FAQS.map((faq) => (
          <button
            key={faq.q}
            type="button"
            disabled={busy}
            onClick={() => ask(faq.q)}
            className="flex-1 whitespace-nowrap bg-black px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500 transition-colors hover:text-white active:scale-95 disabled:opacity-40"
          >
            {faq.q}
          </button>
        ))}
      </div>

      <div className="flex items-center border-t border-white/10">
        <span className="pl-5 font-mono text-[11px] text-zinc-500" aria-hidden>
          &gt;_
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(input)}
          placeholder="QUERY"
          aria-label="Ask Agent Storm"
          className="flex-1 bg-black px-3 py-4 font-mono text-[11px] uppercase tracking-widest text-white outline-none placeholder:text-zinc-700 focus:outline-none focus:ring-0"
        />
        <span className="io-storm-cursor mr-5" aria-hidden />
      </div>

      <style>{`
        .io-storm-cursor {
          display: inline-block;
          width: 7px;
          height: 13px;
          background: #fff;
          vertical-align: text-bottom;
          animation: ioStormBlink 1s steps(1) infinite;
        }
        @keyframes ioStormBlink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
