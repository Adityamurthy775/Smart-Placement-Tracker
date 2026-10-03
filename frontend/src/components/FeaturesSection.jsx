import {
  BsGraphUpArrow,
  BsBell,
  BsPeopleFill,
  BsBriefcase
} from 'react-icons/bs'

const features = [
  { icon: <BsGraphUpArrow />, title: 'Placement Analytics', desc: 'Track performance, hiring trends, and student success in real time.' },
  { icon: <BsBell />, title: 'Smart Notifications', desc: 'Instant updates about drives, interviews, deadlines, and offers.' },
  { icon: <BsPeopleFill />, title: 'Student Management', desc: 'Profiles, resumes, skills, and eligibility from one place.' },
  { icon: <BsBriefcase />, title: 'Recruiter Tracking', desc: 'Monitor company visits, drives, and hiring outcomes.' }
]

export default function FeaturesSection() {
  return (
    /* Alternate section: Secondary at 25% over the page Background. The band is
       on the full-bleed <section>; the max-width column moved inside it, because
       a max-width section can only bleed via a `width: 100vw` pseudo-element and
       that is what put a horizontal scrollbar under the page. */
    <section id="features" className="section-wash">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-24 lg:py-32">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold">Everything You Need</h2>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Built for colleges, placement teams, students, and recruiters who need clarity without clutter.</p>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            /* Card: white surface, Secondary border. */
            <div key={index} className="group relative rounded-[24px] border border-secondary bg-card p-6 transition duration-300 hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_0_30px_rgba(255,195,0,0.18)]">
              <div className="absolute inset-0 rounded-[24px] bg-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              {/* Icon: Primary mark on a Secondary field (11.6:1). */}
              <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-2xl text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-secondary/70">{feature.icon}</div>
              <h3 className="relative text-xl font-semibold">{feature.title}</h3>
              <p className="relative mt-3 text-base leading-6 text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
