import { useState } from 'react'
import {
  Briefcase,
  CalendarCheck,
  FileCheck,
  MessagesSquare,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Showcase — accordion cards. Each card pairs copy (left) with its own
// photo (right); the right rail iterates image + text with the active card.
const CARDS = [
  {
    n: '01',
    eyebrow: 'Live placements',
    title: 'Campus Drives',
    text: 'Drives go live the moment a recruiter posts. Students see eligibility, deadlines and slots in one place, and every click is tracked from applied to offered.',
    icon: CalendarCheck,
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Graduates celebrating at a campus placement drive',
    metric: '120+',
    metricLabel: 'active drives',
    color: '#6399bb',
  },
  {
    n: '02',
    eyebrow: 'Mock rounds',
    title: 'Interview Prep',
    text: 'Schedule mock interviews, share question banks and log feedback per student, so a weak area is visible before the real round, not after.',
    icon: MessagesSquare,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Student preparing for a mock interview',
    metric: '3.4k',
    metricLabel: 'mocks logged',
    color: '#ffc300',
  },
  {
    n: '03',
    eyebrow: 'Direct hiring',
    title: 'Recruiter Meets',
    text: 'Recruiters get their own view: shortlist, schedule, and update candidate status without a single email thread leaving the platform.',
    icon: Briefcase,
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Recruiters meeting candidates in an office',
    metric: '250+',
    metricLabel: 'recruiters onboard',
    color: '#3f6f8c',
  },
  {
    n: '04',
    eyebrow: 'Signed & sealed',
    title: 'Offer Letters',
    text: 'Every offer is recorded against the student, the company and the drive, with branch-wise and company-wise analytics updating in real time.',
    icon: FileCheck,
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Handshake sealing a placement offer',
    metric: '95%',
    metricLabel: 'placement rate',
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

      {/* Cards + adjacent vertical progress line (outside the cards, on their left). */}
      <div className="flex items-stretch gap-4 sm:gap-5">
        <div aria-hidden="true" className="relative w-1.5 flex-none overflow-hidden rounded-full bg-foreground/10">
          <div
            className="absolute inset-x-0 top-0 rounded-full bg-accent transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ height: `${((active + 1) / CARDS.length) * 100}%` }}
          />
          {CARDS.slice(1).map((tick, t) => (
            <span
              key={tick.n}
              className="absolute inset-x-0 h-px bg-background"
              style={{ top: `${((t + 1) / CARDS.length) * 100}%` }}
            />
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden rounded-[32px] border border-secondary bg-card">
        <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
          <div className="flex flex-col divide-y divide-secondary/50">
            {CARDS.map((c, i) => {
              const open = i === active
              const Icon = c.icon
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
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-8 w-1 flex-none rounded-full bg-accent transition-opacity duration-300',
                        open ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="flex flex-1 items-center gap-3 text-2xl font-semibold text-foreground sm:text-3xl">
                      <Icon className="size-7 shrink-0 text-primary" aria-hidden="true" />
                      {c.title}
                    </span>
                    <span className="text-base tabular-nums text-foreground/60">{c.n}</span>
                  </button>

                  <div
                    className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="px-6 pb-9 pt-1 sm:px-8">
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

          <div
            className="relative hidden items-center justify-center overflow-hidden border-l border-secondary/70 transition-colors duration-500 lg:flex"
            style={{ backgroundColor: `${current.color}0d` }}
          >
            {/* Right rail iterates with the active card: its photo on top,
                then the metric + short text. Cross-fades via key change. */}
            <div key={current.n} className="flex w-full max-w-sm flex-col p-8">
              <div className="overflow-hidden rounded-2xl border border-secondary/70">
                <img
                  key={current.image}
                  src={current.image}
                  alt={current.imageAlt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{current.text}</p>
              <div className="mt-4 flex flex-col items-center text-center">
                <span className="flex items-center gap-2 text-5xl font-bold tabular-nums text-foreground">
                  {current.metric}
                  <TrendingUp className="size-7 text-primary" aria-hidden="true" />
                </span>
                <span className="mt-2 text-base text-muted-foreground">{current.metricLabel}</span>
                <span aria-hidden="true" className="mt-3 h-1 w-16 rounded-full bg-accent" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
