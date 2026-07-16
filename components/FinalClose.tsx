'use client'

// Brutalist placeholder — holds the slot until equipment photography lands.
// Static by design: no motion, no glass, no gradients. 1px rules and monospace.
const SLOTS = [
  'RACK — 01',
  'PLATFORM — 02',
  'DUMBBELL WALL — 03',
  'CABLE STACK — 04',
  'CONDITIONING — 05',
  'RECOVERY — 06',
]

export function FinalClose() {
  return (
    <section
      style={{
        position: 'relative', zIndex: 20, background: '#000',
        padding: 'clamp(120px, 18vh, 240px) 6%',
        borderTop: '1px solid rgba(255,255,255,0.14)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
          }}
        >
          We are not a gym.
        </span>

        <h2
          style={{
            margin: '20px 0 0',
            fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
            fontSize: 'clamp(44px, 7vw, 104px)', lineHeight: 0.95,
            letterSpacing: '-0.045em', color: '#fff', textTransform: 'uppercase',
          }}
        >
          Awaiting Visual Assets
        </h2>

        <div
          style={{
            marginTop: 'clamp(48px, 7vh, 96px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            borderTop: '1px solid rgba(255,255,255,0.14)',
            borderLeft: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          {SLOTS.map((label, i) => (
            <div
              key={label}
              style={{
                aspectRatio: '4 / 3',
                borderRight: '1px solid rgba(255,255,255,0.14)',
                borderBottom: '1px solid rgba(255,255,255,0.14)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: 20,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-jetbrains), monospace', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  alignSelf: 'flex-end',
                  fontFamily: 'var(--font-jetbrains), monospace', fontSize: 11,
                  letterSpacing: '0.18em', color: 'rgba(255,255,255,0.18)',
                }}
              >
                [ {String(i + 1).padStart(2, '0')} / {String(SLOTS.length).padStart(2, '0')} ]
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            margin: 'clamp(32px, 5vh, 56px) 0 0', maxWidth: 560,
            fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, lineHeight: 1.7,
            letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
          }}
        >
          Equipment photography in production. Grid populates on delivery.
        </p>
      </div>
    </section>
  )
}
