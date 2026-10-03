import { BsArrowRight } from 'react-icons/bs'
import { useNavigate } from 'react-router'

export default function CtaSection() {
  const navigate = useNavigate()

  return (
    <section id="contact" className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
      <div className="rounded-[32px] border border-secondary bg-card text-card-foreground p-8 sm:p-12 lg:p-16 text-center shadow-[0_0_30px_rgba(99,153,187,0.18)]">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Ready To Transform Placements?</h2>
        <p className="mt-5 max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Simplify student tracking, recruiter management, placement drives, analytics, and communication from one dashboard.
        </p>
        {/* Main button: Accent fill with a Text label — the spec's 12.0:1 pairing.
            Text on Accent beats white on Primary (which fails AA at 3.1:1). */}
        <button
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_0_24px_rgba(255,195,0,0.35)]"
          onClick={() => navigate('/login')}
        >
          Get Started
          <BsArrowRight />
        </button>
      </div>
    </section>
  )
}
