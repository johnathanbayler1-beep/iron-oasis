import sites from '@/sites.config.json';

const STATS = [
  { num: '24/7', cap: 'Doors never close' },
  { num: '60', cap: 'Minutes, uninterrupted' },
  { num: '1:1', cap: 'Room to person' },
];

export function FindYourWayIn() {
  return (
    <div className="mx-auto max-w-5xl">
      <span className="io-rule block font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
        Find your way in
      </span>

      <h2 className="io-edit-heading mt-8 font-display text-6xl uppercase leading-[0.9] tracking-tight text-white md:text-8xl">
        Start with
        <br />
        <span className="text-zinc-500">a single hour.</span>
      </h2>

      <p className="io-body mt-10 max-w-xl">
        No tour, no hard sell, no contract to read twice. Book one private
        session and feel what an empty room does for the work. Keep the key only
        if it earns its place.
      </p>

      <div className="mt-20 grid grid-cols-1 gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.cap} className="bg-black p-8">
            <span className="io-stat-num block">{stat.num}</span>
            <span className="io-rule mt-4 block font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">
              {stat.cap}
            </span>
          </div>
        ))}
      </div>

      {/* Node index — raw coordinate table pulled straight from sites.config.json */}
      <div className="mt-4 border border-white/10">
        <div className="grid grid-cols-[80px_1fr_1fr_80px] gap-px border-b border-white/10 bg-black px-8 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          <span>IDX</span>
          <span>NODE</span>
          <span>COORD</span>
          <span className="text-right">STATE</span>
        </div>
        {sites.map((site, i) => (
          <a
            key={site.slug}
            href={site.route}
            className="group grid grid-cols-[80px_1fr_1fr_80px] gap-px bg-black px-8 py-6 font-mono text-[11px] uppercase tracking-widest transition-colors hover:bg-white"
          >
            <span className="text-zinc-500 group-hover:text-black">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-white group-hover:text-black">{site.name}</span>
            <span className="text-zinc-500 group-hover:text-black">
              {'coords' in site ? (site as { coords: string }).coords : '—'}
            </span>
            <span className="text-right text-zinc-600 group-hover:text-black">LIVE</span>
          </a>
        ))}
      </div>

      <button
        type="button"
        className="io-reveal-up mt-16 inline-flex items-center justify-center border border-white bg-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-black transition-colors hover:bg-black hover:text-white"
      >
        Book a first session
      </button>
    </div>
  );
}
