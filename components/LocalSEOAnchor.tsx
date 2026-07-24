"use client";

import React from "react";
import { RetroTelemetryPanel } from "./ui/RetroTelemetryPanel";
import { UnlumenGlowBadge } from "./ui/UnlumenGlowBadge";
import { MagicShimmerButton } from "./ui/MagicShimmerButton";

const COORDINATES = [
  { k: "FACILITY", v: "IRON OASIS — WNDSR" },
  { k: "LOCALITY", v: "WINDSOR, ONTARIO (CA)" },
  { k: "LAT", v: "42.3149° N" },
  { k: "LONG", v: "-83.0364° W" },
  { k: "HOURS", v: "24/7 — CONTINUOUS" },
  { k: "ACCESS", v: "BIOMETRIC / DIGITAL KEY" },
];

/** Mechanical corner accents for structural framing. */
function CornerAccents() {
  const base = "absolute h-3 w-3 border-white/25";
  return (
    <>
      <span aria-hidden className={`${base} left-0 top-0 border-l border-t`} />
      <span aria-hidden className={`${base} right-0 top-0 border-r border-t`} />
      <span aria-hidden className={`${base} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${base} bottom-0 right-0 border-b border-r`} />
    </>
  );
}

export default function LocalSEOAnchor() {
  return (
    <section className="relative bg-[#030303] text-white px-6 py-32 border-t border-white/[0.06]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HealthClub",
            "name": "Iron Oasis Private Space",
            "description": "24/7 unstaffed, private-access facility.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Windsor",
              "addressRegion": "ON",
              "addressCountry": "CA"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 42.3149,
              "longitude": -83.0364
            },
            "priceRange": "$$$",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "00:00",
              "closes": "23:59"
            }
          }),
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-5 block">
            OPERATIONAL COORDINATES / WNDSR
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter font-syne mb-6">
            Flagship Location. <br />
            <span className="text-zinc-500">A Private Space, Not a Facility.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
            A premium private space in a quiet Windsor residential setting. Zero staffing, zero sharing, fully automated Twilio voice/SMS handlers, and turnkey Digital Key access control.
          </p>

          {/* Coordinates telemetry table */}
          <div className="relative border border-white/[0.08] bg-white/[0.02] p-5 mb-10">
            <CornerAccents />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 font-mono">
              {COORDINATES.map(({ k, v }) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] py-1.5"
                >
                  <dt className="text-[10px] uppercase tracking-widest text-zinc-500">{k}</dt>
                  <dd className="text-xs tracking-wider text-zinc-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap gap-4">
            <MagicShimmerButton>Acquire Digital Key</MagicShimmerButton>
            <MagicShimmerButton>Request App Access</MagicShimmerButton>
          </div>
        </div>

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold font-syne tracking-tight">Facility Gateway</h3>
            <UnlumenGlowBadge tone="live">Operational</UnlumenGlowBadge>
          </div>
          <RetroTelemetryPanel
            title="ACCESS GATEWAY"
            status="locked"
            rows={[
              { label: "TWILIO GATEWAY", value: "OPERATIONAL", status: "locked" },
              { label: "YALE DEADBOLT", value: "ENCRYPTED 256-BIT", status: "locked" },
              { label: "PRIVATE SPACE", value: "WINDSOR-CENTRAL (ON)" },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
