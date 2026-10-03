import * as React from "react"
import {
  Briefcase, CalendarDays, CheckCircle2, CircleSlash, Clock, MapPin,
} from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/**
 * card-12 — recruitment drive card (shadcn registry block, JSX port).
 *
 * This project is plain JSX (no TypeScript), so the registry's `.tsx` props
 * interface became a JSDoc block. Text sizes sit one step above the registry
 * default on purpose: the site's type scale is 0.8rem base (see index.css), so
 * the registry's `text-sm` renders at ~10px here.
 */

function initialsOf(name) {
  return String(name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

function Avatar({ name, avatarUrl, size = "h-12 w-12" }) {
  const [broken, setBroken] = React.useState(false)
  if (!avatarUrl || broken) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-[#0a7d45] font-bold text-white",
          size,
          size.startsWith("h-12") ? "text-base" : "text-xs",
        )}
      >
        {initialsOf(name)}
      </span>
    )
  }
  return (
    <img
      src={avatarUrl}
      alt={name}
      onError={() => setBroken(true)}
      className={cn("shrink-0 rounded-full object-cover", size)}
    />
  )
}

const MotionDiv = motion.div

/**
 * @param {object} props
 * @param {string} props.status          drive status badge, e.g. "Open"
 * @param {{name:string, avatarUrl?:string, company?:string, location?:string}} props.postedBy
 * @param {string} props.packageLabel     package text, e.g. "12 LPA"
 * @param {string} props.role             job role
 * @param {string} props.deadline         human deadline, e.g. "14 Oct · 9 days left"
 * @param {number} props.matchPercentage  profile match, 0-100
 * @param {boolean} props.eligible        clears eligibility for this student
 * @param {string[]} props.tags
 * @param {string} props.description
 * @param {{name:string, avatarUrl?:string, company?:string, location?:string}} props.recruiter
 * @param {() => void} props.onApply
 * @param {() => void} props.onSave
 * @param {boolean} [props.applied]
 * @param {boolean} [props.applying]
 * @param {boolean} [props.saved]
 * @param {string} [props.className]
 */
const OpportunityCard = React.forwardRef(function OpportunityCard(
  {
    status,
    postedBy,
    packageLabel,
    role,
    deadline,
    matchPercentage,
    eligible = true,
    tags = [],
    description,
    recruiter,
    onApply,
    onSave,
    applied = false,
    applying = false,
    saved = false,
    className,
  },
  ref,
) {
  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } },
  }

  return (
    <MotionDiv
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex w-full max-w-lg flex-col rounded-3xl border border-[#eceff2] bg-white p-6 font-sans shadow-sm",
        className,
      )}
    >
      {/* header: who is hiring, for what */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={postedBy.name} avatarUrl={postedBy.avatarUrl} />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-[#0f172a]">{postedBy.name}</h2>
            <p className="truncate text-sm font-semibold text-[#0a7d45]">{role}</p>
          </div>
        </div>
        <Badge variant="success">{status}</Badge>
      </div>

      {/* package + the one number that decides whether to apply */}
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <p className="text-4xl font-bold tracking-tight text-[#0f172a]">{packageLabel}</p>
        <span
          className={cn(
            "flex items-center gap-1.5 text-sm font-bold",
            eligible ? "text-[#0a7d45]" : "text-[#b42318]",
          )}
        >
          {eligible ? <CheckCircle2 className="size-4" /> : <CircleSlash className="size-4" />}
          {eligible ? `${Math.round(matchPercentage)}% match` : "Not eligible"}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#5a6b7d]">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" />
          <span className="truncate">Closes {deadline}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0" />
          <span className="truncate">{postedBy.company}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="size-4 shrink-0" />
          <span className="truncate">Full time</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{postedBy.location || "Campus drive"}</span>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="muted">{tag}</Badge>
        ))}
      </div>

      {description && (
        <p className="mt-4 text-sm leading-relaxed text-[#5a6b7d]">{description}</p>
      )}

      {/* recruiter */}
      <div className="mt-5 flex items-center gap-3 border-t border-[#f1f4f6] pt-5">
        <Avatar name={recruiter.name} avatarUrl={recruiter.avatarUrl} size="h-10 w-10" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#0f172a]">{recruiter.name}</p>
          <p className="truncate text-xs text-[#8a97a5]">
            {recruiter.company}
            {recruiter.location ? ` · ${recruiter.location}` : ""}
          </p>
        </div>
      </div>

      {/* actions — this project's Button scale tops out at h-9 because the type
          scale is 0.8rem base, so the size is set here rather than via a
          variant. */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          onClick={onApply}
          disabled={!eligible || applied || applying}
          className="h-12 w-full rounded-full bg-[#0a7d45] px-6 text-base font-bold text-white hover:bg-[#12a25a]"
        >
          {applied ? "Applied" : applying ? "Sending…" : "Apply now"}
        </Button>
        <Button
          onClick={onSave}
          variant="outline"
          className="h-12 w-full rounded-full border-[#eceff2] px-6 text-base font-bold text-[#0f172a] hover:bg-[#f1f4f6]"
        >
          {saved ? "Saved" : "Save for later"}
        </Button>
      </div>
    </MotionDiv>
  )
})

export { OpportunityCard }