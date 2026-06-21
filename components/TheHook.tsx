const STEPS = [
  {
    n: '01',
    label: 'Reserve the hour',
    body: 'Pick a window in the app. The room is held for one reservation — yours. Nothing is ever double-booked.',
  },
  {
    n: '02',
    label: 'Walk straight in',
    body: 'Tap your Access Key at the door. No front desk, no check-in line, no floor staff. The lights are already on.',
  },
  {
    n: '03',
    label: 'The room is yours',
    body: 'Every rack, bench, and machine — uncontested for the full hour. You leave, it resets for the next person.',
  },
];

export function TheHook() {
  return (
    <div className="mx-auto max-w-5xl">
      <span className="io-rule block font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
        How it works
      </span>

      <h2 className="io-edit-heading mt-8 font-display text-6xl uppercase leading-[0.9] tracking-tight text-white md:text-8xl">
        Three taps.
        <br />
        <span className="text-zinc-500">Zero audience.</span>
      </h2>

      <p className="io-body mt-10 max-w-xl">
        Every shared floor asks you to perform a little — to wait, to share, to
        be seen. A private room removes the audience entirely. The hour is booked
        to one person. That person is you.
      </p>

      <div className="mt-20 grid grid-cols-1 gap-px border border-zinc-800 bg-zinc-800 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="bg-black p-8">
            <span className="io-stat-num block">{step.n}</span>
            <h3 className="mt-6 font-display text-3xl uppercase leading-none tracking-tight text-white">
              {step.label}
            </h3>
            <p className="io-body mt-4">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
