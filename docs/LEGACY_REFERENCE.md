# Legacy Reference — salvaged values

Verbatim extraction from the old static site before `_legacy/` is deleted.
Values are copied as-is (not reformatted or reinterpreted). Source files:
`_legacy/index.html` and `_legacy/styles.css`. Line numbers are from the
baseline commit.

> Note: the live React app (`components/AccessKeys.tsx`) currently uses
> different tiers/prices (Oasis Lite $65 / Oasis Mid $89 / Oasis Unlimited $109).
> The values below are the **legacy** values only, preserved for reference.

---

## 1. Pricing tiers and prices

The legacy site has **two** tiers. Prices appear in two places in
`_legacy/index.html` — the "Concept" price block and the full "Pricing" section.

### Concept price-block (`index.html` §4, lines 355–361)
- `$49` — "Per Month · Individual"
- `$68` — "Per Month · Two People ($34 Each)"

### Pricing section (`index.html` §7, lines 411–445)
Section label: "Membership"
Heading: "Less than a crowded gym." / "More than private."

#### Tier 1 — INDIVIDUAL (lines 417–429)
- Heading: `INDIVIDUAL`
- Price: `$49`
- Sub: "Per Month · No Contract"
- Feature list:
  - The entire gym, every session
  - 24/7 keyless access
  - Full strength & cardio equipment
  - No contracts, cancel anytime
  - Windsor's only private facility
- Button: "Get Started" → `https://ironoasisgym.com`

#### Tier 2 — DUO (lines 430–442)
- Heading: `DUO`
- Price: `$68`
- Sub: "Per Month · $34 Each"
- Feature list:
  - Bring one partner, every session
  - 24/7 keyless access for two
  - Full strength & cardio equipment
  - No contracts, cancel anytime
  - Just $34 each per month
- Button: "Get Started" → `https://ironoasisgym.com`

### Other price mentions (same values, copy elsewhere in `index.html`)
- Meta description / OG (lines 9, 12): "$49/month." / "$49/Month."
- GEO/AI block (lines 266–271): "$49 per month individual. $68 per month for two people."
- Burst hero subline (line 303): "Windsor's Only Private Gym · 24/7 Access · $49/Month"

---

## 2. Exact CTA text

Button labels exactly as they appear in `_legacy/index.html`:

| Location | Line | Button text | Links to |
|---|---|---|---|
| Nav | 280 | Book Now | `#cta-section` |
| Burst hero | 304 | Book Your Private Session | `#cta-section` |
| Concept | 353 | See Pricing | `#pricing` |
| Pricing — Individual | 428 | Get Started | `https://ironoasisgym.com` |
| Pricing — Duo | 441 | Get Started | `https://ironoasisgym.com` |
| Final CTA section | 452 | Book Your Private Session | `https://ironoasisgym.com` |

Scroll hint label (not a button), lines 291–294: "Scroll"

Final CTA section copy (lines 448–452):
- Label: "Windsor, Ontario"
- Heading: "Ready to train" / "without the crowd?"
- Body: "Book your first private session and feel what training alone in a full gym is actually like."

---

## 3. Color palette (hex values)

The two source files define **different** palettes. Both are recorded verbatim.
Notably `styles.css` sets `--gold` to `#D8D8D8` even though its own header
comment says the gold is `#C9A84C` — recorded as-is, not reconciled.

### `_legacy/index.html` `:root` (lines 43–53)
```
--black:       #000000
--charcoal:    #0a0a0a
--steel:       #141414
--gold:        #C9A84C
--gold-light:  #DFC070
--chrome:      #d0d0d0
--off:         #F5F5F0
--muted:       rgba(245,245,240,0.45)
--hair:        rgba(255,255,255,0.07)
```
Other hex values used in the inline JS (3D accent + particles, lines 791–807):
```
plate color    0x1c1c1c
plate emissive 0x070707
ambient light  0x0a0a1a
gold spotlight 0xC9A84C
rim light      0xE8F0FF
key light      0xDFC070
orbiting light 0xC9A84C
particle gold  rgb(201,168,76)  (= #C9A84C)
theme-color    #000000          (meta tag, line 16)
```

### `_legacy/styles.css` header comment (line 3)
```
Brand: #000 bg · #F5F5F0 text · #C9A84C gold · #1A1A1A steel
```

### `_legacy/styles.css` `:root` (lines 9–21)
```
--black:    #000000
--steel:    #1A1A1A
--border:   #2A2A2A
--gold:     #D8D8D8          (differs from header comment #C9A84C)
--gold-dim: rgba(220,220,220,0.08)
--text:     #F5F5F0
--muted:    rgba(245,245,240,0.45)
--dim:      rgba(245,245,240,0.15)
```

Fonts (both files): Bebas Neue (headings) · Inter (body).

---

## 4. Partner-page copy

There is **no standalone partner page** anywhere in `_legacy/`. The only
"partner" copy in the legacy source is the **DUO** membership tier (a two-person
plan), reproduced here in full verbatim from `_legacy/index.html` lines 430–442:

```
DUO
$68
Per Month · $34 Each

- Bring one partner, every session
- 24/7 keyless access for two
- Full strength & cardio equipment
- No contracts, cancel anytime
- Just $34 each per month

[Get Started]  → https://ironoasisgym.com
```

Supporting partner/duo references elsewhere in `index.html`:
- Concept price block (line 360): "$68" / "Per Month · Two People ($34 Each)"
- GEO/AI block (line 269): "$68 per month for two people."

(The single literal occurrence of the word "partner" in `_legacy/` is line 435:
"Bring one partner, every session".)
