import { useNavigate } from 'react-router'
import logo from '../assets/placment.png'

function Header() {
  const navigate = useNavigate()

  return (
    /* Navbar: Background, separated from the hero ink by a thin Secondary rule.
       The bar is a full-bleed wrapper because `header` itself is max-width. */
    <div className="border-b border-secondary/40 bg-background">
      <header className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
        <div
          onClick={() => navigate('/')}
          className="cursor-pointer flex items-center gap-3"
        >
          <img
            src={logo}
            alt="Anurag University logo"
            className="h-12 w-auto object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] sm:h-16"
          />


        </div>

        <div className="flex gap-4">
          {/* Secondary button: Primary fill, Text label (6.3:1 — white would fail). */}
          <button
            className='bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(99,153,187,0.35)]'
            onClick={() => navigate('/login')}
          >
            Login
          </button>

          <button
            className='bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,195,0,0.35)]'
            onClick={() => navigate('/register')}
          >
            Signup
          </button>
        </div>
      </header>
    </div>
  )
}

export default Header
