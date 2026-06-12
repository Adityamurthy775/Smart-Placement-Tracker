import React from 'react'
import {
  BsGraphUpArrow,
  BsBell,
  BsPeopleFill,
  BsBriefcase,
  BsArrowRight,
  BsCheckCircle
} from 'react-icons/bs'
import { useNavigate } from 'react-router'
import {TypeAnimation} from 'react-type-animation'
function Home() {
  const navigate=useNavigate();
  const features = [
    {
      icon: <BsGraphUpArrow />,
      title: 'Placement Analytics',
      desc: 'Track placement performance, hiring trends, and student success in real time.'
    },
    {
      icon: <BsBell />,
      title: 'Smart Notifications',
      desc: 'Receive instant updates about drives, interviews, deadlines, and offers.'
    },
    {
      icon: <BsPeopleFill />,
      title: 'Student Management',
      desc: 'Manage student profiles, resumes, skills, and eligibility from one place.'
    },
    {
      icon: <BsBriefcase />,
      title: 'Recruiter Tracking',
      desc: 'Monitor company visits, recruitment drives, and hiring outcomes.'
    }
  ]

  const stats = [
    { value: '5000+', label: 'Students' },
    { value: '250+', label: 'Companies' },
    { value: '95%', label: 'Placement Rate' },
    { value: '24/7', label: 'Tracking' }
  ]

  return (
    <main className="min-h-screen text-white bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.12),_transparent_28%),linear-gradient(180deg,_#0d0d10_0%,_#070707_100%)]">
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-20 lg:pb-28">
        <div className="flex items-center justify-between gap-4 mb-10">
          <span className="inline-flex items-center rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 shadow-[0_0_24px_rgba(239,68,68,0.18)]">
            Smart Placement Management Platform
          </span>

        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div>
            <TypeAnimation
              sequence={[
                'Track Students',
                1800,
                'Manage Placements',
                1800,
                'Hire Talent',
                1800,
                'Build Careers',
                1800
              ]}
              wrapper="h1"
              speed={48}
              repeat={Infinity}
              cursor={true}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.03] tracking-tight"
            />

            <p className="mt-7 max-w-2xl text-lg sm:text-xl text-gray-300 leading-relaxed">
              Student profiles, placement drives, recruiter management, email notifications,
              analytics, and tracking all sit together in one focused workspace.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(239,68,68,0.35)]"
                onClick={() => navigate('/register')}
              >
                Get Started
                <BsArrowRight />
              </button>
              <button
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 font-semibold text-white transition hover:border-red-400/40 hover:bg-red-500/10 hover:shadow-[0_0_24px_rgba(239,68,68,0.22)]"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-gray-300">
              {['Student Tracking', 'Placement Analytics', 'Recruiter Management'].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:border-red-400/40 hover:shadow-[0_0_18px_rgba(239,68,68,0.18)]"
                >
                  <BsCheckCircle className="text-red-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[32px] bg-red-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111] shadow-[0_0_40px_rgba(0,0,0,0.45)]">
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-sm transition hover:border-red-400/35 hover:shadow-[0_0_24px_rgba(239,68,68,0.22)]"
                    >
                      <div className="text-2xl font-bold text-white">{item.value}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-gray-400">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">Everything You Need</h2>
            <p className="mt-3 max-w-2xl text-gray-400">
              Built for colleges, placement teams, students, and recruiters who need clarity without clutter.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-[24px] border border-white/10 bg-white/5 p-6 transition duration-200 hover:-translate-y-1 hover:border-red-400/35 hover:bg-white/[0.07] hover:shadow-[0_0_26px_rgba(239,68,68,0.2)]"
            >
              <div className="mb-5 text-3xl text-red-300">{feature.icon}</div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
          <p className="mt-3 text-gray-400">Three steps, one clean flow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { step: '01', title: 'Register Students', desc: 'Create and manage student profiles with resumes and skills.' },
            { step: '02', title: 'Manage Drives', desc: 'Publish placement opportunities and recruitment drives.' },
            { step: '03', title: 'Track Placements', desc: 'Monitor applications, interviews, and final selections.' }
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[24px] border border-white/10 bg-[#111] p-6 transition duration-200 hover:-translate-y-1 hover:border-red-400/35 hover:shadow-[0_0_24px_rgba(239,68,68,0.18)]"
            >
              <div className="text-5xl font-black text-white/15">{item.step}</div>
              <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-[32px] border border-white/10 bg-white text-black p-8 sm:p-12 lg:p-16 text-center shadow-[0_0_30px_rgba(239,68,68,0.12)]">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Ready To Transform Placements?
          </h2>
          <p className="mt-5 max-w-3xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed">
            Simplify student tracking, recruiter management, placement drives, analytics, and communication from one dashboard.
          </p>
          <button
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(239,68,68,0.35)]"
            onClick={() => navigate('/register')}
          >
            Start Tracking
            <BsArrowRight />
          </button>
        </div>
      </section>
    </main>
  )
}

export default Home
