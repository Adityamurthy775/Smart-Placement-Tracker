import StaggeredMenu from './ui/StaggeredMenu'
import HeroSection from './HeroSection'
import ExpandCards from './ExpandCards'
import FeaturesBlock from './ui/features-4'
import { HowItWorks } from './ui/how-it-works'
import CtaSection from './CtaSection'

const menuItems = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/', internal: true },
  { label: 'Features', ariaLabel: 'Jump to features section', hash: 'features' },
  { label: 'Our Process', ariaLabel: 'Jump to how it works section', hash: 'how-it-works' },
  { label: 'Contact', ariaLabel: 'Jump to contact section', hash: 'contact' },  { label: 'Login', ariaLabel: 'Sign in to your account', link: '/login', internal: true },
  { label: 'Register', ariaLabel: 'Create a new account', link: '/register', internal: true }
]

const socialItems = [
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
]

function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground relative">

      {/* Fixed staggered menu overlay.

          Do NOT add a `[&>*]:pointer-events-auto` here. StaggeredMenu renders a
          full-viewport `fixed h-screen w-screen` scope, so making that child
          interactive turns the whole page into a click target for it — the
          header buttons, the hero CTA and the cards all stop responding. The
          component re-enables pointer events on exactly the parts that need them
          (the toggle and the panel) from its own CSS, so `none` here is enough. */}
      <div className="fixed top-0 left-0 w-full h-0 z-50 pointer-events-none">
        <StaggeredMenu
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          menuButtonColor="#071005"
          openMenuButtonColor="#071005"
          changeMenuColorOnOpen={true}
          /* Prelayers are large shapes behind the panel — Secondary into Primary,
             both off the site palette. A yellow reveal would fight the white panel. */
          colors={['#99ceff','#6399bb']}
          accentColor="#ffc300"
          /* Nav link hover field: Secondary, fading into the panel. */
          linkHoverColor="rgba(153,206,255,0.45)"
          isFixed={true}
        />
      </div>

      <HeroSection />
      <ExpandCards />
      <FeaturesBlock />
      <HowItWorks />
      <CtaSection />
    </main>
  )
}

export default Home
