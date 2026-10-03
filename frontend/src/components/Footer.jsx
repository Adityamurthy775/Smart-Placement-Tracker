import { useNavigate } from 'react-router'
import { FaGithub, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { BsArrowUp, BsArrowRight } from 'react-icons/bs'

const groups = [
  { title: 'Platform', links: ['Student Tracking', 'Placement Drives', 'Recruiter Management', 'Analytics'] },
  { title: 'Solutions', links: ['Students', 'Placement Cells', 'Recruiters', 'Institutions'] },
  { title: 'Resources', links: ['Documentation', 'Placement Guides', 'Support Center'] },
  { title: 'Company', links: ['Our Story', 'Privacy Policy', 'Terms of Service'] },
]

const socials = [
  { Icon: FaLinkedin, label: 'LinkedIn' },
  { Icon: FaGithub, label: 'GitHub' },
  { Icon: FaTwitter, label: 'Twitter' },
  { Icon: FaInstagram, label: 'Instagram' },
]

function Footer() {
  const navigate = useNavigate()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    /* The spec closes the page with an inverted band: the Text colour as the
       surface, Background-coloured type on top. Because the ground is now
       #071005, every body string has to be a light Background tint — the
       #5a6b7d muted grey only measures 3.9:1 down here. Accent stays legal
       as a hover, a rule and a badge: as type it is 12.7:1 against Text. */
    <footer className="relative bg-foreground text-background">
      {/* top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr] xl:gap-16">
          {/* Brand column */}
          <div className="reveal-up flex flex-col items-start">
            <button
              className="cursor-pointer flex items-center gap-3"
              onClick={() => navigate('/')}
            >
              {/* Brand mark: one letter in Primary, on a Primary wash. */}
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-xl font-black text-primary ring-1 ring-inset ring-primary/40">
                P
              </span>
              <span className="text-2xl font-bold text-background">PlacementOS</span>
            </button>

            <p className="mt-5 max-w-[320px] text-base leading-relaxed text-background/80">
              One workspace for student profiles, placement drives, recruiters, notifications, and
              placement analytics — built for colleges and placement cells.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-background/20 bg-background/5 text-background/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-[0_0_18px_rgba(255,195,0,0.25)]"
                >
                  <Icon />
                </a>
              ))}
            </div>

            {/* Main button: Accent fill, Text label. */}
            <button
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_0_22px_rgba(255,195,0,0.3)]"
              onClick={() => navigate('/register')}
            >
              Get started free
              <BsArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {groups.map((group) => (
              <div key={group.title} className="reveal-up flex flex-col">
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-background">
                  {group.title}
                </h3>
                <span className="mt-3 h-px w-10 bg-accent" />
                <ul className="mt-4 space-y-3 text-base text-background/80">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-accent"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="reveal-up mt-14 flex flex-col items-center justify-between gap-4 border-t border-background/15 pt-8 md:flex-row">
          <p className="text-center text-sm text-background/80 md:text-left">
            &copy; {new Date().getFullYear()} PlacementOS. Built for placement excellence.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-background/80 transition hover:text-accent">
              Privacy
            </a>
            <a href="#" className="text-sm text-background/80 transition hover:text-accent">
              Terms
            </a>
            <button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/5 px-4 py-2 text-sm text-background/80 transition-all duration-300 hover:border-accent hover:text-accent"
            >
              Back to top
              <BsArrowUp className="transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
