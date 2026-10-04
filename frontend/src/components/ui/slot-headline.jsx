import * as React from "react";
import {
  BsLightning,
  BsHeart,
  BsPeople,
  BsBook,
  BsGraphUp,
  BsBriefcase,
} from "react-icons/bs";

export const SLOT_ITEMS = [
  { name: "placements", icon: BsBriefcase, color: "#ef4444" },
  { name: "opportunities", icon: BsLightning, color: "#f59e0b" },
  { name: "careers", icon: BsGraphUp, color: "#22c55e" },
  { name: "skills", icon: BsBook, color: "#3b82f6" },
  { name: "network", icon: BsPeople, color: "#a855f7" },
  { name: "growth", icon: BsHeart, color: "#ec4899" },
];

const ROW_EM = 1.25;

const HIDDEN = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function SlotHeadline({
  prefix = "Your future in",
  items = SLOT_ITEMS,
  interval = 1900,
  duration = 600,
  playing = true,
  onIndexChange,
  as: Tag = "h1",
  className,
  badgeClassName,
  iconClassName,
  ...props
}) {
  const rotates = items.length > 1;
  const [index, setIndex] = React.useState(0);
  const [animate, setAnimate] = React.useState(true);
  const reduced = usePrefersReducedMotion();

  React.useEffect(() => {
    if (!playing || !rotates) return;
    const id = setInterval(
      () => setIndex((v) => (v >= items.length ? v : v + 1)),
      Math.max(duration, interval)
    );
    return () => clearInterval(id);
  }, [playing, rotates, items.length, interval, duration]);

  React.useEffect(() => {
    if (index === items.length) {
      const timer = setTimeout(() => {
        setAnimate(false);
        setIndex(0);
      }, duration);
      return () => clearTimeout(timer);
    }
    if (index === 0 && !animate) {
      const raf = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [index, animate, items.length, duration]);

  const current = items.length ? index % items.length : 0;

  React.useEffect(() => {
    onIndexChange?.(current);
  }, [current]);

  const rows = rotates ? [...items, items[0]] : items;
  const motion = reduced ? "none" : `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;

  return (
    <Tag className={className} {...props}>
      {prefix ? <span className="slot-headline-prefix">{prefix} </span> : null}
      {/* Default badge field is Secondary, not red — `text-red-400` on a light
          page is 3.2:1. Both current callers pass `badgeClassName` anyway. */}
      <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 align-middle ${badgeClassName || "bg-secondary/40 text-foreground"}`} aria-hidden="true">
        <span style={HIDDEN}>{items[current]?.name}</span>
        <span className="relative inline-block overflow-hidden" style={{ height: `${ROW_EM}em` }}>
          <span
            className="block"
            style={{
              transform: `translateY(${-index * ROW_EM}em)`,
              transition: animate ? motion : "none",
            }}
          >
            {rows.map(({ name, icon: Mark, color }, i) => (
                <span className="flex items-center gap-1 whitespace-nowrap" key={i} style={{ height: `${ROW_EM}em`, lineHeight: `${ROW_EM}em`, color: color || "currentColor" }}>
                  {/* No inline colour here on purpose: an inline style would beat
                      `iconClassName`, and the spec wants the mark in Primary while
                      the rotating word itself stays Text. */}
                  {Mark ? <Mark size="0.85em" className={iconClassName} /> : null}
                  {name}
                </span>
              ))}
          </span>
        </span>
      </span>
    </Tag>
  );
}

export function SlotLoader({
  message = "Loading your",
  help = "Hang tight a moment",
  items = SLOT_ITEMS,
  compact = false,
  className,
  onDark = false,
}) {
  /* Text here is Text, and the rotating words are Text too. The old build
     passed SLOT_ITEMS' hardcoded hexes (#ef4444, #22c55e, …) straight through
     as inline `color`, which is both off-palette and unreadable on the light
     preloader: red on #ebf3ff is ~3.6:1. Overriding every item to Text keeps
     the rotation legible, and the Primary mark is the only colour.

     `onDark` flips the whole set to white for callers that sit on a dark
     ground (the preloader overlay). The rotating rows are coloured with an
     inline `style`, so a className on the wrapper cannot reach them — the
     ink has to be swapped here, not outside. */
  const ink = onDark ? "#ffffff" : "#071005";
  const textItems = items.map((item) => ({ ...item, color: ink }));

  return (
    <div
      className={`flex flex-col items-center gap-2 ${compact ? "text-sm" : "text-base"} ${
        onDark ? "text-white" : "text-foreground"
      } ${className || ""}`}
      role="status"
    >
      <SlotHeadline
        as="div"
        prefix={message}
        items={[{ name: "matches", icon: BsLightning, color: ink }, ...textItems]}
        badgeClassName={onDark ? "bg-white/15 text-white" : "bg-secondary/40 text-foreground"}
        iconClassName={onDark ? "text-white" : "text-primary"}
      />
      <p
        className={`text-xs font-mono tracking-wider uppercase ${
          onDark ? "text-white/70" : "text-muted-foreground"
        }`}
      >
        {help}
      </p>
    </div>
  );
}

export default SlotHeadline;
