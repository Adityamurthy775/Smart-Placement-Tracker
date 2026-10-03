import {
  BsArrowRight,
  BsCheckCircle,
  BsPeopleFill,
  BsBriefcase,
  BsRocketTakeoff,
  BsLightningCharge
} from 'react-icons/bs'
import { useNavigate } from 'react-router'
import { SlotHeadline } from './ui/slot-headline'
import DyeWhorl from './ui/dye-whorl'

const stats = [
  { value: '5000+', label: 'Students' },
  { value: '250+', label: 'Companies' },
  { value: '95%', label: 'Placement Rate' },
  { value: '24/7', label: 'Tracking' }
]

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Ink in still water — the only thing behind the hero copy. No gradient,
          no grid overlay, no glow orb: anything layered here competes with the
          ink. `bg-background` on the section is the no-WebGL fallback. */}
      <div className="absolute inset-0 z-0">
        <DyeWhorl className="h-full w-full" />
      </div>

      {/* This wrapper is `w-full` and sits at z-10 over the tank at z-0, so it
          covers the whole hero and — being a plain block — swallowed every
          pointer event before it could reach DyeWhorl's wrap. The ink only
          stirred in the slivers of page outside this max-w-7xl box.
          `pointer-events-none` lets the events fall through to the canvas;
          the buttons and links below opt back in individually. Do NOT use
          `[&>*]:pointer-events-auto` here: the grid children are as wide as
          the text column, so that would swallow them all again. */}
      <div className="pointer-events-none relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
          <div>
            {/* Tag: Primary mark on a Secondary field. The label stays Text —
                Primary on Background is only 2.8:1 and this is small type. */}
            <span className="inline-flex items-center rounded-full border border-secondary bg-secondary/40 px-4 py-2 text-sm font-semibold text-foreground mb-8">
              Smart Placement Management Platform
            </span>

            <SlotHeadline
              as="h1"
              prefix="We help you"
              /* The rotating word is part of the hero HEADING, so it is Text
                 (#071005, 17.3:1). Primary as a word measures 2.76:1 — still short
                 of the 3:1 large-text bar — and Accent 1.4:1 is invisible. Colour
                 in the headline comes from the badge field and the Primary icon. */
              items={[
                { name: 'Track Students', icon: BsPeopleFill, color: '#071005' },
                { name: 'Manage Placements', icon: BsBriefcase, color: '#071005' },
                { name: 'Hire Talent', icon: BsRocketTakeoff, color: '#071005' },
                { name: 'Build Careers', icon: BsLightningCharge, color: '#071005' }
              ]}
              interval={2200}
              duration={700}
              className="hero-headline text-4xl sm:text-6xl lg:text-5xl font-extrabold leading-[1.03] tracking-tight text-foreground"
              badgeClassName="bg-secondary/40 text-foreground"
              iconClassName="text-primary"
            />

            <p className="mt-8 max-w-2xl text-xl sm:text-2xl text-foreground/75 leading-relaxed">
              Student profiles, placement drives, recruiter management, email notifications,
              analytics, and tracking all sit together in one focused workspace.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              {/* Main button: Accent fill, Text label — 12.0:1.
                  `pointer-events-auto` opts back in: the content wrapper is
                  `pointer-events-none` so the tank can see the cursor. */}
              <button
                className="pointer-events-auto group inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_0_26px_rgba(255,195,0,0.35)]"
                onClick={() => navigate('/login')}
              >
                Get Started
                <BsArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>

              {/* Secondary button: outlined Primary, Text label (white on Primary
                  measures 3.1:1 and fails AA for small text). */}
              <button
                className="pointer-events-auto group inline-flex items-center gap-3 rounded-full border border-primary bg-transparent px-8 py-4 font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Learn More
                <BsArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="mt-12 flex flex-wrap gap-4 text-base text-foreground/75">
              {['Student Tracking', 'Placement Analytics', 'Recruiter Management'].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-secondary bg-secondary/40 px-4 py-2 transition hover:border-accent hover:shadow-[0_0_18px_rgba(255,195,0,0.20)]"
                >
                  <BsCheckCircle className="text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Floating stats panel */}
          <div className="hidden lg:block relative">
            <div className="rounded-3xl border border-secondary bg-card/80 backdrop-blur-md p-10 shadow-[0_0_40px_rgba(99,153,187,0.18)]">
              {/* Badge: Accent field, Text label. The figures below stay Text —
                  Accent on Background is 1.4:1 and would disappear. */}
              <span className="mb-8 inline-block rounded-full bg-accent px-4 py-2 text-sm font-bold uppercase tracking-[0.3em] text-accent-foreground">
                Live Metrics
              </span>
              <div className="grid grid-cols-2 gap-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-4xl font-bold text-foreground">{s.value}</p>
                    <p className="text-base text-muted-foreground mt-2">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
