const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = '/private/tmp/claude-501/-Users-johnathanbayler-Desktop-iron-oasis/b0226f66-fd26-4d31-b925-729549be9db7/scratchpad/frames';
fs.mkdirSync(OUT, { recursive: true });

const PCTS = [0, 10, 25, 50, 75, 90, 100];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const consoleLog = [];
  page.on('console', (msg) => {
    consoleLog.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    consoleLog.push({ type: 'pageerror', text: err.message });
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500); // fonts + initial 3D load

  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

  const report = [];

  for (const pct of PCTS) {
    consoleLog.length = 0; // reset per-step, we want errors attributable to this step
    const target = Math.round((maxScroll * pct) / 100);
    await page.evaluate((y) => window.scrollTo(0, y), target);
    await page.waitForTimeout(500);

    // canvas + webgl context loss check
    const canvasInfo = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      return canvases.map((c, i) => {
        let ctxLost = null;
        try {
          const gl = c.getContext('webgl2') || c.getContext('webgl');
          ctxLost = gl ? gl.isContextLost() : 'no-gl-context';
        } catch (e) {
          ctxLost = 'error:' + e.message;
        }
        return {
          index: i,
          width: c.width,
          height: c.height,
          isContextLost: ctxLost,
        };
      });
    });

    // grab dataURL of the first (or largest) canvas
    const shot = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      if (!canvases.length) return null;
      const big = canvases.sort((a, b) => b.width * b.height - a.width * a.height)[0];
      try {
        return big.toDataURL('image/png');
      } catch (e) {
        return 'ERROR:' + e.message;
      }
    });

    if (shot && shot.startsWith('data:image')) {
      const base64 = shot.split(',')[1];
      fs.writeFileSync(path.join(OUT, `scroll-${pct}pct.png`), Buffer.from(base64, 'base64'));
    }

    // also take a full-page-viewport screenshot (DOM+canvas composited) for text overlap check
    await page.screenshot({ path: path.join(OUT, `viewport-${pct}pct.png`) });

    // text overlap check: bounding boxes of visible showcase/step text elements
    const overlapInfo = await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll('[class*="showcase"], [class*="step"], [class*="cta"], h1, h2, h3, p'));
      const visible = candidates
        .map((el) => {
          const r = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return { el, r, opacity: parseFloat(style.opacity), text: el.textContent.trim().slice(0, 40) };
        })
        .filter((x) => x.opacity > 0.05 && x.r.width > 0 && x.r.height > 0 && x.text.length > 0);

      const overlaps = [];
      for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          const a = visible[i].r;
          const b = visible[j].r;
          const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
          const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          if (ix > 20 && iy > 10) {
            overlaps.push({
              a: visible[i].text,
              aOpacity: visible[i].opacity,
              b: visible[j].text,
              bOpacity: visible[j].opacity,
              overlapArea: Math.round(ix * iy),
            });
          }
        }
      }
      return { visibleCount: visible.length, overlaps };
    });

    report.push({
      pct,
      scrollY: target,
      canvasInfo,
      overlapInfo,
      console: [...consoleLog],
    });
  }

  await page.waitForTimeout(300);
  await browser.close();

  fs.writeFileSync(
    path.join(OUT, 'report.json'),
    JSON.stringify({ maxScroll, report }, null, 2)
  );

  console.log('=== SCROLL AUDIT REPORT ===');
  console.log('maxScroll:', maxScroll);
  for (const step of report) {
    console.log(`\n--- ${step.pct}% (scrollY=${step.scrollY}) ---`);
    console.log('canvases:', JSON.stringify(step.canvasInfo));
    if (step.overlapInfo.overlaps.length) {
      console.log('TEXT OVERLAPS:', JSON.stringify(step.overlapInfo.overlaps, null, 2));
    } else {
      console.log('text overlaps: none');
    }
    const errs = step.console.filter((c) => c.type === 'error' || c.type === 'pageerror');
    if (errs.length) {
      console.log('CONSOLE ERRORS:', JSON.stringify(errs, null, 2));
    }
    const warns = step.console.filter((c) => c.type === 'warning');
    if (warns.length) {
      console.log('console warnings:', JSON.stringify(warns.map(w=>w.text)));
    }
  }
})().catch((e) => {
  console.error('AUDIT SCRIPT FAILED:', e);
  process.exit(1);
});
