#!/usr/bin/env node
// Site generator per docs/EXPANSION.md: slug-named route + config entry.
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const BANNED = ["clearance", "workout", "gains", "beast mode", "grind", "sanctuary", "gym floor"];

const [, , rawSlug, displayName] = process.argv;

if (!rawSlug || !displayName) {
  console.error('Usage: node scripts/new-site.mjs <slug> "<Display Name>"');
  process.exit(1);
}

const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
const lower = displayName.toLowerCase();
const hit = BANNED.find((w) => lower.includes(w));
if (hit) {
  console.error(`Banned term "${hit}" in display name. See docs/EXPANSION.md brand vocabulary.`);
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const routeDir = path.join(root, "app", `(${slug})`, slug);
const configPath = path.join(root, "sites.config.json");

await mkdir(routeDir, { recursive: true });

await writeFile(
  path.join(routeDir, "page.tsx"),
  `'use client'

import { Suspense, useState, useCallback } from 'react'
import GymSpin from '@/components/GymSpinLazy';
import GymScene from '@/app/components/GymSceneLazy';

export default function ${toPascal(slug)}() {
  const [gymMounted, setGymMounted] = useState(false)
  const preloadGym = useCallback(() => setGymMounted(true), [])

  return (
    <main className="relative min-h-screen bg-black text-white">
      {/* spatial autonomy initialization: 3D canvas logic lives here */}
      <Suspense fallback={<div style={{ width: '100%', height: '100vh', background: '#000' }} />}>
        {gymMounted && <GymScene onReady={() => {}} />}
        {gymMounted && <GymSpin />}
      </Suspense>

      <section className="io-editorial flex min-h-screen items-center justify-center" onPointerEnter={preloadGym}>
        <h1 className="font-display text-[14vw] uppercase leading-none tracking-tight">
          ${displayName}
        </h1>
        <p className="sr-only">Spatial autonomy. Your private node.</p>
      </section>
    </main>
  );
}
`
);

const sites = JSON.parse(await readFile(configPath, "utf8"));
sites.push({ slug, name: displayName, route: `/${slug}`, coords: process.argv[4] ?? "" });
await writeFile(configPath, JSON.stringify(sites, null, 2) + "\n");

console.log(`Created app/(${slug})/${slug}/page.tsx and registered in sites.config.json`);

function toPascal(s) {
  return s.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
}
