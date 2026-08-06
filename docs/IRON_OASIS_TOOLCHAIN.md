# Iron Oasis V3 — Creative Toolchain

Permanent record of the creative/development skills installed for Iron Oasis V3 production. This document is a reference, not a build log — it does not track application code changes.

## Installed skills

### Newly authored (this setup)
| Skill | Location | Covers |
|---|---|---|
| `threejs-r3f` | `~/.agents/skills/threejs-r3f/` | Three.js / React Three Fiber scene architecture, cameras, lighting, materials, shaders, post-processing, WebGL performance budgeting |
| `asset-pipeline-3d` | `~/.agents/skills/asset-pipeline-3d/` | Blender export, GLB/glTF structure, Draco/Meshopt compression, texture optimization, LOD strategy |
| `ai-assisted-3d-workflow` | `~/.agents/skills/ai-assisted-3d-workflow/` | Image/video-to-3D as a photogrammetry alternative, evaluating AI-generated meshes, outsourcing briefs |

These three categories had no matching skill anywhere in the existing library and no marketplace/install mechanism exists in this environment, so they were authored from domain knowledge rather than sourced from an existing package. Treat them as a first pass — they should be corrected/extended as real production experience with this pipeline accumulates.

### Already available (pre-existing, audited and confirmed relevant)
| Skill | Covers |
|---|---|
| `design-system` | Token architecture (primitive → semantic → component), spacing/typography scales, component specs |
| `design-taste-frontend` | Anti-slop frontend design — audit-first redesigns, avoiding templated-looking UI |
| `minimalist-ui` | Editorial/minimalist visual language — relevant if a section of the site leans that direction |
| `brand` | Brand voice, visual identity, style-guide consistency |
| `ui-styling` | Component-level UI implementation (Tailwind/shadcn patterns), theming |
| `emil-design-eng` | UI polish philosophy — the invisible details, animation *decisions* (not implementation) |
| `ui-ux-pro-max` | Broad design database (styles, palettes, font pairings, UX guidelines); includes 16 GSAP motion presets and lists Three.js as one of 22 supported stacks — useful as a reference layer, not a substitute for `threejs-r3f` |
| `animation-vocabulary` | Naming an observed motion effect precisely, for briefing purposes |
| `review-animations` | Reviewing motion/animation code against a craft bar (Emil Kowalski-derived) |

### Explicitly not installed
No dedicated GSAP-implementation skill (ScrollTrigger patterns, timeline sequencing, text-splitting/reveal systems) exists in the library. `ui-ux-pro-max`'s GSAP presets are a reference/inspiration layer, not implementation guidance. If GSAP work becomes a recurring, heavy part of the V3 build, author a dedicated `gsap-motion` skill the same way the 3D skills above were authored — flagged here rather than done speculatively, since it wasn't in the original required-and-missing scope confirmed for this setup.

## When to use each skill

- **Starting a new 3D scene or hero element** → `threejs-r3f` first (architecture decisions), `asset-pipeline-3d` for whatever model feeds into it.
- **An asset is needed and none exists** → `ai-assisted-3d-workflow` to decide AI-generation vs. hand-modeling vs. outsourcing, then `asset-pipeline-3d` to get it web-ready, then `threejs-r3f` to bring it into the scene.
- **A GLB is too large, loads slowly, or looks wrong** → `asset-pipeline-3d` (compression/export checklist) before assuming it's a `threejs-r3f` (runtime) problem.
- **Establishing or checking brand/typography/spacing consistency** → `design-system` + `brand`.
- **Building or reviewing a specific UI component** → `ui-styling`, cross-checked against `design-system` tokens.
- **Judging whether a design decision looks premium or templated** → `design-taste-frontend`, `emil-design-eng`.
- **An animation needs a name to brief precisely, or needs a craft-bar review** → `animation-vocabulary`, `review-animations`.
- **Broad style/palette/font/GSAP-preset inspiration** → `ui-ux-pro-max` as a reference lookup, not as the implementation source of truth.

## Asset production workflow

```
Need identified
   │
   ├─ Asset already exists? ──yes──► asset-pipeline-3d (validate/re-export if needed) ──► threejs-r3f (scene integration)
   │
   └─ no
       │
       ├─ Needs real-world dimensional accuracy? ──yes──► classic photogrammetry capture (outside this skill set) ──► asset-pipeline-3d
       │
       └─ no ──► ai-assisted-3d-workflow
                    │
                    ├─ AI generation viable (secondary/stylized asset) ──► generate ──► screen output (topology/UV/scale) ──► retopo/cleanup in Blender ──► asset-pipeline-3d ──► threejs-r3f
                    │
                    └─ Hero asset / needs real craft ──► outsourcing brief (ai-assisted-3d-workflow) ──► vendor delivers .blend ──► asset-pipeline-3d ──► threejs-r3f
```

Every asset — regardless of origin — passes through the `asset-pipeline-3d` export/compression/validation checklist before it is considered scene-ready. Nothing goes into `threejs-r3f` scene work unvalidated.

## Future outsourcing workflow

For hero-tier 3D assets or work exceeding in-house Blender capacity, use `ai-assisted-3d-workflow`'s brief structure:

1. Reference pack (real photos/video + moodboard, explicitly marked as reference)
2. Technical spec (triangle budget, texture resolution/maps, delivery format)
3. Scale/orientation spec (units, up-axis, origin placement)
4. Usage context (camera distance, lighting rig) so the vendor doesn't over-invest in unseen detail
5. Blockout/low-poly review checkpoint before full detail work
6. Acceptance criteria tied directly to `asset-pipeline-3d`'s validation checklist (file size budget, glTF validation, applied transforms) — not left implicit

This keeps vendor deliverables held to the same bar as in-house assets, and gives a concrete rejection basis (fails validation → not accepted) rather than a subjective one.

## Maintenance note

This document and the three authored skills reflect a first pass done without hands-on production mileage on this specific pipeline. Revisit and correct them (tool choices, budgets, thresholds) once real assets have gone through the full pipeline on Iron Oasis V3.
