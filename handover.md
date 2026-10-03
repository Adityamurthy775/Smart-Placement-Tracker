# Handover — Smart Placement Tracker (frontend)

_Last updated: 2026-01-10_

This document covers the **frontend** (`frontend/`) only. The backend
(`backend/`) and the MongoDB models were not touched. Read §1 first — there is
one stack decision in there (no TypeScript) that surprises people.

---

## 1. Stack audit

| Piece | Status | Notes |
| --- | --- | --- |
| React | ✅ 19.2 | `react` / `react-dom` 19.2.5, `react-router` 7 |
| Vite | ✅ 8.0 | `@vitejs/plugin-react` 6 |
| Tailwind CSS | ✅ 4.3 | via `@tailwindcss/vite`. **There is no `tailwind.config.js`** — v4 keeps config in CSS |
| shadcn/ui | ✅ | `shadcn` 4.21 + `radix-ui` 1.6, `class-variance-authority`, `clsx`, `tailwind-merge` |
| TypeScript | ❌ **not installed** | see §1.1 |
| Animation | ✅ | `gsap` 3.13 + `@gsap/react`, `lenis` 1.3 (smooth scroll), `tw-animate-css` |
| Charts | ✅ | `chart.js` 4 + `react-chartjs-2`, `recharts` 3 |
| Forms / email / auth | ✅ | `react-hook-form`, `@emailjs/browser`, `@react-oauth/google` |
| Excel export | ✅ | `xlsx` |

### 1.1 TypeScript is NOT set up (and that is deliberate here)

The whole app is plain **JSX**. There is no `tsconfig.json`, no `typescript`
dependency, and not one `.ts`/`.tsx` file. `@types/react` and
`@types/react-dom` *are* in `devDependencies`, but nothing consumes them —
they were added for editor autocomplete and are inert.

The ink background (`src/components/ui/dye-whorl.jsx`) arrived as a `.tsx`
source. It was ported to JSX rather than migrating the project, because
migrating means every existing `.jsx` file, the ESLint config, the Vite config
and the shared `ui/` primitives all have to change at once for no functional
gain. The port was mechanical — everything below was deleted, nothing was
rewritten:

- the `interface DyeWhorlProps` and the `RGB` / `FBO` / `Double` type aliases
- generic parameters on `WeakMap<K, V>`, `useRef<T>()`, `useState<T>()`
- `private` on the `Solver` constructor parameter (`constructor(canvas)`)
- non-null assertions `gl!` → plain `gl`
- `as` casts, e.g. `as EventListenerOptions`
- explicit `: WebGL2RenderingContext | null` annotations on class fields

The JSDoc block above `DyeWhorl` was kept, so editors still surface prop
types. **If you add new files, write them as `.jsx` to match.**

### 1.2 How to add TypeScript later (if you want it)

1. `cd frontend && npm i -D typescript`
2. Create `frontend/tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "lib": ["ES2022", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "moduleResolution": "bundler",
       "jsx": "react-jsx",
       "strict": true,
       "noEmit": true,
       "allowJs": true,
       "checkJs": false,
       "skipLibCheck": true,
       "isolatedModules": true,
       "paths": { "@/*": ["./src/*"] }
     },
     "include": ["src"]
   }
   ```
   `allowJs: true` + `checkJs: false` is what lets you migrate one file at a
   time instead of all at once.
3. Add `"typecheck": "tsc --noEmit"` to `scripts` in `package.json`.
4. Rename files `.jsx` → `.tsx` incrementally. Vite needs no config change
   (`@vitejs/plugin-react` handles both).
5. In `eslint.config.js`, add `typescript-eslint` and switch the `files` glob
   to `**/*.{js,jsx,ts,tsx}`.

Do not rename `vite.config.js` or `eslint.config.js` until you have
`typescript` installed — they load before any TS tooling exists.

---

## 2. Commands

Run everything from `frontend/`:

```bash
npm install       # first time only
npm run dev       # Vite dev server (default :5173)
npm run build     # production build -> frontend/dist
npm run preview   # serve the built bundle
npm run lint      # eslint .
```

To pin a port (useful when 5173 is busy):

```bash
npm run dev -- --port 5199 --strictPort
```

The build is the fastest way to catch a broken import or a syntax error: ~2s.
`npm run build` currently ends with a *chunk-size warning* (the main bundle is
~1.17 MB / ~383 KB gzipped). That warning is pre-existing and is not an error.
If you want it gone, add a `build.chunkSizeWarningLimit` or code-split the
dependency-heavy routes.

---

## 3. Where things live

```
frontend/src/
├── App.jsx                       routes
├── main.jsx                      root render + Lenis smooth scroll
├── index.css                     Tailwind v4 entry, @theme, design tokens
├── RootLayout.jsx                header/footer shell
└── components/
    ├── Home.jsx                  landing page composition
    ├── HeroSection.jsx           hero  (the ink background lives here)
    ├── ExpandCards.jsx           expanding-cards section (replaced the carousel)
    ├── FeaturesSection.jsx
    ├── StepsSection.jsx
    ├── CtaSection.jsx
    ├── Header.jsx  Preloader.jsx
    └── ui/
        ├── dye-whorl.jsx         the WebGL fluid
        ├── StaggeredMenu.jsx     overlay nav
        ├── slot-headline.jsx
        ├── how-it-works.jsx  how-it-works-demo.jsx
        ├── stacked-cards.jsx  story-scroll.jsx
        ├── gradient-bars-background.jsx
        ├── chart.jsx  button.jsx  glyph-portal.jsx
```

`Home.jsx` renders, in order: `StaggeredMenu`, `HeroSection`, `ExpandCards`,
`FeaturesSection`, `HowItWorks`, `StepsSection`, `CtaSection`.

---

## 4. The ink background (DyeWhorl)

`frontend/src/components/ui/dye-whorl.jsx` — a real incompressible
Navier–Stokes solver on WebGL2 (advection → vorticity confinement + buoyancy →
Jacobi pressure projection → MacCormack dye transport → display ramp).
~1630 lines, zero dependencies, one file, self-contained.

### 4.1 Where it is mounted

`HeroSection.jsx`, as the **first child** of `<section id="home">`:

```jsx
<section id="home" className="relative min-h-screen w-full overflow-hidden bg-background">
  {/* Ink in still water — the only thing behind the hero copy. */}
  <div className="absolute inset-0 z-0">
    <DyeWhorl className="h-full w-full" />
  </div>
  ...
  <div className="relative z-10 w-full max-w-7xl ...">   {/* hero copy */}
```

Two things to keep if you ever move it:

- the wrapper stays `z-0` and the content stays `z-10`, or the hero copy stops
  receiving clicks;
- `bg-background` on the `<section>` is the no-WebGL fallback. If WebGL2 or
  `EXT_color_buffer_float` is unavailable, `DyeWhorl` renders nothing at all and
  the flat background shows through. Do not remove it.

**The hero carries nothing else.** The `gradient-yaten` class, the grid overlay
and the glow orb were all removed on request — anything layered over the ink
competes with it. The `.gradient-yaten` rules are still defined in `index.css`
but unused, so the old look is one class away if you want it back.

### 4.2 Props

| Prop | Default | Meaning |
| --- | --- | --- |
| `speed` | `1` | Overall simulation rate. The only effect dependency — changing it tears down and rebuilds the GL context, so treat it as mount-time config |
| `density` | `1` | Ink injected per second by the ambient sources, `0..2` |
| `stir` | `1` | How hard the pointer stirs, `0..2` |
| `paused` | `false` | Freezes on a *developed* still frame (it spins 60 steps first). Safe to toggle at runtime — polled every 140ms, not an effect dependency |
| `children` | — | Rendered in a `relative z-[1]` box over the canvas |
| `className` / `style` | — | Forwarded to the wrapper |

`paused` is the prop to reach for when motion must stop. Do **not** reach for
`speed={0}` — that re-initialises everything.

### 4.3 Theming — the one rule you must not break

`DyeWhorl` does not hardcode its colours. On mount, and again whenever
`<html class="...">` changes (a `MutationObserver`), it reads five CSS custom
properties off `document.documentElement` via `getComputedStyle` and builds its
ramp from them:

| Variable | Used for | Value in `index.css` now |
| --- | --- | --- |
| `--background` | empty tank, vignette target, and the light/dark switch | `#ebf3ff` (light → the solver renders dark ink) |
| `--foreground` | the densest ink | `#071005` |
| `--border` | a mid stop | `#c3d7ec` |
| `--ns-muted` | the haze band | `#5a6b7d`; `.dark` → `#8f8f8f` |
| `--ns-accent` | the "you just touched this" tint | `#ffc300` |

**`parseHex` in `dye-whorl.jsx` only accepts `#rgb` or `#rrggbb`.** Anything
else — `rgba(...)`, `hsl(...)`, a colour name, a `var()` chain that resolves to
one of those — is rejected and silently falls back to hardcoded light-theme
defaults. The ink then looks wrong and nothing is logged.

So: if you restyle the site, re-check that all five are still plain hex. This is
why `index.css` carries a small set of *bare-hex* aliases alongside the `@theme`
block. Tailwind v4's `@theme` emits `--color-background`,
`--color-foreground`, etc. — a different name space from the bare names:

```css
@theme { --color-background: ...; }   /* what Tailwind utilities read */
:root  { --background: #000000; }      /* what DyeWhorl reads          */
```

Do not "tidy up" that duplication by deleting the `:root` block.

The ramp inverts on luminance: `luminance(--background) < 0.5` gives light ink
on dark fluid, otherwise dark ink on pale fluid, each with its own
gamma / rim / ink-coefficient. To retune the look, edit the constants inside
`readColors()` (colour) and the `TIERS` ladder (performance) — not the GLSL,
unless you specifically mean to change the simulation.

#### `c4` is a contrast floor, not a taste call

In the light branch, `c4` is the darkest colour the component can ever produce.
The display shader evaluates `ramp(cov)` with `cov` clamped to `0..1`, and both
passes that come after it — the freshness tint and the vignette — move toward
lighter colours. So `c4` is a hard bound, which makes it the one ramp value with
a pass/fail condition on it: the hero copies Text (`#071005`) over this tank, so
`c4` has to clear **4.5:1** against Text.

`c4 = mixRGB(bg, muted, 0.74)` → about `#808e9f`, measured at **5.77:1**. The
stops are all mixes of `--background` toward `--ns-muted`, tuned in order:
17.3 / 14.3 / 10.7 / 7.9 / 6.0.

It used to be `mixRGB(fg, black, 0.55)` ≈ `#030701` — 1.05:1 — which put the dark
cores straight through the heading and the paragraph (5.4% of the hero's pixels
measured under 4.5:1). If you retune the ramp, re-measure the floor rather than
eyeballing it: screenshot with the hero copy hidden and find the darkest pixel.

The `.gradient-yaten` fallback in `index.css` is held to the same floor
(`#7f9dc4`, 7.1:1) so a machine without WebGL does not get a hero that is
lighter than the one with it.

### 4.4 Performance behaviour (why it will not cook a laptop)

- Ambient injectors keep the tank alive; the pointer only adds to it. The whorl
  layer sits *behind* the hero copy, so pointer events over text never reach the
  canvas — the injectors are what you see, not the pointer.
- A 4-step quality ladder (sim resolution, dye resolution, Jacobi iterations,
  MacCormack on/off, display scale) steps down after ~1.8s of missed frames and
  climbs back only after a long clean stretch, doubling the wait after each
  failure so a marginal machine stops probing.
- The loop sleeps when the element scrolls out of view (`IntersectionObserver`)
  and when the tab is hidden (`visibilitychange`).
- Resize is coalesced to one reallocation per animation frame, and it **carries
  the live field across** instead of re-seeding — dragging a window does not
  restart the ink.
- `prefers-reduced-motion: reduce` renders one developed still frame and never
  starts the loop. Pointer movement still contributes a single step per move.

---

## 5. Theming — fonts, type scale, palette

Everything lives in the `@theme` block at the top of
`frontend/src/index.css`. Change it there and it propagates to every utility
class. There is **no `tailwind.config.js`** — Tailwind v4 keeps its config in
CSS.

### 5.1 Fonts

```css
--font-heading: 'Sora', ui-sans-serif, system-ui, sans-serif;
--font-body:    'Nunito', ui-sans-serif, system-ui, sans-serif;
--font-sans:    var(--font-body);
--font-weight-normal: 400;
--font-weight-bold:   700;
```

Loaded from Google Fonts by the `@import` on line 1 of `index.css`. `body` uses
`--font-body`; `h1`–`h6` use `--font-heading`. Utilities you get:
`font-heading`, `font-body`, `font-sans`, `font-normal`, `font-bold`.

To swap a face, change both `--font-*` values **and** the `@import` URL.

### 5.2 Type scale

Base `0.8rem`, each step ×4/3:

| Token | rem | px @16px root |
| --- | --- | --- |
| `text-xs` | 0.450 | 7.2 |
| `text-sm` | 0.600 | 9.6 |
| `text-base` | 0.800 | 12.8 |
| `text-lg` | 0.924 | 14.8 |
| `text-xl` | 1.066 | 17.1 |
| `text-2xl` | 1.421 | 22.7 |
| `text-3xl` | 1.894 | 30.3 |
| `text-4xl` | 2.525 | 40.4 |
| `text-5xl` | 3.366 | 53.9 |
| `text-6xl` | 4.488 | 71.8 |
| `text-7xl` | 5.985 | 95.8 |

`sm` → `base` → `xl` and up are the values from the brief. `xs` and `lg` were
not specified and were filled in to keep the scale monotonic — `xs` as
`sm` ÷ 4/3, `lg` as the half-step √(`base` × `xl`). If they are left at
Tailwind's defaults, `text-lg` (1.125rem) and `text-xs` (0.75rem) both come out
*larger* than their neighbours and the scale inverts.

Line-heights are unitless ratios on purpose: Tailwind's stock values are
absolute rem tuned for a 1rem base, and against a 0.8rem base they destroy the
rhythm.

**This scale is much smaller than Tailwind's default** — `text-base` is 12.8px,
not 16px, and `text-sm` is 9.6px. Body copy on the landing page was moved up a
step (`text-sm` → `text-base`, micro-labels `text-xs` → `text-sm`) so it stays
readable. If it still reads small, the highest-leverage change is raising the
base from 0.8rem to 1rem and re-running the ×4/3 steps.

### 5.3 Palette

```css
--color-text / --color-foreground : #071005
--color-background                : #ebf3ff
--color-primary                   : #6399bb
--color-secondary                 : #99ceff
--color-accent                    : #ffc300
```

Derived tokens — edit these too if you change the five above: `card` and
`popover` `#ffffff`, `muted` `#dfeaf9`, `muted-foreground` `#5a6b7d`, `border`
and `input` `#c3d7ec`, `ring` `#6399bb`, plus `chart-1`…`chart-5`.

`--color-primary-foreground` is **`#071005`, not white**, deliberately: white on
`#6399bb` measures 3.1:1 and fails AA for body text, while `#071005` measures
6.3:1 and passes.

The previous dark palette (`#c29bda` / `#592977` / `#a563cf` / `#64af56` /
`#384678`) is gone from the landing page. `--accent` in `:root` is the site
accent and is **not** `--ns-accent` (the ink cue) — don't merge them.

### 5.4 Scope — what is converted, what is not

Converted to the light theme: `Home`, `HeroSection`, `ExpandCards`,
`FeaturesSection`, `StepsSection`, `CtaSection`, `Footer`, `Header`,
`Preloader`. `ui/how-it-works.jsx` already used tokens, so it adapted for free.
`ui/StaggeredMenu.jsx` takes its colours from props set in `Home.jsx`.

Still dark, deliberately: **none**. `Mainpage.jsx`, `Dashboard.jsx` and
`AnalyticsDashboard.jsx` were moved onto the light tokens on 2026-10-03 —
`#1a1a1a`/`#111111` surfaces became `bg-white`, `#333333`/`#222222` borders
became `border-[#c3d7ec]`, `text-white` became `text-[#071005]`, and
`text-gray-400/300/200` became `text-[#5a6b7d]` (those grays fail AA on white).
`Login.jsx` and `Register.jsx` are the remaining `bg-[#0a0a0a]` pages; they
still carry their own background, so nothing regressed there.

Landing-page conventions to match: sections use
`mx-auto max-w-7xl px-6 py-20 sm:py-24`; cards use `rounded-[24px]` or
`rounded-[32px]` with `border-secondary` / `bg-card`.

### 5.5 Landing-page colour spec (applied 2026-01-10)

A five-row colour spec was supplied and audited row by row against the running
page. The five palette tokens in §5.3 already matched it exactly, so **no token
was changed** — every fix was in how the tokens are used.

| Part | Token | Where |
| --- | --- | --- |
| Page background | `--background` | `body`, `<main>` |
| Navbar | background + thin Secondary rule | `Header` full-bleed wrapper |
| Hero heading / sub-text | `--foreground` @ 75% | `HeroSection` |
| Main button (Get Started) | `--accent` + `--accent-foreground` | hero, CTA, footer |
| Second button (Learn More) | outlined Primary, Text label | hero (new) |
| Alternate sections | Secondary @ 25% over Background | `.section-wash` on `#features` |
| Cards | `--card` + Secondary border | features, cards, steps, CTA |
| Icons and tags | Primary icon on Secondary field | everywhere |
| Stats / badges | Accent field, Text label | "Live Metrics" chip |
| Footer | `--foreground` band, `--background` type | `Footer` (inverted) |

Four measured facts drove most of the work, and they contradict what the
palette "looks like":

1. **Accent is not a text colour on this page.** `#ffc300` on `#ebf3ff` is
   **1.4:1**. It is now only ever a *fill* — buttons, chips, 1px rules, the
   accordion's open marker — with `--accent-foreground` on top. Every place that
   used `style={{ color: c.color }}` (the card titles, the eyebrows, the big
   `01`–`04` figure) moved to `--foreground`, and the accent survives as a shape
   beside the text instead.
2. **Primary is not a body or small-link colour.** `#6399bb` on `#ebf3ff`
   measures **2.76:1**, short of even the 3:1 large-text bar. Every
   `text-primary` eyebrow became `text-foreground`, and Primary is now only
   icons, borders and large shapes. That includes the rotating hero word: it is
   part of the heading, so it is Text, and the headline's colour comes from the
   Secondary badge field and the Primary icon.
3. **White on Primary still fails** (3.1:1), so `primary-foreground` stays dark.
   `Login` is Primary fill + Text (6.3:1); `Signup` is Secondary fill + Text
   (11.6:1).
4. **The footer inverts, so its greys had to change with it.**
   `--muted-foreground` `#5a6b7d` is a comfortable 4.9:1 on Background but only
   **3.9:1** on the `#071005` footer. Footer body text is now
   `text-background/80` (17.3:1), and hovers use Accent, which is 12.7:1 against
   Text and is therefore legal *there* precisely because that ground is dark.

#### Verification

A CDP harness walked every text node in `main`, `header` and `footer`,
composited each element's own background down the ancestor chain, and measured
WCAG contrast against the correct threshold (3:1 large, 4.5:1 otherwise):

```
28 unique text styles   FAILS=0
worst passing pair: 4.88:1  (#5a6b7d body copy on the card, 14.8px)
```

`ui/StaggeredMenu.jsx` gained a `linkHoverColor` prop (`--sm-link-hover`)
because the nav labels sit on a white panel where neither Primary nor Accent
can legally be a hover colour — the hover is a Secondary field instead.

#### The hero ink had to be re-floored

The spec assigns `--foreground` to the hero heading and sub-text, but the hero
sits on a full-bleed WebGL tank, and the original ramp's darkest stop was
`mixRGB(fg, black, 0.55)` ≈ `#030701` — **1.05:1**. Sampling the rendered hero,
**5.4% of its pixels were below 4.5:1** and the heading and paragraph visibly
crossed the dark cores. The CSS audit cannot see this, because it measures the
section's `bg-background` rather than the canvas.

The light ramp was rebuilt as pure mixes of `--background` toward
`--ns-muted`, ending at `c4 = mixRGB(bg, muted, 0.74)` ≈ `#808e9f`. Because the
display shader clamps `cov` and both later passes lighten, `c4` is a hard floor,
not a typical value. Measured with the hero copy hidden:

```
pure ink, 1,234,100 px    darkest #7f8e9e = 5.77:1    pixels below 4.5:1: 0
```

The plumes keep their full tonal range and still read as volumetric ink; they
simply stop going to black. This is also what the spec's "hero shapes → Secondary
fading into Background" row asks for. Details in §4.3.

---

## 6. The expanding cards (ExpandCards)

`frontend/src/components/ExpandCards.jsx` — a 4-row vertical accordion that
**replaced** `CarouselSection` on the landing page.

- Single-open accordion: clicking a row opens it and closes the rest.
  `useState(0)`, so row `01` is open on load.
- Expand/collapse is `grid-template-rows: 0fr → 1fr` with a 500ms
  `cubic-bezier(0.22,1,0.36,1)` transition — no height measuring and no JS
  animation library. The inner node **must** keep `overflow-hidden` or the
  content will not clip.
- Left column: rows + copy. Right column (`lg:` only): a circular image and a
  large number for the active row, crossfading on opacity + scale while the
  panel background tints toward that row's colour.
- Below `lg` the right panel is hidden and the active row's image appears as a
  small circle inside its expanded body.

All content lives in the `CARDS` array at the top of the file — `n`, `eyebrow`,
`title`, `text`, `img`, `color`. Edit that array to change the section; nothing
else needs to move. The four Unsplash URLs came from the carousel; the per-row
`color` values are now `#6399bb`, `#ffc300`, `#3f6f8c` and `#99ceff`, matching
the current palette (they are inline hex because each row needs its own tint,
and they are applied as 8-digit hex alphas like `${color}1f`).

To revert: put `CarouselSection` back into `Home.jsx` (the file is still on
disk) and drop the `ExpandCards` import.

---

## 7. Gotchas

1. **The ~6000-character write limit in the editor tooling.** `dye-whorl.jsx` is
   one 1600-line file and could not be written in a single edit; it was
   assembled chunk by chunk against a `//__CW__` continuation marker, which has
   since been removed. If you ever regenerate it from scratch, do the same:
   append sequentially and keep the marker until the final chunk.

2. **`parseHex` is strict.** See §4.3. This is the most likely thing to break
   the ink. If the background goes washed-out or flat after a theme change,
   check those five hex variables first.

3. **The `z-0` wrapper / `z-10` content split in the hero is load-bearing.**
   The whorl only behaves as a passive background because it sits under the
   content box.

4. **Do not remove `bg-background` from the hero `<section>`.** It is the
   no-WebGL fallback now that the `gradient-yaten` class is gone.

5. **`CarouselSection.jsx` and `ui/CircularCarousel.jsx` are unused** but still
   on disk, so reverting is a two-line change.

6. **`npm run build` prints a chunk-size warning.** Pre-existing, not an error.

7. **`speed` is mount-time config.** Changing it at runtime throws away the GL
   context and every render target. Use `paused` for runtime control.

8. **`body` is light now — and so is every page.** The theme's `--bg` is
   `#ebf3ff`. `Login` and `Register` used to be pinned to `bg-[#0a0a0a]` with
   white type and a `bg-black/50` card, which is why they were the last two
   dark screens on an otherwise light site. They now set `bg-background` with a
   `bg-card` form and a `border-secondary` edge, matching the landing page. If
   you add a page, give it a background or it renders on the light theme — and
   if you copy an auth form, copy `authInput` from `Styles/common.js` rather
   than hand-rolling a field, or you will reintroduce white-on-white.

9. **The type scale is deliberately compact.** `text-base` is 12.8px and
   `text-sm` is 9.6px. If a screen reads small, raise the base in `@theme` rather
   than sprinkling bigger utility classes around.

10. **Never put `[&>*]:pointer-events-auto` on the StaggeredMenu wrapper.** The
    menu renders a `fixed top-0 left-0 w-screen h-screen` scope, so forcing that
    child to be interactive makes a full-viewport `z-40` element the click target
    for the whole page — at every scroll position. It silently kills the header
    buttons, the hero CTA and the cards. The component re-enables pointer events
    on exactly the toggle and the panel from its own CSS, so the wrapper only
    needs `pointer-events-none`.
11. **Accent and Primary are not text colours on the light page** (§5.5).
    `#ffc300` on `#ebf3ff` is 1.4:1 and `#6399bb` is 2.76:1. Reachable text must
    use `--foreground`, `--card-foreground` or `--background`. Accent belongs on
    *fills* (with `--accent-foreground`), Primary on icons, borders and shapes.
    Both are only legal as type on the inverted footer, where the ground is
    `#071005`.
12. **The hero's content wrapper is `pointer-events-none`, and its buttons are
    `pointer-events-auto`.** The wrapper is `w-full` and sits at `z-10` over the
    tank at `z-0`, so as a plain block it swallowed every `pointermove` before it
    reached `DyeWhorl`'s wrap. The symptom is misleading: the ink still stirred
    in the strips of page *outside* the `max-w-7xl` box, so it looked alive
    everywhere except where you were actually pointing. **Do not "fix" this with
    `[&>*]:pointer-events-auto`** — the grid children are as wide as the text
    column, which reintroduces the same swallow (and is the same class of
    mistake as gotcha 10). Opt individual controls back in.
13. **Never full-bleed with `100vw`.** `100vw` is the viewport width *including*
    the vertical scrollbar; the layout viewport (`clientWidth`) is narrower. A
    `::before` with `left: 50%; transform: translateX(-50%); width: 100vw`
    inside a `max-width` section therefore sticks out on **both** sides and puts
    a horizontal scrollbar under the whole page. `.section-wash` used to do
    exactly this. Full-bleed a band by making the `<section>` full width and
    moving the `max-width` to an inner column, then use a plain
    `background-color`. If you are ever tempted to reach for
    `overflow-x: hidden` on the root to silence it, that is treating the
    symptom — find the element that is actually too wide. (Note that
    `position: fixed` elements never contribute to document scroll, so a
    `w-screen` fixed overlay is *not* a scrollbar cause no matter what the
    rects look like.)

---

## 8. Verified state

At the time of writing, all of the following pass on this working tree:

```
npm run build                              # exit 0, ~1.6s
npx eslint <12 touched files>              # exit 0, 0 errors
                                           # (1 pre-existing warning:
                                           #  react-hook-form watch() in Register)
npm run dev -- --port 5199 --strictPort    # HTTP 200; HeroSection, Footer,
                                           # ExpandCards all served 200
```

The compiled `dist/assets/index-*.css` was inspected to confirm the theme tokens
actually landed rather than being silently dropped: `--color-primary:#6399bb`,
`--color-background:#ebf3ff`, `--color-accent:#ffc300`, `--font-weight-bold:700`,
`--text-base:.8rem`, `--text-xs:.45rem`, `Nunito`, `Sora` — all present.

The dev server was stopped and port 5199 released afterwards. No stray
`_dev.log` / `_dev.err` files were left behind.

### A note on git

This tree **is now a git repository** (`git init` on 2026-10-03). The first
commit is a pre-work snapshot of the state before the cleanup/theme pass, so
there is a baseline to diff against.

### A note on `npm run lint`

`npm run lint` is `eslint .` across the whole repo and now reports
**69 problems, 0 errors** (the 68 errors from the pre-work baseline are gone;
every remaining item is a warning).

`eslint.config.js` downgrades four rules to `warn` — `react-hooks/refs`,
`react-hooks/set-state-in-effect`, `react-hooks/preserve-manual-memoization`,
`react-refresh/only-export-components` — and scopes `vite.config.js` to the
Node globals (`__dirname` was flagged because the config file loaded the
browser globals). Those four are React-Compiler-era style rules; none of them
indicated a live bug, and rewriting 20 chart files to satisfy them was not
worth the regression risk.

Real errors that were fixed rather than silenced: dead code in
`Mainpage.jsx` (`getDriveOwnerId`, the whole HR company form — `form`,
`editingCompany`, `saving`, `handleSubmit`, `handleEdit`, `handleFieldChange`,
`resetForm`, `hireChartData`/`hireHistory` — whose UI was already gone),
unused props on `TeacherReports`, unused `React` imports, an unused `catch`
binding, and a useless assignment in `use-chart-interaction.js`.

---

## 9. Suggested next steps

- **Done 2026-10-03:** route-level `React.lazy` split for `Mainpage` +
  `Dashboard` (landing chunk 1.17 MB → 443 KB); `CarouselSection.jsx` and
  `ui/CircularCarousel.jsx` deleted; lint is at **0 errors**; `git init` done;
  `Mainpage` / `AnalyticsDashboard` moved to the light theme; `Notifications`
  and `Admin` tabs added to `Dashboard.jsx`; `/admin-api` now requires
  `verifyToken("Admin")`.
- Still open:
  - `Login` / `Register` are the last dark pages — convert them or accept the
    split.
  - `Mainpage.jsx` (`/main-page`) is now an unused legacy surface: nothing
    links to it, `Login` sends users to `/dashboard`. Pick one — port
    `ProfileFormModal` / `ViewApplicantsModal` / `AddDriveModal` across and
    delete it, or wire the nav to it.
  - `Register.jsx` offers Student / Teacher / HR only; Admin exists in the
    seed and in `UserModel` but can only be created by seeding. Decide whether
    admin signup should exist at all (it should not be self-service).
  - `InterviewSlotModel` + `SchedulerAPI` (create / list / book slots) have no
    frontend caller at all.
  - `NotificationModel` and `NotificationModel`-based endpoints are unused;
    the Notifications tab derives its feed from application timestamps instead.
  - Two chart libraries are imported (`chart.js` in `Mainpage`, `recharts` in
    `Dashboard` / `AnalyticsDashboard`). Pick one.
  - Decide on TypeScript (§1.1). If it is ever adopted, do it as one
    deliberate migration rather than file-by-file drift.
