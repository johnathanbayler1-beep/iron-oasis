import ScrollExperience, { LocalSeoSection, FinalClose } from "@/components/ScrollExperience";
import Navbar from "@/components/Navbar";

// Mathematically-generated film grain. Zero image imports, negligible bytes over the wire.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Page() {
  return (
    <main className="relative bg-[#0d070b] text-[#ededed] font-sans overflow-x-hidden selection:bg-white selection:text-black">
      {/* Atmospheric radial lighting vignette — moody charcoal-to-crimson underglow, kills flat dead-black zones.
          Viewport-fixed so it never runs out no matter how far the document scrolls. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 20% 0%, rgba(120,140,180,0.10), transparent 60%), radial-gradient(65% 55% at 50% 100%, rgba(160,20,40,0.22), transparent 70%), radial-gradient(50% 40% at 85% 100%, rgba(90,100,140,0.10), transparent 65%), radial-gradient(70% 60% at 50% 50%, rgba(120,20,32,0.10), transparent 75%)",
        }}
      />
      {/* Global vault-texture grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] mix-blend-screen"
        style={{ backgroundImage: GRAIN }}
      />

      <Navbar />
      <ScrollExperience />
      <LocalSeoSection />
      <FinalClose />
    </main>
  );
}
