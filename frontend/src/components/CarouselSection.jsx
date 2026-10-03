import { useRef } from 'react'
import CircularCarousel from './ui/CircularCarousel'

const carouselItems = [
  {
    src: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&auto=format',
    alt: 'Students collaborating on a project',
    title: 'Campus Drives',
    subtitle: 'Live placements'
  },
  {
    src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80&auto=format',
    alt: 'Students attending a professional meeting',
    title: 'Interview Prep',
    subtitle: 'Mock rounds'
  },
  {
    src: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=80&auto=format',
    alt: 'Business professionals having a discussion',
    title: 'Recruiter Meets',
    subtitle: 'Direct hiring'
  },
  {
    src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format',
    alt: 'Professional reviewing documents and offer details',
    title: 'Offer Letters',
    subtitle: 'Signed & sealed'
  },
  {
    src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80&auto=format',
    alt: 'Students working together on campus',
    title: 'Mentorship',
    subtitle: 'Career guidance'
  }
]

export default function CarouselSection() {
  const carouselRef = useRef(null)

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
      <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#c3a6d5]">Placements in action</p>
          <h2 className="text-3xl font-bold leading-[1.05] sm:text-5xl">Every Drive,<br/>Every Offer,<br/>Tracked.</h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-[#f2edf5]/60 sm:text-right">
          A live look at the placement journey — drag, swipe, or use the arrows to explore each moment.
        </p>
      </div>

      <div className="relative h-[420px] w-full overflow-hidden rounded-[32px] border border-white/10 bg-black/40 sm:h-[520px] lg:h-[560px]">
        <CircularCarousel
          ref={carouselRef}
          items={carouselItems}
          preset="panorama"
          intro="rise"
          cardWidth={252}
          aspectRatio={0.5625}
          speed={11}
          captions
          gap={47}
          tilt={0}
          perspective={1800}
          parallax={0.15}
          stretch={0.66}
          depthFade={1}
          innerShade={1}
          cornerRadius={40}
          fadeColor="#070707"
          focusOnClick={true}
          pauseOnHover={true}
          curve={1}
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 sm:px-6">
          <button
            type="button"
            onClick={() => carouselRef.current?.prev()}
            aria-label="Previous slide"
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition hover:border-[#c3a6d5]/60 hover:text-[#c3a6d5] focus-visible:ring-2 focus-visible:ring-[#c3a6d5]/70 focus-visible:outline-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => carouselRef.current?.next()}
            aria-label="Next slide"
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition hover:border-[#c3a6d5]/60 hover:text-[#c3a6d5] focus-visible:ring-2 focus-visible:ring-[#c3a6d5]/70 focus-visible:outline-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs uppercase tracking-[0.2em] text-[#f2edf5]/40">Drag to explore</p>
    </section>
  )
}
