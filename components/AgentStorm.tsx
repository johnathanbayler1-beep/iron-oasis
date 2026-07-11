'use client';

import { useState } from 'react';

// ponytail: UI shell only — no backend. Wire `send` to the onboarding API when it exists.
const BOOT_LINES = [
  { from: 'storm', text: 'AGENT STORM ONLINE. I handle onboarding for this node.' },
  { from: 'storm', text: 'Three steps: identity, access key, first solo window.' },
  { from: 'storm', text: 'State your name to begin.' },
];

const STEPS = ['01 / IDENTITY', '02 / ACCESS KEY', '03 / FIRST WINDOW'];

export function AgentStorm() {
  const [messages, setMessages] = useState(BOOT_LINES);
  const [input, setInput] = useState('');

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { from: 'you', text },
      { from: 'storm', text: 'ACKNOWLEDGED. Onboarding protocol pending activation.' },
    ]);
    setInput('');
  };

  return (
    <div className="mx-auto max-w-5xl">
      <span className="io-rule block font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
        Onboarding
      </span>

      <h2 className="io-edit-heading mt-8 font-display text-6xl uppercase leading-[0.9] tracking-tight text-white md:text-8xl">
        Meet
        <br />
        <span className="text-zinc-500">Agent Storm.</span>
      </h2>

      <p className="io-body mt-10 max-w-xl">
        No forms, no front desk. Agent Storm sets up your identity, issues your
        Access Key, and books your first solo window — in one conversation.
      </p>

      <div className="mt-20 grid grid-cols-1 gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-[220px_1fr]">
        {/* step rail */}
        <div className="flex flex-row gap-px bg-zinc-800 md:flex-col">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex-1 bg-black p-6 font-mono text-[11px] uppercase tracking-[0.25em] ${
                i === 0 ? 'text-white' : 'text-zinc-600'
              }`}
            >
              {step}
              {i === 0 && <span className="ml-2 inline-block h-2 w-2 animate-pulse bg-white align-middle" aria-hidden />}
            </div>
          ))}
        </div>

        {/* terminal panel */}
        <div className="flex flex-col bg-black">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white">
              AGENT STORM // SETUP
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">
              CHANNEL SECURE
            </span>
          </div>

          <div className="flex min-h-[260px] flex-col gap-4 p-6" aria-live="polite">
            {messages.map((msg, i) => (
              <p
                key={i}
                className={`max-w-md font-mono text-xs leading-relaxed tracking-wide ${
                  msg.from === 'storm' ? 'text-zinc-300' : 'self-end text-black bg-white px-3 py-2'
                }`}
              >
                {msg.from === 'storm' && <span className="mr-2 text-zinc-600">▸</span>}
                {msg.text}
              </p>
            ))}
          </div>

          <div className="flex border-t border-zinc-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="TYPE RESPONSE_"
              aria-label="Respond to Agent Storm"
              className="flex-1 bg-black px-6 py-5 font-mono text-xs uppercase tracking-[0.2em] text-white placeholder:text-zinc-700 focus:outline-none"
            />
            <button
              type="button"
              onClick={send}
              className="border-l border-zinc-800 bg-white px-8 font-mono text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors hover:bg-black hover:text-white"
            >
              Initiate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
