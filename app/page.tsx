import ScrollExperience, { LocalSeoSection, FinalClose } from "@/components/ScrollExperience";

// Mathematically-generated film grain. Zero image imports, negligible bytes over the wire.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Page() {
  return (
    <main className="relative bg-gradient-to-b from-[#07080b] to-[#11141d] text-[#ededed] font-sans overflow-x-hidden selection:bg-white selection:text-black">
      {/* Atmospheric radial lighting vignette — kills flat dead-black zones, and
          drifts continuously so the very first paint (before the 3D scene or
          any scroll input) already reads as alive, not a stale black screen. */}
      <div
        aria-hidden
        className="io-ambient-glow pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(65% 55% at 20% 0%, rgba(120,140,180,0.22), transparent 60%), radial-gradient(55% 45% at 85% 100%, rgba(90,100,140,0.16), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="io-ambient-glow-b pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(45% 40% at 60% 15%, rgba(160,150,220,0.12), transparent 65%)",
        }}
      />
      {/* Global vault-texture grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] mix-blend-screen"
        style={{ backgroundImage: GRAIN }}
      />

      <ScrollExperience />
      <LocalSeoSection />
      <FinalClose />
    </main>
  );
}
