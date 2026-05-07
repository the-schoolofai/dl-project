# Design System & UX Guidelines

**Product:** Deep Learning Image Classifier
**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS 3
**Audience:** DL practitioners, data engineers, and product reviewers exploring the FastAPI inference service.

This document defines the visual language, interaction principles, and layout conventions that govern the frontend. It is the source of truth for any new screen, component, or contribution.

---

## 1. Design Philosophy

The dashboard is a **diagnostic instrument**, not a marketing surface. Every pixel should help a user reason about a model's output. Three principles drive every decision:

1. **Clarity over decoration.** Numbers, probabilities, and class labels are the protagonists. Chrome (borders, shadows, gradients) is muted so data can lead.
2. **Immediate feedback.** A prediction is a conversation: input → result → reflection. Latency, errors, and connection health must be visible without the user asking.
3. **Calm density.** Show enough on one screen to compare without scrolling, but never crowd. Whitespace is a feature, not waste.

---

## 2. Brand & Visual Identity

### 2.1 Color System

A restrained two-tone palette: **indigo** for action and identity, **slate** for structure, with semantic accents reserved for state.

| Token | Hex | Usage |
| --- | --- | --- |
| `brand-50` | `#eef2ff` | Tag backgrounds, subtle highlights |
| `brand-100` | `#e0e7ff` | Hover surfaces, secondary fills |
| `brand-500` | `#6366f1` | Range thumbs, decorative accents |
| `brand-600` | `#4f46e5` | Primary CTA, predicted class emphasis |
| `brand-700` | `#4338ca` | Pressed/hover states for primary CTA |
| `slate-50/100` | — | Card surfaces, dividers, neutral fills |
| `slate-500/600/700` | — | Body copy, secondary labels |
| `slate-900` | `#0f172a` | Headings, primary numeric values |
| `emerald-500` | — | Health: API online |
| `amber-400` | — | Health: checking / pending |
| `rose-500/600` | — | Errors, destructive hover |

**Background:** subtle vertical gradient `#f8fafc → #eef2ff` to give the dashboard atmosphere without competing with content.

**Rules of thumb**
- A surface uses at most one brand color and one neutral.
- Never put brand-on-brand text. Brand 600 on white only.
- Status colors (rose, emerald, amber) are reserved for semantic state — never decoration.

### 2.2 Typography

| Role | Style |
| --- | --- |
| H1 — page title | `text-2xl sm:text-3xl font-bold tracking-tight text-slate-900` |
| H2 — card title | `text-lg font-semibold text-slate-900` |
| Eyebrow / label | `text-xs font-medium uppercase tracking-wide text-slate-500` |
| Body | `text-sm text-slate-600` |
| Numeric — hero | `text-4xl font-semibold text-brand-600` (predicted class), `text-3xl font-semibold text-slate-900` (confidence) |
| Tabular data | `text-sm tabular-nums` — always `tabular-nums` for any number that aligns in a column |

Stack: `var(--font-sans), system-ui, sans-serif`. We rely on the system stack to keep first paint instant and the tone honest — this is a tool, not a magazine.

### 2.3 Iconography & Shape

- **Radius:** `rounded-2xl` for cards, `rounded-lg` for buttons/inputs, `rounded-full` for status dots and pills. Consistency here is what makes the layout feel intentional.
- **Borders:** `border-slate-200` is the default. Dashed borders (`border-dashed`) indicate empty placeholders.
- **Elevation:** `shadow-sm` only. We do not use heavy drop shadows — the gradient backdrop already gives surfaces depth.

---

## 3. Layout & Information Architecture

### 3.1 Page Frame

```
┌─ max-w-6xl, px-4/6/8, py-8 ─────────────────────────────┐
│  Header  ── Title + subtitle ──────────  HealthBadge    │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────── 2 cols ──────┐  ┌─── 1 col ────┐   │
│  │  PredictionForm | Result       │  │  StatsPanel  │   │
│  ├────────────────────────────────┤  │              │   │
│  │  PredictionHistory             │  │              │   │
│  └────────────────────────────────┘  └──────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Footer — API endpoint pill                             │
└─────────────────────────────────────────────────────────┘
```

A **3-column grid on `lg:`** that collapses gracefully:
- `lg`: 2-col workspace + 1-col stats rail.
- `md`: form and result side-by-side, stats below.
- `sm`: single column, vertical flow.

The constant is the **"act → see → reflect" axis**: input on the left, prediction in the middle of the user's gaze, history below for review, statistics in the periphery.

### 3.2 Card Anatomy

Every card uses the same shell so the eye learns the rhythm:

```
rounded-2xl  border border-slate-200  bg-white  p-6  shadow-sm
└─ Header row: H2 + optional contextual action (Clear, presets, etc.)
└─ Content
└─ (optional) Progress / chart row
```

Empty states use the same shell with `border-dashed` and `bg-white/60` to signal "container exists, content pending."

### 3.3 Spacing Scale

We stay within the Tailwind 4-pt scale: `gap-2 / gap-3 / gap-6`, `p-3 / p-6`, `mt-1 / mt-4 / mt-6`. Consistency matters more than precision — pick the closest step rather than introducing custom values.

---

## 4. Component Patterns

### 4.1 PredictionForm — Input Surface
- **Dual control per feature:** numeric field + range slider sharing state. Sliders give a quick sense of magnitude; numeric fields enable precision. Both must always reflect the same value.
- **Presets** sit in the header right, low-emphasis, as a quick way to seed plausible inputs.
- **Randomize** is a secondary action — same shape as primary CTA, neutral fill, paired beside the primary so the eye groups them.
- **Range thumbs** are custom-styled (`brand-600`, white border) so they feel like part of the brand and stand out against the slate track.

### 4.2 PredictionResult — Output Surface
- **Two-up hero:** predicted label (left, brand color, large) + confidence percentage (right, slate, slightly smaller). The predicted class is the answer; confidence qualifies it.
- **Probability bars:** sorted descending, predicted class painted `brand-600`, others `slate-400`. Width animates (`transition-all duration-500`) on each new prediction so the user perceives change rather than a static reload.
- Empty state is a dashed placeholder; error state replaces the card with a `rose` variant of the same shell — consistent footprint, different semantics.

### 4.3 PredictionHistory — Audit Trail
- Timestamped rolling log capped at 20 entries (recency over completeness).
- Tabular layout, `tabular-nums` for all numeric columns so digits align under each other.
- Class label shown as a `brand-50 / brand-700` pill — recognizable at a glance when scanning the table.
- "Clear" is a quiet text link, not a button — destructive but low-frequency.

### 4.4 StatsPanel — Context Rail
- 2×2 fact grid (model type, class count, prediction count, average confidence) followed by a class-distribution bar chart. This pairing answers "what model am I poking at?" and "how is it behaving across my session?"
- Bars share visual language with `PredictionResult` so users transfer the mental model freely.

### 4.5 HealthBadge — System Status
- Persistent in the header, polled every 10s.
- **Dot + label** pattern: a colored dot (emerald/amber/rose) plus a one-word state. Color alone is never the only signal — text is always present for accessibility.

---

## 5. Interaction & Motion

| Moment | Pattern |
| --- | --- |
| Button hover | Background or border shifts to `brand-700` / `brand-500` |
| Button disabled | `opacity-60 cursor-not-allowed` |
| Submitting | Button label flips to "Predicting…"; the rest of the surface stays interactive |
| Probability change | Bar widths animate over 500ms |
| Health poll | Silent in steady state; only the badge color/text changes |
| Focus | `focus:ring-1 focus:ring-brand-500` on inputs; `focus-visible` ring on slider thumbs |

**Motion principles**
- Transitions are short (≤500ms) and only on properties that meaningfully change (width, color, opacity).
- No spring or bounce — this is data, not delight.
- Nothing animates **in** on load. The first paint is the final state.

---

## 6. State Design

Every async surface must answer four questions:

| State | Treatment |
| --- | --- |
| **Empty** | Dashed-border card, muted copy ("Submit features to see a prediction") |
| **Loading** | Inline label changes (e.g. "Predicting…"), button disabled. We do not block the whole UI. |
| **Success** | Result card replaces empty/error state with a smooth bar transition |
| **Error** | Same card footprint, rose palette, plain-language message; never a stack trace |

The `HealthBadge` covers the fifth implicit state — **disconnected** — so the user can distinguish "API down" from "my input is wrong" without guessing.

---

## 7. Accessibility

- **Color contrast:** all body and label colors clear WCAG AA against their surface (`slate-600+` on white, `brand-700` on `brand-50`).
- **Color independence:** every status combines color *and* text or shape (HealthBadge dot + label, predicted-class bar + label).
- **Keyboard:** native form controls throughout; visible focus rings are not removed.
- **Semantics:** `<form>`, `<label>`, `<table>`/`<thead>`/`<tbody>`, `<dl>` for definitions, `<header>`/`<main>`/`<footer>` landmarks.
- **Reduced motion:** the few transitions we use (width, color) are short enough to be safe; if motion is added later, gate it on `prefers-reduced-motion`.

---

## 8. Responsive Strategy

| Breakpoint | Behavior |
| --- | --- |
| `< sm` (< 640px) | Single column. Header wraps; HealthBadge drops below title. Form fields stack. History scrolls horizontally. |
| `sm` (≥ 640px) | Form fields go 2-up. Padding increases. |
| `md` (≥ 768px) | Form and Result sit side-by-side. |
| `lg` (≥ 1024px) | Workspace + stats rail. Page reaches `max-w-6xl`. |

We design **mobile-first** but optimize for laptop — that's where this dashboard lives in practice.

---

## 9. Content & Voice

- **Concise.** "Run prediction," not "Click here to submit your features for prediction."
- **Functional.** Labels describe data, not personality ("Predicted class," "Class probabilities," "Avg confidence").
- **Honest about state.** "API offline" is better than "Something went wrong."
- **No jargon for jargon's sake.** Use terms a data scientist will recognize (`F1..F4`, `confidence`, `class`) and avoid invented ones.

---

## 10. Extending the System

When adding a new component, run the checklist:

- [ ] Wrapped in the standard card shell (`rounded-2xl border bg-white p-6 shadow-sm`)?
- [ ] Header is `H2` with optional right-aligned action?
- [ ] Empty / loading / error / success states all defined?
- [ ] Numbers use `tabular-nums`?
- [ ] Color paired with text or shape for any status signal?
- [ ] Mobile layout tested at `< 640px`?
- [ ] Focus rings preserved on every interactive element?
- [ ] No new colors, radii, or shadow values introduced without updating this doc?

When in doubt: **fewer styles, clearer data, calmer surface.**

---

## 11. Future Considerations

These are deliberately *not* in scope today, but the system is built to absorb them:

- **Dark mode.** Palette is already token-driven; adding a `dark:` variant requires picking a slate-900-based surface set and re-checking contrast.
- **Batch prediction view.** `api.predictBatch` exists; the natural home is a tab inside `PredictionForm` or a sibling card that drops a CSV.
- **Persistent history.** Currently in-memory. Promote to `localStorage` (or an authenticated backend) without changing the `HistoryEntry` shape.
- **Model versioning.** `StatsPanel` is the right home for a model-version selector when more than one model is served.
- **Telemetry.** Latency per prediction is computable today (we hold start/end timestamps in the submit handler) — surface it in `StatsPanel` when needed.

---

*Last updated alongside the initial dashboard release. Treat this file as living: when a pattern changes in code, change it here in the same PR.*
