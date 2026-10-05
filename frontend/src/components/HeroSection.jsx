import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Hero } from './ui/animated-hero'

const highlights = ['Student Tracking', 'Placement Analytics', 'Recruiter Management']

// Recruiter wordmarks — styled text on the light ground (no binary assets).
const recruiters = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Capgemini', 'Deloitte']

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section id="home" className="relative w-full overflow-hidden bg-background">
      {/* Light-theme wash: pale oklab gradient + grain (see .gradient-yaten in
          index.css). Replaces the old dark oceanic shader so the hero reads as
          a light section with dark ink. */}
      <div className="gradient-yaten pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10">
        <Hero
          titles={['placement', 'career', 'opportunity', 'drive', 'future']}
          prefix="We help you track every"
          description="Student profiles, placement drives, recruiter management, email notifications, analytics, and tracking all sit together in one focused workspace."
          badgeLabel="Placement Report 2026 — live now"
          primaryLabel="Get started"
          secondaryLabel="Talk to us"
          onPrimaryClick={() => navigate('/login')}
          onSecondaryClick={() =>
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
          }
          onBadgeClick={() =>
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
          }
        />

        {/* Recruiter strip + highlights (no stock photos — pure type + icons). */}
        <div className="container mx-auto px-6 sm:px-8 pb-16 lg:pb-24">
          <div className="relative mx-auto max-w-5xl">
            <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Our students get hired at
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {recruiters.map((name) => (
                <span
                  key={name}
                  className="font-heading text-lg font-bold text-muted-foreground transition hover:text-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Highlights + CTA affordance row under the animated hero buttons. */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-base text-muted-foreground">
            {highlights.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 transition hover:border-primary hover:shadow-[0_0_18px_rgba(99,153,187,0.25)]"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </span>
            ))}
            <button
              onClick={() => navigate('/login')}
              className="group inline-flex items-center gap-2 font-semibold text-foreground transition hover:text-primary"
            >
              Explore the dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
