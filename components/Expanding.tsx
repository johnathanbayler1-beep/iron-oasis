const MILESTONES = [
  { num: '12', cap: 'Rooms live' },
  { num: '04', cap: 'Cities' },
  { num: "'26", cap: 'Next wave' },
];

export function Expanding() {
  return (
    <div className="mx-auto max-w-5xl">
      <span className="io-rule block font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
        Expanding
      </span>

      <h2 className="io-edit-heading mt-8 font-display text-6xl uppercase leading-[0.9] tracking-tight text-white md:text-8xl">
        More rooms.
        <br />
        <span className="text-zinc-500">More cities.</span>
      </h2>

      <p className="io-body mt-10 max-w-xl">
        The model is simple enough to repeat: one room, one reservation, no
        audience. We are adding floors block by block — quietly, without turning
        the space into a chain. Get on the list and we will tell you when a room
        opens near you.
      </p>

      <div className="mt-20 grid grid-cols-1 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-3">
        {MILESTONES.map((milestone) => (
          <div key={milestone.cap} className="bg-black p-8">
            <span className="io-stat-num block">{milestone.num}</span>
            <span className="io-rule mt-4 block font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
              {milestone.cap}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="io-reveal-up mt-16 inline-flex items-center justify-center border border-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black"
      >
        Join the waitlist
      </button>
    </div>
  );
}
