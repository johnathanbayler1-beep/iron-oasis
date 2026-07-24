"use client";

import React from "react";
import { SmoothLuxCard } from "./ui/SmoothLuxCard";
import { MagicShimmerButton } from "./ui/MagicShimmerButton";

const TIER_PRICES = [
  {
    name: "Base Access",
    price: "99",
    cadence: "month",
    desc: "Essential off-peak private facility access for solo operators.",
    features: ["Off-Peak 1-Hour Blocks", "Digital Key Integration", "Full Equipment Access", "Zero Crowd Guarantee"],
    popular: false,
  },
  {
    name: "Pro Elite",
    price: "125",
    cadence: "month",
    desc: "Complete 24/7 unlimited access for high-frequency operators.",
    features: ["24/7 Priority Scheduling", "Instant Yale Key Dispatch", "Advanced Biometrics Sync", "Guest Pass Included"],
    popular: true,
  },
  {
    name: "Enterprise Studio",
    price: "149",
    cadence: "month",
    desc: "Maximum tier featuring multi-location privileges and priority booking.",
    features: ["All Private Locations", "Multi-Hour Advanced Hold", "Dedicated VIP Support", "Custom Locker Integration"],
    popular: false,
  },
];

export default function AntiGymMatrix() {
  return (
    <section className="relative py-40 bg-[#050505] text-white px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-4 block">
            Private By Design
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne mb-6">
            Shared floors have limits. <br />
            <span className="text-zinc-500">Your private space has none.</span>
          </h2>
          <p className="text-zinc-400 text-lg">
            The privacy of a space that is only ever yours — set against everything a shared floor can never offer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 [perspective:1200px]">
          {TIER_PRICES.map((tier, idx) => (
            <SmoothLuxCard
              key={idx}
              eyebrow={tier.popular ? "Most Popular" : undefined}
              className={`flex flex-col justify-between p-8 ${
                tier.popular ? "border-white/30 shadow-2xl shadow-white/5" : ""
              }`}
            >
              {/* mechanical corner crosshairs */}
              {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
                <span key={pos} className={`pointer-events-none absolute ${pos} w-2 h-2 border-l border-t border-white/30`} />
              ))}
              <div>
                <span className="block text-[10px] uppercase font-mono tracking-[0.25em] text-zinc-500 mb-3">Access Tier</span>
                <h3 className="text-xl font-bold font-syne tracking-tighter mb-2">{tier.name}</h3>
                <p className="text-sm text-zinc-400 mb-6">{tier.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-xs text-zinc-500 font-mono">$</span>
                  <span className="text-5xl font-extrabold font-mono tracking-tighter tabular-nums">{tier.price}</span>
                  <span className="text-xs text-zinc-400 font-mono">/{tier.cadence}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="text-sm text-zinc-300 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <MagicShimmerButton className="w-full">Acquire Key</MagicShimmerButton>
            </SmoothLuxCard>
          ))}
        </div>
      </div>
    </section>
  );
}
