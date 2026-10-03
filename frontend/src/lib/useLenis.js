import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Inertia scrolling for marketing pages, kept in sync with gsap ScrollTrigger. */
export default function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Native wheel scrolling: the big-card pin/rotate effect scrubs 1:1 with the
    // scroll position (same as the reference portfolio). Flip smoothWheel back to
    // true for inertia scrolling — the pinned cards will then lag behind the wheel.
    const lenis = new Lenis({ smoothWheel: false })
    const onUpdate = () => ScrollTrigger.update()
    lenis.on('scroll', onUpdate)

    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Recompute pin/scrub positions once layout settles (fonts, images, route content).
    const refresh = () => ScrollTrigger.refresh()
    requestAnimationFrame(refresh)
    window.addEventListener('load', refresh, { once: true })

    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
  }, [])
}
