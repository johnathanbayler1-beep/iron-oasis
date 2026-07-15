'use client';

import { useEffect } from 'react';

/**
 * Drives the editorial reveal system. Watches every reveal target and adds
 * `io-hl-visible` as it scrolls into view. Renders nothing.
 */
export function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll(
      '.io-reveal-up, .io-edit-heading, .io-tier, .io-stat-num, .io-body, .io-rule, .io-spatial'
    );
    if (!els.length) return;

    // Reduced motion: skip the animation, show everything immediately.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('io-hl-visible'));
      return;
    }

    // Watchdog: if the observer never fires (unsupported / JS error), force
    // everything visible after 4s so content can't get stuck hidden.
    const fallback = window.setTimeout(() => {
      document.body.classList.add('io-fallback-visible');
    }, 4000);

    let firstSeen = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!firstSeen) {
            firstSeen = true;
            window.clearTimeout(fallback); // observer works — drop the watchdog
          }
          entry.target.classList.add('io-hl-visible');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
