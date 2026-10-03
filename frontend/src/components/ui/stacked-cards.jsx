import { useState } from 'react'
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs'

/** Position of a card inside the stack: 0 = front, 1/2 = peeking behind, 3+ = hidden (exited). */
function stackStyle(pos) {
  if (pos === 0) return { transform: 'translateX(0) scale(1)', opacity: 1, zIndex: 30 }
  if (pos === 1) return { transform: 'translateX(-44px) scale(0.955)', opacity: 1, zIndex: 20 }
  if (pos === 2) return { transform: 'translateX(-84px) scale(0.915) rotate(-2deg)', opacity: 0.55, zIndex: 10 }
  return { transform: 'translateX(-132px) scale(0.88) rotate(-4deg)', opacity: 0, zIndex: 5 }
}

/**
 * Interactive stacked-card showcase (reference: layered card deck with
 * prev/next controls and a big headline that follows the front card).
 * items: [{ icon, title, desc }]
 */
export default function StackedShowcase({ items, eyebrow = 'Interactive showcase' }) {
  const [active, setActive] = useState(0)
  const count = items.length
  const go = (dir) => setActive((prev) => (prev + dir + count) % count)
  const current = items[active]

  return (
    <section
      className="relative mx-auto max-w-7xl overflow-x-clip px-6 py-24"
      aria-label={eyebrow}
    >
      {/* faint grid, like the reference */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 40%, transparent 100%)',
        }}
      />

      <div className="relative grid items-center gap-14 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* Card stack */}
        <div className="relative mx-auto h-[400px] w-full max-w-[400px] lg:mx-0">
          {items.map((item, i) => {
            const pos = (i - active + count) % count
            return (
              <article
                key={item.title}
                onClick={() => pos === 0 && go(1)}
                aria-hidden={pos !== 0}
                className={`absolute inset-0 flex flex-col rounded-[28px] border border-white/10 bg-[#141416] p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] ${
                  pos === 0 ? 'cursor-pointer' : 'pointer-events-none'
                }`}
                style={{
                  ...stackStyle(pos),
                  transition: 'transform .65s cubic-bezier(.22,1,.36,1), opacity .5s ease',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-white shadow-[0_12px_30px_-12px_rgba(239,68,68,0.9)]">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-white/40" />
                </div>

                <div className="mt-auto">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-400">
                    {String(i + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">{item.desc}</p>
                </div>
              </article>
            )
          })}
        </div>

        {/* Copy + controls */}
        <div>
          <p key={`eyebrow-${active}`} className="animate-fade-in text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
            {eyebrow} — {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </p>
          <h2
            key={`title-${active}`}
            className="animate-fade-in mt-5 text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {current.title}
          </h2>
          <p
            key={`desc-${active}`}
            className="animate-fade-in mt-6 max-w-xl text-lg leading-relaxed text-gray-400"
          >
            {current.desc}
          </p>

          <div className="mt-10 flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous card"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-gray-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/50 hover:text-white"
            >
              <BsArrowLeft className="text-lg" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next card"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(255,255,255,0.4)]"
            >
              <BsArrowRight className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
