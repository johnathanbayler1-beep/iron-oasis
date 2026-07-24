"use client";

import React from "react";
import { KeyRound, ShieldCheck, Sparkles, Zap } from "lucide-react";

const TIERS = [
  {
    name: "Core Access",
    desc: "Essential private facility access for solo operators.",
    price: "99",
    badge: "Solo Operator",
    features: [
      "Off-Peak 1-Hour Blocks",
      "Digital Key Integration",
      "Full Equipment Access",
      "Zero-Crowd Guarantee",
    ],
    cta: "Claim Digital Key",
    popular: false,
  },
  {
    name: "Pro Elite",
    desc: "Complete 24/7 unlimited access for high-frequency operators.",
    price: "125",
    badge: "Most Popular",
    features: [
      "24/7 Priority Scheduling",
      "Instant Yale Key Dispatch",
      "Advanced Biometrics Sync",
      "Guest Pass Included",
    ],
    cta: "Request App Access",
    popular: true,
  },
  {
    name: "Enterprise Studio",
    desc: "Maximum tier featuring multi-location privileges and priority booking.",
    price: "149",
    badge: "Multi-Vault",
    features: [
      "All Private Locations",
      "Multi-Hour Advanced Hold",
      "Dedicated VIP Support",
      "Custom Locker Integration",
    ],
    cta: "Deploy Enterprise Key",
    popular: false,
  },
];

export default function AntiGymMatrix() {
  return (
    <section className="relative py-32 px-6 bg-[#030303] text-white overflow-hidden border-t border-white/10">
      {/* Background radial ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-white/[0.04] to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-300">
              Private By Design • App-Provisioned
            </span>
          </div>
          <h2 className="font-syne font-extrabold text-4xl md:text-6xl tracking-tight mb-6">
            Shared floors have limits. <br />
            <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
              Your private space has none.
            </span>
          </h2>
          <p className="text-zinc-400 text-lg font-sans">
            The privacy of a space that is only ever yours — set against everything a shared floor can never offer. Keys issued strictly in-app.
          </p>
        </div>

        {/* Pricing & Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 group hover:-translate-y-2 ${
                tier.popular
                  ? "bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-black border-2 border-white/30 shadow-[0_0_60px_rgba(255,255,255,0.12)]"
                  : "bg-gradient-to-b from-zinc-950/70 to-black/90 border border-white/10 hover:border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
              } backdrop-blur-3xl`}
            >
              {/* Mechanical Corner Crosshairs */}
              <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-white/40 pointer-events-none" />
              <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-white/40 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-white/40 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-white/40 pointer-events-none" />

              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white text-black font-mono text-[10px] uppercase tracking-widest font-bold shadow-2xl flex items-center gap-1.5">
                  <Zap className="w-3 h-3 fill-black" />
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
                    {tier.badge}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <KeyRound className="w-4 h-4 text-zinc-300" />
                  </div>
                </div>

                <h3 className="font-syne font-bold text-2xl tracking-tight mb-2 text-white">
                  {tier.name}
                </h3>
                <p className="text-sm text-zinc-400 mb-8 min-h-[44px] font-sans">
                  {tier.desc}
                </p>

                <div className="flex items-baseline gap-1 mb-8 pb-8 border-b border-white/10">
                  <span className="text-xs text-zinc-500 font-mono">$</span>
                  <span className="text-5xl font-extrabold font-mono tracking-tight tabular-nums text-white">
                    {tier.price}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono tracking-wider ml-2 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    APP-PROVISIONED
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-sm text-zinc-300">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-sans">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`w-full py-4 rounded-xl font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 shadow-lg ${
                tier.popular
                  ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_25px_rgba(255,255,255,0.35)]"
                  : "bg-zinc-900 text-white border border-white/20 hover:bg-white hover:text-black hover:border-white"
              }`}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
