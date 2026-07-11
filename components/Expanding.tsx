import sites from '@/sites.config.json';

export function Expanding() {
  const pad = (n: number) => String(n).padStart(2, '0');
  const milestones = [
    { num: pad(sites.length), cap: 'Nodes live' },
    { num: pad(new Set(sites.map((s) => s.slug.split('-')[0])).size), cap: 'Regions' },
    { num: "'26", cap: 'Next wave' },
  ];

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
        audience. Node operators bring the space — we bring the protocol. Get on
        the list and we will tell you when a room opens near you.
      </p>

      <div className="mt-20 grid grid-cols-1 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-3">
        {milestones.map((milestone) => (
          <div key={milestone.cap} className="bg-black p-8">
            <span className="io-stat-num block">{milestone.num}</span>
            <span className="io-rule mt-4 block font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
              {milestone.cap}
            </span>
          </div>
        ))}
      </div>

      {/* Every registered node — raw coordinate index, straight from sites.config.json */}
      <div className="mt-4 border border-white/10">
        {sites.map((site, i) => (
          <a
            key={site.slug}
            href={site.route}
            className="group grid grid-cols-[60px_1fr_1fr] gap-px border-b border-white/10 bg-black px-6 py-5 font-mono text-[11px] uppercase tracking-widest transition-colors last:border-b-0 hover:bg-white"
          >
            <span className="text-zinc-600 group-hover:text-black">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-zinc-300 group-hover:text-black">{site.name}</span>
            <span className="text-right text-zinc-600 group-hover:text-black">
              {'coords' in site ? (site as { coords: string }).coords : '—'}
            </span>
          </a>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap gap-4">
        <button
          type="button"
          className="io-reveal-up inline-flex items-center justify-center border border-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-white hover:text-black"
        >
          Join the waitlist
        </button>
        <a
          href="/partner"
          className="io-reveal-up inline-flex items-center justify-center border border-zinc-700 px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:border-white hover:text-white"
        >
          Become a partner
        </a>
      </div>
    </div>
  );
}
