import MasterTimeline from "@/components/v3/timeline/MasterTimeline";

// V3 route — cinematic experience foundation. Built alongside the existing
// landing page (app/page.tsx) and legacy ScrollExperience; neither is touched
// by this route. See docs/IRON_OASIS_EXPERIENCE_BIBLE.md for the full spec.
export default function V3Page() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-[#ededed]">
      <MasterTimeline />
    </main>
  );
}
