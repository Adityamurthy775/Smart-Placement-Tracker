import { Children, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

export function FlowSection({ className, style = {}, children, 'aria-label': ariaLabel }) {
  return (
    <section
      data-flow-section
      aria-label={ariaLabel}
      className={cx('relative min-h-screen w-full overflow-hidden', className)}
    >
      <div
        data-flow-inner
        className={cx(
          'flow-art-container relative flex min-h-screen w-full flex-col justify-between gap-6 px-[4vw] pt-[clamp(2rem,8vw,4vw)] pb-[4vw]',
          'will-change-transform',
        )}
        style={{ transformOrigin: 'bottom left', ...style }}
      >
        {children}
      </div>
    </section>
  )
}

const childCount = (children) => Children.count(children)

export default function FlowArt({
  children,
  className,
  id,
  'aria-label': ariaLabel = 'Story scroll',
}) {
  const containerRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const childCountValue = childCount(children)

  useEffect(() => {
    if (!containerRef.current || reducedMotion) return undefined

    const sections = Array.from(containerRef.current.querySelectorAll('[data-flow-section]'))
    const triggers = []

    sections.forEach((section, index) => {
      gsap.set(section, { zIndex: index + 1 })
      const inner = section.querySelector('.flow-art-container')
      if (!inner) return

      if (index > 0) {
        gsap.set(inner, { rotation: 30, transformOrigin: 'bottom left' })
        const tween = gsap.to(inner, {
          rotation: 0,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 25%', scrub: true },
        })
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
      }

      if (index < sections.length - 1) {
        triggers.push(ScrollTrigger.create({
          trigger: section,
          start: 'bottom bottom',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
        }))
      }
    })

    ScrollTrigger.refresh()
    return () => {
      triggers.forEach((trigger) => trigger.kill())
      sections.forEach((section) => {
        const inner = section.querySelector('.flow-art-container')
        if (inner) gsap.killTweensOf(inner)
      })
    }
  }, [reducedMotion, childCountValue])

  return (
    <section
      ref={containerRef}
      id={id}
      aria-label={ariaLabel}
      className={cx('relative z-10 w-full overflow-hidden', className)}
    >
      {children}
    </section>
  )
}
