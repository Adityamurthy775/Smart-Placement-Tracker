# Changelog — Smart Placement Tracker (frontend)

Chronological log of frontend work. Newest session last. Use headings loosely:
**Added** / **Changed** / **Fixed** / **Removed**.

Companion document: [`handover.md`](./handover.md) — read that first for the
stack audit (in particular: **this project does not use TypeScript**), the
command list, and the DyeWhorl theming rules.

---

## Session 2 — WebGL ink hero, expanding cards, docs

### Added

- **`frontend/src/components/ui/dye-whorl.jsx`** — full-bleed WebGL2
  ink-fluid background. A real incompressible Navier–Stokes solver: velocity
  advection, vorticity confinement, buoyancy measured against a local mean,
  divergence-free curl-noise stirring, Jacobi pressure projection, MacCormack
  dye transport with the flux-limiter clamp, then a display ramp built from the
  theme's own colours. Five ambient injectors plus a periodic "drop" keep it
  alive; the pointer stirs it. Includes a 4-step quality ladder, viewport/tab
  sleeping, coalesced resize that carries the live field, WebGL context-loss
  handling and a `prefers-reduced-motion` still frame.

  Ported from its original TSX to JSX to match this project — no TypeScript
  here. Only type syntax was removed: `interface DyeWhorlProps`, the
  `RGB`/`FBO`/`Double` aliases, generic parameters, the `private` constructor
  parameter, `!` non-null assertions and `as` casts. No logic was rewritten.
  ~1630 lines, no third-party dependencies, one file.

- **`frontend/src/components/ExpandCards.jsx`** — 4-row vertical expanding-card
  accordion, replacing the carousel on the landing page. Single-open behaviour;
  expand/collapse via a `grid-template-rows: 0fr → 1fr` transition (no height
  measuring, no animation library). Left column holds the rows and their copy;
  the right column shows a circular image and a large number for the active row,
  crossfading on opacity/scale while the panel tints toward that row's colour.
  Reuses the carousel's Unsplash images and the site palette. All content sits
  in the `CARDS` array at the top of the file.

- **`handover.md`** (repo root) — stack audit (shadcn ✅, Tailwind v4 ✅,
  **TypeScript ❌ plus instructions to add it**), command list, file map,
  DyeWhorl integration and theming, ExpandCards notes, gotchas, verified state,
  next steps.

- **`changelogs.md`** (repo root) — this file.

- **`frontend/src/index.css`** — `@import "tw-animate-css";`.

- **`frontend/src/index.css`** — bare-hex variables for DyeWhorl in `:root`
  (`--background: #000000`, `--foreground: #f2edf5`, `--border: #262626`,
  `--ns-muted: #4d4d4d`, `--ns-accent: #006bff`) and `.dark { --ns-muted:
  #8f8f8f; }`. These are plain hex on purpose: DyeWhorl's `parseHex` accepts
  only `#rgb`/`#rrggbb` and silently falls back otherwise. They live beside the
  `@theme` block, not instead of it — `@theme` emits `--color-*` names, which
  are a different namespace.

### Changed

- **`frontend/src/components/Home.jsx`** — swapped
  `import CarouselSection from './CarouselSection'` for
  `import ExpandCards from './ExpandCards'`, and `<CarouselSection />` for
  `<ExpandCards />`. `CarouselSection` stays on disk so a revert is two lines.

- **`frontend/src/components/HeroSection.jsx`** — the ink background is now the
  first child of `<section id="home">`, in a `absolute inset-0 z-0` wrapper,
  with `<DyeWhorl className="h-full w-full" />` inside. The hero copy keeps its
  `relative z-10` box. The section's existing `gradient-yaten` class was kept
  deliberately: it is the fallback when WebGL2 or `EXT_color_buffer_float` is
  unavailable, in which case DyeWhorl renders nothing at all.

### Fixed

- **`dye-whorl.jsx`** — ref mirroring moved out of the render body into a
  `useEffect`, clearing three `react-hooks/refs` errors (writing
  `ref.current` during render). A redundant `eslint-disable` for
  `react-hooks/exhaustive-deps` was dropped; ESLint is now clean on all four
  touched files.

### Removed

- Nothing deleted this session. `CarouselSection.jsx` and
  `ui/CircularCarousel.jsx` were deliberately left on disk (unused, no longer
  imported) so the section swap can be reverted in two lines.

### Verification

```
npm run build                            -> exit 0 (~1.7s), 2005 modules
npx eslint <4 touched files>             -> exit 0, 0 problems
npm run dev -- --port 5199 --strictPort  -> HTTP 200; module transformed
```

---

## Session 1 — landing-page build-out

_(Summarised; this session predates the changelog.)_

### Added

- `Preloader` — a first-paint overlay, so the hero never flashes a
  half-styled frame.
- `ui/how-it-works.jsx` (with `ui/how-it-works-demo.jsx`) — the numbered
  process section used on the landing page.
- A `gradient-yaten` background on the hero section. This class is still on
  `<section id="home">` and is now the documented no-WebGL fallback for the ink
  layer.

### Changed

- Consolidated the landing-page palette onto the purple / navy / green set
  (`#c29bda`, `#592977`, `#a563cf`, `#64af56`, `#384678`) with `#f2edf5` text
  on `#000000` / `#0a0a0a` surfaces.

### Fixed

- **`ui/StaggeredMenu.jsx`** — the menu toggle now opens and closes reliably,
  and the item numbers no longer overlap the item labels.
- **`CarouselSection.jsx`** — the carousel's previous/next controls now
  actually change the active slide, in both directions.

### Removed

- The leftover standalone `SPT` branding element, which duplicated the header
  logo.

---

## Session 3 — themeable design tokens: Sora/Nunito, new scale, new palette

### Added

- **`@theme` type scale** in `index.css` — base `0.8rem`, each step ×4/3
  (`sm` 0.6, `base` 0.8, `xl` 1.066, `2xl` 1.421, `3xl` 1.894, `4xl` 2.525,
  `5xl` 3.366), plus `6xl`/`7xl` continuing the same scale. `xs` (0.45) and `lg`
  (0.924) were not specified and were filled in so the scale stays monotonic —
  at Tailwind's defaults both would be larger than their neighbours.
- **Unitless line-heights** for every step. Tailwind's stock values are absolute
  rem tuned for a 1rem base and destroy the rhythm against a 0.8rem base.
- **Font families** — `--font-heading: Sora`, `--font-body: Nunito`,
  `--font-sans: var(--font-body)`; `--font-weight-normal: 400`,
  `--font-weight-bold: 700`. `body` uses the body face, `h1`–`h6` the heading
  face. Google Fonts `@import` switched from Playwrite AU SA / Playwrite ES to
  Nunito + Sora.
- **Palette** — `text`/`foreground` `#071005`, `background` `#ebf3ff`,
  `primary` `#6399bb`, `secondary` `#99ceff`, `accent` `#ffc300`, plus derived
  `card`/`popover` `#ffffff`, `muted` `#dfeaf9`, `muted-foreground` `#5a6b7d`,
  `border`/`input` `#c3d7ec`, `ring` `#6399bb` and `chart-1`…`chart-5`.
- **`handover.md` §5** — a full theming section: how to edit fonts, the scale
  table with px equivalents, the palette, and what is converted vs deliberately
  left dark.

### Changed

- **`index.css`** — `:root` bare-hex vars (`--text`, `--bg`, `--primary`,
  `--secondary`, `--accent`, and the DyeWhorl set `--background`, `--foreground`,
  `--border`, `--ns-muted`, `--ns-accent`) moved to the light palette. The
  scrollbars and `::selection` now read from those vars instead of hardcoded
  hexes.
- **`index.css` `.gradient-yaten`** — the hero fallback gradient went from a
  night-sky ramp (`#B9C8F2` → `#33406E`) to a pale one (`#f6faff` → `#a9c9ea`),
  so it matches the ramp DyeWhorl now derives from the light `--background`.
  DyeWhorl needs no code change: it switches itself to "dark ink on a pale
  ground" when `luminance(--background) >= 0.5`.
- **Landing page converted to the light theme.** `Home`, `HeroSection`,
  `ExpandCards`, `FeaturesSection`, `StepsSection`, `CtaSection`, `Footer`,
  `Header` and `Preloader` now use theme tokens (`bg-background`, `bg-card`,
  `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`,
  `bg-secondary`, `bg-accent`) instead of hardcoded dark hexes, `bg-black/*`,
  `text-white`, `border-white/*` and every `red-*` accent. `ui/how-it-works.jsx`
  already used tokens and adapted with no edit; `ui/StaggeredMenu.jsx` takes its
  colours from the props set in `Home.jsx`, which were retargeted from
  red (`#dc2626`/`#7f1d1d`/`#ef4444`) to `#6399bb`/`#ffc300`.
- **Body copy stepped up** one size across the landing page (`text-sm` →
  `text-base`, micro `text-xs` → `text-sm`, card titles `text-lg` → `text-xl`)
  to offset the much more compact scale.
- **`--color-primary-foreground` is `#071005`, not white** — white on `#6399bb`
  is 3.1:1 and fails AA for body text; `#071005` is 6.3:1 and passes.
- **`Login.jsx` / `Register.jsx`** — pinned to `bg-[#0a0a0a] text-[#f2edf5]`.
  They previously inherited a dark `body`; now that `body` is light they would
  have rendered a translucent black card on a pale page. The pin keeps them
  byte-for-byte as they looked before. They remain on the old dark styling by
  agreement.

### Fixed

- Removed unused `import React from 'react'` from `CtaSection.jsx`,
  `FeaturesSection.jsx` and `StepsSection.jsx` — three pre-existing
  `no-unused-vars` errors (React 19's JSX transform doesn't need the import).

### Not done (deliberately)

- `Mainpage.jsx` (109 dark literals), `AnalyticsDashboard.jsx`, and the rest of
  the dashboard surfaces are still on the old dark styling. They keep their own
  backgrounds, so nothing regressed. Deferred to a follow-up pass.

---

## Session 4 — hero cleanup, and the overlay that was eating every click

Four bugs reported at once. Three of them turned out to share one root cause.

### Fixed

- **Clicks were being swallowed across the entire page** (the cause of "the
  header buttons don't work" and "only the first card works"). `Home.jsx`
  wrapped `StaggeredMenu` in
  `pointer-events-none [&>*]:pointer-events-auto`. The component renders a
  `<div className="sm-scope z-40 fixed top-0 left-0 w-screen h-screen">`, so the
  arbitrary-child selector made that **full-viewport, `z-40` element a click
  target at every scroll position**. Every click on the page landed on it and
  went nowhere. The override was unnecessary: the component's own CSS already
  re-enables pointer events on exactly the toggle
  (`.staggered-menu-header > *`) and the panel (`pointer-events-auto` on the
  panel element), and `pointer-events` is inherited, so the wrapper now only
  carries `pointer-events-none`. Documented as a "never do this" in
  `handover.md` §7 item 10.
- **The rotating-word badge rendered as a hard block.** `bg-secondary/60` was
  far too solid at the new compact type scale; dropped to `bg-secondary/40`.
- **Hero body copy was low-contrast over the ink.** The paragraph sat directly
  on dark plumes at `text-muted-foreground` (#5a6b7d); moved to
  `text-foreground/80` for legibility on a busy background.

### Changed

- **`HeroSection.jsx` — the hero now carries only the ink.** Removed the
  `gradient-yaten` class from the `<section>` (the section is now plain
  `bg-background`, which doubles as the no-WebGL fallback), the grid overlay
  div, and the 700px blurred glow orb. `.gradient-yaten` is left defined in
  `index.css` but unused, so the old look is one class away.
- **`ExpandCards.jsx` — the cards expand further and read better.** Row padding
  trimmed (`py-5` → `py-4`) to make room, expanded body padding raised
  (`pb-7` → `pb-9 pt-1`), body copy `text-base` → `text-lg` and `max-w-md` →
  `max-w-lg`, eyebrow `text-sm` → `text-base`, row titles `text-xl` → `text-2xl`
  (`sm:text-3xl`), index badge `text-sm` → `text-base`, mobile image
  `h-20` → `h-24`, right-panel circle `h-56` → `h-64`. **Added `min-h-0` to the
  clipper** — without it the grid item's min-content height wins and the row
  cannot collapse cleanly.
- **`ExpandCards.jsx` — added `id="showcase"`** to the section so the cards are
  deep-linkable (`/#showcase`). The other landing sections already carry ids
  (`#home`, `#features`, …); this one was the only gap.

### Added

- **`dye-whorl.jsx` diagnostics.** Every silent failure now reports itself:
  - `console.warn` + `data-dye-whorl-status="unsupported"` when WebGL2 /
    `EXT_color_buffer_float` is missing;
  - `console.error` with `getShaderInfoLog` / `getProgramInfoLog` on a shader
    compile or link failure, plus `data-dye-whorl-status="shader-error"`;
  - `console.info` + `data-dye-whorl-status="static"` when the loop is
    intentionally suppressed (reduced-motion, or the `paused` prop) — a still
    tank is otherwise indistinguishable from a broken one.
  Absence of the attribute means the solver initialised and is animating.
- **Loop self-heal.** `loop()` now calls `allocate()` if no render targets exist,
  so a first sizing pass that ran before layout settled can no longer leave the
  canvas permanently blank.
- Renamed the GLSL local `gl` → `gLen` in `FORCE_SRC`; it shadowed nothing
  legal but is exactly the shape of a reserved `gl_` name.

### Verified

Rendered the landing page in headless Chrome (WebGL via SwiftShader) at
1440×900 and inspected the result:

- ink renders as dark plumes on the pale ground — confirmed working, not broken;
- hero class is `relative min-h-screen w-full overflow-hidden bg-background`;
- no glow-orb element, no grid-overlay element in the DOM;
- `<canvas width="752" height="794">` sized and live;
- no `data-dye-whorl-status` attribute ⇒ the solver initialised and is animating
  (not `unsupported`, not `shader-error`, not `static`);
- all four cards present with `aria-expanded`.

---

## 2026-01-10 — Landing-page colour spec applied

The five palette tokens were already correct; this pass changed **only how they
are used**, and added one measurement harness to prove it.

### Changed

- **`HeroSection`** — sub-text `foreground/80` → `/75` per spec. The main CTA is
  now **Accent fill** (`#ffc300` + dark label) instead of Primary, and a second
  **outlined Primary** "Learn More" button was added next to it, scrolling to
  `#features`. The eyebrow chip and the three feature pills moved from a Primary
  wash to a **Secondary** field with a Primary icon and a Text label. "Live
  Metrics" became an **Accent** chip; the figures stay Text. The rotating
  headline word is now Text, not Primary/Accent.
- **`ExpandCards`** — the per-card `style={{ color: c.color }}` on the title, the
  eyebrow and the big figure are **gone**: `#ffc300` on white is 1.4:1 and the
  labels were effectively invisible. Accent survives as an open-row marker bar,
  a dot beside the eyebrow and a rule under the figure. Card borders went
  `border-border` → `border-secondary`; the index numeral went `/40` → `/60`
  (1.9:1 → 5.0:1).
- **`Footer`** — inverted to the spec's closing band: `bg-foreground` with
  `text-background` type. Because the ground is now `#071005`, the old
  `text-muted-foreground` grey (3.9:1 there) was replaced with
  `text-background/80` (17.3:1), and hovers moved to Accent, which is legal on
  that ground and nowhere else.
- **`CtaSection` / `FeaturesSection` / `HowItWorks` / `StepsSection`** — main
  button to Accent; cards to `bg-card` + `border-secondary`; icon tiles to a
  Secondary field with a Primary mark; every `text-primary` eyebrow to
  `text-foreground`.
- **`FeaturesSection`** — gained `section-wash`, a new helper in `index.css`
  that lays Secondary at 25% over Background and bleeds to the viewport edge
  (the sections are max-width, so a background colour alone would stop short).
  It carries `isolation: isolate` so the `-1` layer cannot slide behind the page.
- **`Header`** — navbar is now a full-bleed `bg-background` band with a thin
  Secondary bottom rule, instead of a transparent max-width row.
- **`StaggeredMenu`** — new `linkHoverColor` prop (`--sm-link-hover`). Nav
  labels were `#000` with an **Accent** hover, i.e. 1.4:1 on the white panel;
  they are now Text with a **Secondary** hover field. The "Socials" title and
  the item numbering moved off Accent too. Prelayer colours went
  `primary/accent` → `secondary/primary`. `Home.jsx` passes the new prop.
- **`slot-headline`** — the inline `style={{ color }}` on the icon was removed.
  An inline style beats `iconClassName`, which made it impossible to colour the
  mark Primary while the word stayed Text; that is exactly what the spec needs.

- **`dye-whorl.jsx` light ramp re-floored (the hero's contrast floor).** The
  dark end was `mixRGB(fg, black, 0.55)` ≈ `#030701`, i.e. 1.05:1 against the
  hero's Text — 5.4% of the hero measured under 4.5:1 and the plumes ran
  straight through the heading. Every light-branch stop is now a mix of
  `--background` toward `--ns-muted`, ending at `c4 = mixRGB(bg, muted, 0.74)`
  ≈ `#808e9f`. `cov` is clamped in the display shader and both later passes
  lighten, so `c4` is a hard bound, not a typical value: re-measured at
  **5.77:1, 0 of 1,234,100 pixels below 4.5:1**. `gamma` / `rim` / `inkK` are
  untouched, so the plumes keep their motion and density structure. The
  `.gradient-yaten` no-WebGL fallback was moved to the same floor (`#7f9dc4`,
  7.1:1) so a machine without WebGL does not get a lighter hero than one with it.

- **The hero stopped responding to the cursor inside itself.** The content
  wrapper is `w-full` and sits at `z-10` over the tank at `z-0`, so as a plain
  block it consumed every `pointermove` before it could reach `DyeWhorl`'s
  wrap. The ink only ever stirred in the slivers of page *outside* the
  `max-w-7xl` box — which is why it looked alive everywhere except under the
  cursor. The wrapper is now `pointer-events-none` and the two CTAs opt back in
  with `pointer-events-auto`. Deliberately **not** `[&>*]:pointer-events-auto`:
  the grid children are as wide as the text column, so that reintroduces the
  same swallow.
- **`Login` and `Register` converted off the dark theme.** Both were still
  `#0a0a0a` pages with `text-white` headings, a `bg-black/50` card and
  `border-white/10` — the last dark screens on an otherwise light site. They
  now use `bg-background` + a `bg-card` form with a `border-secondary` edge.
  Submit buttons moved from `bg-white` (invisible against a white card) to
  `bg-accent` at 12.0:1; the divider rules to `bg-border`; subtitles to
  `text-muted-foreground`; the "or continue with" label off `text-gray-500`
  (3.7:1 on white).
- **`Styles/common.js` `authInput` rebuilt for the light card.** It was
  `border-white/10 bg-black/40 text-white placeholder:text-gray-500` with a red
  focus ring — copied onto `bg-card` that is white-on-white. Now
  `border-border bg-card text-foreground placeholder:text-muted-foreground`,
  Primary focus ring, `destructive` on `aria-invalid`. One edit converted all
  nine fields on both pages.
- **`Register` role chips off-palette.** They were `#111111` fills with a
  `blue-900/blue-200` selected state. Now a `bg-card` chip with a
  `border-secondary` edge, turning `bg-accent` with `text-accent-foreground`
  (12.0:1) when selected.
- **`Login` forgot-password modal** off `bg-black/60` / `bg-black/70` to
  `bg-card` over a `bg-foreground/50` scrim, with the reset `Continue` button on
  Accent.
- **Error and status text off `text-red-400`.** `#f87171` is ~3.0:1 on a light
  card, so the three field errors, the error banner and the password-mismatch
  line all moved to `text-destructive` on `bg-destructive/10`. The success line
  was `text-green-400` at **1.5:1** — that is not a colour, that is a blank —
  and is now `text-foreground`; the ramp has no green, and the wording already
  carries the outcome.
- **`Preloader` text is black only.** The `PLACEMENT` letters flipped to
  `text-primary` during the hold phase (2.76:1, a visible blue flash). They are
  now `text-foreground` throughout — all 9 letters measure `#071005`. The
  progress bar keeps its `primary → accent` gradient; that is a 4px decorative
  fill, not text.
- **`SlotLoader` de-redded.** It passed `SLOT_ITEMS`' hardcoded hexes
  (`#ef4444`, `#22c55e`, …) through as inline `color` over a
  `bg-red-500/20 text-red-300` badge — 3.2:1 for the badge text and ~3.6:1 for
  red on the light ground. Rotating words are now Text, the badge is a
  `bg-secondary/40` field, the mark is Primary, and the help line is
  `text-muted-foreground`. The dormant `SlotHeadline` default badge
  (`bg-red-500/15 text-red-400`) moved too.
- **`ExpandCards` gained a progress rail outside the card box.** A 6px track
  between the section heading and the accordion, with an Accent fill whose width
  tracks the open card (25 / 50 / 75 / 100%) and three 1px ticks at the stops.
  The fill transitions on `width` in **both** directions, so opening 04 extends
  it and going back to 01 drains it. It is `aria-hidden` — the rail is
  decorative and `aria-expanded` on the four buttons already carries the state.
  Verified: 25 → 50 → 75 → 100 → 25 → 75 across six clicks with `aria-expanded`
  tracking at every step, and the rail's bottom edge sitting 32px above the card
  box, i.e. genuinely outside it.
- **`Preloader` progress bar made visible.** It was not broken, it was
  mistimed: `w-0` → `w-full` with `duration-[2800ms]`, but the fill only got the
  1200ms `hold` phase before `exit` began fading the overlay, so it crawled to
  roughly 43% and disappeared — which reads as "there is no bar" rather than
  "the bar is slow". Replaced with a `scaleX` keyframe animation sized to the
  real timeline (2800ms, landing at 100% exactly as the exit fade starts), so it
  can no longer drift out of sync with the phase timers. Also `h-1` → `h-1.5` and
  a stronger track (`foreground/10` → `/15`). Sampled live: 0.4% at 400ms rising
  monotonically to 100% at ~3.0s, unmounted at 3.6s. A
  `prefers-reduced-motion` rule collapses it to 1ms.
- **Horizontal scrollbar removed — `100vw` was the cause.** The page carried a
  persistent horizontal scrollbar at every width. The offender was
  `.section-wash::before`, which full-bleed the features band with `width: 100vw`
  on a `max-width` section. `100vw` includes the vertical scrollbar,
  `clientWidth` does not, so the centred band overshot the layout viewport on
  **both** sides — measured `-5 → 1435` against a `clientWidth` of 1430, which
  is exactly the 5px that surfaced as `scrollWidth`. Fixed at the root rather
  than hidden with `overflow-x: clip`: `FeaturesSection`'s `<section>` is now
  full-bleed and the `max-w-7xl` column moved inside it, so the band is a plain
  `background-color` and the pseudo-element is gone (`::before` computes
  `content: none`). The `.sm-scope` / `w-screen` elements the probe also flagged
  are `position: fixed` and contribute nothing to document scroll — confirmed
  by `scrollWidth === clientWidth` at 390, 768, 1024, 1280 and 1440.

### Added

- A CDP contrast harness that walks every text node in `main` / `header` /
  `footer`, composites each element's own background down the ancestor chain
  (so a button is measured against its own fill, not its parent's), and applies
  the right WCAG threshold per size/weight.
- A PNG sampler that decodes the screenshot and reports the darkest pixel and
  the share below a given ratio. The hero has to be measured with its copy
  hidden (`visibility: hidden` on the content wrapper), or the heading's own
  glyphs are indistinguishable from an ink that is too dark.

### Verified

- **28 unique text styles, 0 contrast failures.** Worst passing pair 4.88:1.
  `Get Started` 12.03:1, `Login` 6.27:1, `Signup` 11.63:1, footer type
  17.32:1. Re-run after the ramp change: still 0 / 28, worst still 4.88:1.
- **Hero ink: darkest pixel `#7f8e9e` = 5.77:1, 0 of 1,234,100 pixels below
  4.5:1** (was `#030701` at 1.05:1 with 5.4% failing). The heading, sub-text and
  both CTAs are now legible over every part of the tank, and the plumes still
  read as ink.
- **Hero cursor, re-tested after the `pointer-events-none` fix:** seven sample
  points spread across the hero — over the headline, the body copy, the stats
  panel and the empty gutter — all resolve via `elementFromPoint` to the
  DyeWhorl canvas, and both CTAs still compute `pointer-events: auto` and are
  top-most at their own centre. `data-dye-whorl-status` is `live`.
- **Login 0 failures / 5 text styles, Register 0 failures / 7**, worst pair on
  both 5.48:1. Home unchanged at 28 styles, 0 failures, worst 4.88:1.
- **Preloader, sampled live at 2.2s (the hold phase):** all 9 `PLACEMENT`
  letters compute `#071005`; the only other text colour on screen is `#5a6b7d`
  (the help line). No red, no primary.
- **Role chip, selected:** background `#ffc300`, border `#ffc300`, text
  `#071005`. Measured *after* letting the `:checked` recalc land — reading
  `getComputedStyle` in the same tick as the click returns the pre-toggle value
  and looks like the peer variant is broken when it is not.
- **Form surfaces measured live:** page shell `rgb(235,243,255)`,
  form `rgb(255,255,255)`, input border `rgb(195,215,236)`, submit
  `rgb(255,195,0)` / `rgb(7,16,5)`, `h2` `rgb(7,16,5)`.
- Real `Input.dispatchMouseEvent` checks: `.sm-scope` still computes
  `pointer-events: none`; `Login` and `Signup` are `REACHABLE`; "Learn More"
  scrolls to `1754` = `#features` top; the menu opens with all six links, all
  `#071005`, hover field `rgba(153,206,255,0.45)`, prelayers
  `secondary/primary`; card 2 expands to a 119px panel with real copy and
  `aria-expanded="true"`.
- Screenshots taken at 1440px for hero, cards, features and footer. The
  features wash, the Secondary borders, the Accent CTAs and the inverted footer
  all render as specified.
- `npm run build` exit 0; ESLint clean on all 19 touched files.
- Measured repo-wide lint is 39 problems (27 errors, 12 warnings) — unchanged
  by this work; see `handover.md` §8 for the per-file breakdown.
