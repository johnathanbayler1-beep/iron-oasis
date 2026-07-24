"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

export type LockGatewayStatus = "locked" | "unlocked" | "pending" | "offline";

type TelemetryRow = { label: string; value: string; status?: LockGatewayStatus };

type RetroTelemetryPanelProps = {
  /** Panel header, e.g. "YALE GATEWAY". */
  title?: string;
  /** Live gateway state of the primary Yale lock. */
  status: LockGatewayStatus;
  /** Additional monospace readout rows. */
  rows?: TelemetryRow[];
  className?: string;
};

const STATUS_META: Record<LockGatewayStatus, { dot: string; label: string }> = {
  locked: { dot: "#3fe08a", label: "SECURED" },
  unlocked: { dot: "#ffffff", label: "OPEN" },
  pending: { dot: "#f5c451", label: "HANDSHAKE" },
  offline: { dot: "#ff5f56", label: "NO SIGNAL" },
};

/**
 * Terminal-aesthetic readout for the Yale lock gateway. Monospace, tracked-out,
 * scanline-lit obsidian glass. A blinking caret + spring-mounted status dot
 * carry the retro-terminal motion (framer-motion, no CSS keyframes).
 */
export function RetroTelemetryPanel({
  title = "YALE GATEWAY",
  status,
  rows = [],
  className,
}: RetroTelemetryPanelProps) {
  const meta = STATUS_META[status];
  const allRows = useMemo<TelemetryRow[]>(
    () => [{ label: "ACCESS STATE", value: meta.label, status }, ...rows],
    [meta.label, status, rows]
  );

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 font-mono text-sm backdrop-blur-2xl ${className ?? ""}`}
    >
      {/* scanline wash */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
          <span className="text-xs uppercase tracking-widest text-zinc-400">
            {title}
          </span>
          <span className="inline-flex items-center gap-2">
            <motion.span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: meta.dot, boxShadow: `0 0 10px ${meta.dot}` }}
              initial={{ scale: 0.6, opacity: 0.4 }}
              animate={
                status === "pending"
                  ? { scale: [0.7, 1.1, 0.7], opacity: [0.5, 1, 0.5] }
                  : { scale: 1, opacity: 1 }
              }
              transition={
                status === "pending"
                  ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
                  : { type: "spring", stiffness: 400, damping: 22 }
              }
            />
            <span className="text-[0.7rem] uppercase tracking-widest text-zinc-300">
              {meta.label}
            </span>
          </span>
        </div>

        <dl className="space-y-2">
          <AnimatePresence initial={false}>
            {allRows.map((row) => (
              <motion.div
                key={row.label}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className="flex items-baseline justify-between gap-4"
              >
                <dt className="text-zinc-500">{row.label}</dt>
                <dd
                  className="tabular-nums text-zinc-100"
                  style={
                    row.status
                      ? { color: STATUS_META[row.status].dot }
                      : undefined
                  }
                >
                  {row.value}
                </dd>
              </motion.div>
            ))}
          </AnimatePresence>
        </dl>

        <div className="mt-4 flex items-center gap-1 text-zinc-500">
          <span className="text-xs">$</span>
          <span className="text-xs">gateway --watch</span>
          <motion.span
            className="ml-0.5 inline-block h-3.5 w-2 bg-zinc-300"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}
