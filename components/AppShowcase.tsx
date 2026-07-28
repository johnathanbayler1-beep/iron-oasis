"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagicShimmerButton } from "./ui/MagicShimmerButton";

export default function AppShowcase() {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    setStep(step < 3 ? step + 1 : 1);
  };

  return (
    <section id="request-access" className="relative py-24 bg-[#050505] text-white overflow-hidden border-t border-white/10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono mb-4 block">
              Frictionless Private Access
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 font-syne">
              One Access Key. <br />
              <span className="text-zinc-500">Zero Sharing. Entire Space.</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              No front desks, no shared keycards, no waiting. Request your session instantly in the Iron Oasis app. Your encrypted Access Key unlocks the space the moment you arrive.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-[320px] h-[640px] bg-zinc-950 border border-zinc-800 rounded-[40px] p-4 shadow-2xl relative flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center px-4 pt-2">
                <span className="text-xs font-mono text-zinc-400">9:41</span>
                <div className="w-20 h-4 bg-black rounded-full mx-auto" />
                <span className="text-xs font-mono text-zinc-400">5G</span>
              </div>

              <div className="flex-1 flex flex-col justify-center my-auto px-2">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center space-y-6"
                    >
                      <div className="relative w-24 h-24 mx-auto">
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 rounded-full border border-white/20"
                          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        />
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 rounded-full border border-white/20"
                          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
                        />
                        <div className="absolute inset-6 rounded-full border border-white/40" />
                        <div className="absolute inset-[42px] rounded-full bg-white/30" />
                      </div>
                      <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                        Awaiting Proximity
                      </span>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center space-y-6 px-2"
                    >
                      <div className="font-mono text-[10px] text-left text-zinc-600 space-y-1 leading-relaxed">
                        {["AUTH_HASH_9482", "KEY_EXCHANGE_A1F", "CIPHER_LOCK_7C30"].map((line, i) => (
                          <motion.p
                            key={line}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15, repeat: Infinity, repeatType: "reverse", duration: 0.6 }}
                          >
                            &gt; {line}
                          </motion.p>
                        ))}
                      </div>
                      <div className="h-px w-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-white"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                        Validating Clearance...
                      </span>
                    </motion.div>
                  )}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="text-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-white text-black font-extrabold rounded-2xl flex items-center justify-center text-xl mx-auto shadow-lg shadow-white/10 font-mono">
                        4892
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-300 bg-white/5 px-2 py-1 rounded-full border border-white/15">
                          Lock Disarmed
                        </span>
                        <h3 className="text-sm font-bold text-white mt-3">Space Unlocked</h3>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pb-4 pt-2">
                <MagicShimmerButton onClick={handleNext} className="w-full">
                  {step === 1 ? "Request App Access" : step === 2 ? "Acquire Digital Key" : "Reset Demo"}
                </MagicShimmerButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
