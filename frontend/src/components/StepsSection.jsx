import { BsPersonPlus, BsFileEarmarkText, BsGraphUpArrow } from 'react-icons/bs'

const steps = [
  {
    number: '01',
    title: 'Register',
    desc: 'Create your profile with skills, resume, and preferences in minutes.',
    icon: <BsPersonPlus />,
  },
  {
    number: '02',
    title: 'Apply',
    desc: 'Browse placement drives, apply with one click, track every application.',
    icon: <BsFileEarmarkText />,
  },
  {
    number: '03',
    title: 'Get Placed',
    desc: 'Interview, receive offers, and monitor your success rate in real time.',
    icon: <BsGraphUpArrow />,
  },
]

export default function StepsSection() {
  return (
    <section id="how-it-works" className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
      <div className="mb-16">
        <p className="text-sm uppercase tracking-[0.3em] text-foreground font-semibold mb-4">Our Process</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Three Steps, One Clean Flow</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground text-lg sm:text-xl">
          From registration to offer letter — a streamlined path designed for clarity.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-10 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent -z-0" />

        {steps.map((step, index) => (
          <div
            key={step.number}
            className="group relative rounded-[24px] border border-border bg-card/60 backdrop-blur-sm p-8 lg:p-10 transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(255,195,0,0.2)] z-10"
          >
            {/* Ghost number */}
            <span className="absolute top-6 right-8 text-6xl font-bold text-primary/15 select-none pointer-events-none">
              {step.number}
            </span>

            {/* Icon badge */}
            <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-2xl text-primary ring-1 ring-primary/25 transition-transform group-hover:scale-110">
              {step.icon}
            </div>

            <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{step.desc}</p>

            {/* Progress dots */}
            <div className="mt-8 flex items-center gap-2">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={'h-1.5 rounded-full transition-all ' + (
                    i === index ? 'w-6 bg-accent' : 'w-1.5 bg-foreground/15'
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
