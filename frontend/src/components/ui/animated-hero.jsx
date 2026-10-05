import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * AnimatedHero — rotating-word hero, blended with the site light theme.
 *
 * Light theme: `bg-background` ground, dark `text-foreground` ink, muted
 * paragraph. The rotating word sits in Primary so it stays legible on the
 * pale ground (white-on-light would fail contrast).
 *
 * Props (all optional — sensible placement-tracker defaults ship built in):
 * - `titles`: rotating words
 * - `prefix`: static headline lead-in
 * - `description`: sub-copy
 * - `badgeLabel`, `primaryLabel`, `secondaryLabel`
 * - `onPrimaryClick`, `onSecondaryClick`, `onBadgeClick`
 */
function Hero({
  titles: titlesProp,
  prefix = "Track every",
  description = "Student profiles, placement drives, recruiter management, email notifications, analytics, and tracking all sit together in one focused workspace.",
  badgeLabel = "Placement Report 2026 — live now",
  primaryLabel = "Get started",
  secondaryLabel = "Talk to us",
  onPrimaryClick,
  onSecondaryClick,
  onBadgeClick,
  className,
}) {
  const titles = useMemo(
    () => titlesProp ?? ["placement", "career", "opportunity", "drive", "future"],
    [titlesProp]
  );
  const [titleNumber, setTitleNumber] = useState(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((v) => (v === titles.length - 1 ? 0 : v + 1));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className={cn("w-full bg-background text-foreground", className)}>
      <div className="container mx-auto px-6 sm:px-8">
        <div className="flex gap-8 py-20 lg:py-28 items-center justify-center flex-col">
          <div>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 rounded-full font-semibold"
              onClick={onBadgeClick}
            >
              {badgeLabel} <MoveRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-4 flex-col items-center">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-heading font-bold text-foreground">
              <span>{prefix}</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 min-h-[1.2em]">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={`${title}-${index}`}
                    className="absolute font-bold text-primary whitespace-nowrap"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              {description}
            </p>
          </div>

          {/* Social proof — real Unsplash faces (stable photo IDs) */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&q=80&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&q=80&auto=format&fit=crop",
              ].map((src) => (
                <img
                  key={src}
                  src={src}
                  alt="Placed student"
                  loading="lazy"
                  className="h-8 w-8 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by <span className="font-bold text-foreground">5,000+ students</span> and 250+ recruiters
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="gap-2 rounded-full font-semibold"
              variant="outline"
              onClick={onSecondaryClick}
            >
              {secondaryLabel} <PhoneCall className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              className="gap-2 rounded-full font-semibold"
              onClick={onPrimaryClick}
            >
              {primaryLabel} <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
