"use client";

import { useState } from "react";
import MembershipForm from "@/components/v3/forms/MembershipForm";

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#050505] px-8 py-16">
        <div className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
          <h1 className="font-display text-[clamp(28px,6vw,48px)] font-medium uppercase leading-tight text-white">
            Application Received
          </h1>
          <p className="text-[14px] font-light leading-relaxed text-[#b8b8b8]">
            Thank you for applying to Iron Oasis. Our team typically responds within 48 hours.
          </p>
          <p className="text-[13px] font-light uppercase tracking-[0.15em] text-[#b8b8b8]/70">
            Check your email for confirmation
          </p>
          <a
            href="/v3"
            className="mt-6 inline-flex items-center justify-center rounded-full border border-[#C9A84C] px-8 py-3 font-display text-[12px] font-medium uppercase tracking-[0.25em] text-[#C9A84C] transition-colors duration-300 hover:bg-[#C9A84C] hover:text-black"
          >
            Return to Experience
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#050505] px-8 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-12 text-center">
          <h1 className="font-display text-[clamp(28px,6vw,48px)] font-medium uppercase leading-tight text-white">
            Apply to Iron Oasis
          </h1>
          <p className="mt-4 text-[14px] font-light text-[#b8b8b8]">
            Tell us about your fitness goals and training experience.
          </p>
        </div>

        <MembershipForm onSuccess={() => setSubmitted(true)} />
      </div>
    </main>
  );
}
