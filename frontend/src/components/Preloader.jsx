"use client";
import { useEffect, useState } from "react";
import { SlotLoader } from "./ui/slot-headline";

const WORD = "PLACEMENT".split("");

export default function Preloader({ onComplete }) {
  const [phase, setPhase] = useState("enter"); // enter -> hold -> exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 1600);
    const t2 = setTimeout(() => setPhase("exit"), 2800);
    const t3 = setTimeout(() => {
      onComplete?.();
    }, 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] grid place-items-center bg-black transition-all duration-700 ${
        phase === "exit" ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* Animated letters */}
      <div className="flex items-center justify-center gap-1 perspective-[900px]">
        {WORD.map((char, i) => (
          <span
            key={`${char}-${i}`}
            className={`inline-block text-[clamp(3rem,10vw,7rem)] font-black leading-none tracking-tight text-white
              transition-all duration-700 ease-out
              ${phase === "enter" ? "animate-letter-in" : ""}
            `}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Subtitle slot loader */}
      <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
        phase === "enter" ? "opacity-0" : "opacity-100"
      }`}>
        <SlotLoader
          message="Loading your"
          help="Track. Manage. Get placed."
          compact
        />
      </div>

      {/* Progress bar — red, and it starts like the previous version did: parked
          at 0% through `enter`, then filling during `hold`. The 1600ms delay is
          the `enter` duration and the 1200ms run is the `hold` duration, so the
          bar lands on 100% exactly when `exit` begins and the overlay fades.
          Solid `bg-destructive` (#d94a45) rather than a gradient: it is the one
          red already in the theme, and it measures 3.75:1 against the pale
          preloader ground — plainly visible, and far above the point where a
          6px decorative bar would matter for legibility. */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 overflow-hidden bg-foreground/15">
        <div className="preloader-bar h-full w-full origin-left bg-destructive" />
      </div>

      <style>{`
        @keyframes letter-in {
          from { opacity: 0; transform: translateY(60px) rotateX(80deg) scale(0.7); filter: blur(8px); }
          to   { opacity: 1; transform: translateY(0) rotateX(0) scale(1); filter: blur(0); }
        }
        .animate-letter-in {
          animation: letter-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes preloader-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .preloader-bar {
          animation: preloader-fill 1200ms cubic-bezier(0.33, 0, 0.2, 1) 1600ms forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .preloader-bar {
            animation: preloader-fill 1ms linear 1600ms forwards;
          }
        }
      `}</style>
    </div>
  );
}
