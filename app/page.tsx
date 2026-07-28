import ScrollExperience from "@/components/ScrollExperience";
import AppShowcase from "@/components/AppShowcase";
import LocalSEOAnchor from "@/components/LocalSEOAnchor";

// Mathematically-generated film grain. Zero image imports, negligible bytes over the wire.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Page() {
  return (
    <main className="relative bg-[#050505] text-[#ededed] font-sans overflow-x-hidden selection:bg-white selection:text-black">
      {/* Global vault-texture grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.015] mix-blend-screen"
        style={{ backgroundImage: GRAIN }}
      />

      <ScrollExperience />
      <AppShowcase />
      <LocalSEOAnchor />
    </main>
  );
}
