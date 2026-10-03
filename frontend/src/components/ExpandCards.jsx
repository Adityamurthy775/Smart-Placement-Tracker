import { useState } from 'react'

// Expanding cards — vertical accordion. Click a row: it opens, its copy shows
// on the left, and the right panel swaps to that item's image + number.
// Data + images reuse the placement set that the old carousel used.
const CARDS = [
  {
    n: '01',
    eyebrow: 'Live placements',
    title: 'Campus Drives',
    text: 'Drives go live the moment a recruiter posts. Students see eligibility, deadlines and slots in one place, and every click is tracked from applied to offered.',
    img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&auto=format',
    color: '#6399bb',
  },
  {
    n: '02',
    eyebrow: 'Mock rounds',
    title: 'Interview Prep',
    text: 'Schedule mock interviews, share question banks and log feedback per student, so a weak area is visible before the real round, not after.',
    img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80&auto=format',
    color: '#ffc300',
  },
  {
    n: '03',
    eyebrow: 'Direct hiring',
    title: 'Recruiter Meets',
    text: 'Recruiters get their own view: shortlist, schedule, and update candidate status without a single email thread leaving the platform.',
    img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=80&auto=format',
    color: '#3f6f8c',
  },
  {
    n: '04',
    eyebrow: 'Signed & sealed',
    title: 'Offer Letters',
    text: 'Every offer is recorded against the student, the company and the drive, with branch-wise and company-wise analytics updating in real time.',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format',
    color: '#99ceff',
  },
]

export default function ExpandCards() {
  const [active, setActive] = useState(0)
  const current = CARDS[active]

  return (
    <section id="showcase" className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <div className="mb-8 sm:mb-12">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-foreground">What you get</p>
        <h2 className="text-3xl font-bold leading-[1.05] sm:text-5xl">Everything, in one place</h2>
      </div>

      {/* Progress rail — deliberately OUTSIDE the card box, so the accordion's own
          height change never nudges it. The fill width tracks the open card and
          the transition runs in BOTH directions: opening 04 extends it, going
          back to 01 drains it. Ticks mark the four stops.
          Accent is a fill here, never a label, so the contrast rule still holds. */}
      <div aria-hidden="true" className="relative mb-8 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${((active + 1) / CARDS.length) * 100}%` }}
        />
        {CARDS.slice(1).map((c, i) => (
          <span
            key={c.n}
            className="absolute top-0 h-full w-px bg-background"
            style={{ left: `${((i + 1) / CARDS.length) * 100}%` }}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-[32px] border border-secondary bg-card">
        <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
          {/* Left: accordion rows */}
          <div className="flex flex-col divide-y divide-secondary/50">
            {CARDS.map((c, i) => {
              const open = i === active
              return (
                <div
                  key={c.n}
                  className="transition-colors duration-500"
                  style={{ backgroundColor: open ? `${c.color}1f` : 'transparent' }}
                >
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 justify-between px-6 py-4 text-left sm:px-8"
                  >
                    {/* Accent is a large mark, never the label colour: #ffc300 on
                        Background is 1.4:1 and the title would vanish. */}
                    <span
                      aria-hidden="true"
                      className={`h-8 w-1 flex-none rounded-full bg-accent transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <span className="text-2xl font-semibold text-foreground transition-colors duration-300 sm:text-3xl">
                      {c.title}
                    </span>
                    <span className="text-base tabular-nums text-foreground/60">{c.n}</span>
                  </button>

                  {/* grid-rows 0fr -> 1fr is the smooth no-JS-measure expand.
                      The `min-h-0` on the clipper is what lets the row actually
                      reach zero: without it the grid item's min-content height
                      wins and the panel never collapses or expands properly. */}
                  <div
                    className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="px-6 pb-9 pt-1 sm:px-8">
                        <div className="mb-5 h-24 w-24 overflow-hidden rounded-full border border-secondary lg:hidden">
                          <img src={c.img} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <p className="mb-3 flex items-center gap-2 text-base font-semibold uppercase tracking-[0.2em] text-foreground">
                          <span aria-hidden="true" className="h-3 w-3 rounded-full bg-accent" />
                          {c.eyebrow}
                        </p>
                        <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">{c.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: circular image + big number for the active item */}
          <div
            className="relative hidden items-center justify-center border-l border-secondary/70 p-8 transition-colors duration-500 lg:flex"
            style={{ backgroundColor: `${current.color}0d` }}
          >
            <div className="flex flex-col items-center">
              <div className="relative h-64 w-64 overflow-hidden rounded-full border border-secondary">
                {CARDS.map((c, i) => (
                  <img
                    key={c.n}
                    src={c.img}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      opacity: i === active ? 1 : 0,
                      transform: i === active ? 'scale(1)' : 'scale(1.08)',
                    }}
                  />
                ))}
              </div>
              {/* Figure stays Text; the Accent rule underneath carries the colour,
                  because Accent as a numeral is 1.4:1 against the card. */}
              <span className="mt-6 text-6xl font-bold tabular-nums text-foreground">
                {current.n}
              </span>
              <span aria-hidden="true" className="mt-3 h-1 w-16 rounded-full bg-accent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
