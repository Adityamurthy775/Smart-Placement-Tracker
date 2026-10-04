import * as React from "react"
import {
  Briefcase, CalendarDays, CheckCircle2, CircleSlash, Clock, MapPin, Users,
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
 * the registry's `text-base` renders at ~10px here.
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
          size.startsWith("h-12") ? "text-lg" : "text-sm",
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
 * @param {boolean} [props.readOnly]  hide student-only concerns (match %, Apply,
 *   Save) for roles that only oversee drives — the Admin roster view.
 * @param {number} [props.applicants] applicant count, shown in place of the
 *   match score when `readOnly` is set.
 * @param {() => void} [props.onEdit]    owner actions; hidden when absent.
 * @param {() => void} [props.onDelete]  owner actions; hidden when absent.
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
    readOnly = false,
    applicants,
    onEdit,
    onDelete,
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
        // Card ground is the dashboard's pale-blue wash (same hex as the
        // overview's "eligible" chips) so drives read as a set, not as white
        // boxes. Padding is deliberately tight: the type is large, so the card
        // does not also need to be big.
        "flex w-full max-w-sm flex-col rounded-3xl border border-[#d7e3f7] bg-[#e8effd] p-4 font-sans shadow-sm transition hover:border-[#b9cfef]",
        className,
      )}
    >
      {/* header: who is hiring, for what */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={postedBy.name} avatarUrl={postedBy.avatarUrl} />
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold text-[#0f172a]">{postedBy.name}</h2>
            <p className="truncate text-base font-semibold text-[#0a7d45]">{role}</p>
          </div>
        </div>
        <Badge variant="success">{status}</Badge>
      </div>

      {/* package, plus whichever number the viewer cares about: a personal match
          score for students, an applicant count for HR/Admin. Admin has no
          CGPA/branch of their own, so a match score would be meaningless. */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <p className="text-3xl font-bold tracking-tight text-[#0f172a]">{packageLabel}</p>
        {!readOnly && (
        <span
          className={cn(
            "flex items-center gap-1.5 text-lg font-bold",
            eligible ? "text-[#0a7d45]" : "text-[#b42318]",
          )}
        >
          {eligible ? <CheckCircle2 className="size-4" /> : <CircleSlash className="size-4" />}
          {eligible ? `${Math.round(matchPercentage)}% match` : "Not eligible"}
        </span>
        )}
        {/* readOnly viewers get the applicant count instead of a personal score. */}
        {readOnly && (
          <span className="flex items-center gap-1.5 text-lg font-bold text-[#0a7d45]">
            <Users className="size-4" />
            {applicants ?? 0} {applicants === 1 ? "applicant" : "applicants"}
          </span>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-base text-[#5a6b7d]">
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="muted">{tag}</Badge>
        ))}
      </div>

      {description && (
        <p className="mt-3 text-base leading-relaxed text-[#5a6b7d]">{description}</p>
      )}

      {/* recruiter */}
      <div className="mt-4 flex items-center gap-3 border-t border-[#d7e3f7] pt-4">
        <Avatar name={recruiter.name} avatarUrl={recruiter.avatarUrl} size="h-10 w-10" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-[#0f172a]">{recruiter.name}</p>
          <p className="truncate text-sm text-[#5a6b7d]">
            {recruiter.company}
            {recruiter.location ? ` · ${recruiter.location}` : ""}
          </p>
        </div>
      </div>

      {/* actions — this project's Button scale tops out at h-9 because the type
          scale is 0.8rem base, so the size is set here rather than via a
          variant. Apply and Save are student actions; Admin only oversees the
          drive roster, so the whole block is omitted rather than disabled. */}
      {!readOnly && (
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          onClick={onApply}
          disabled={!eligible || applied || applying}
          className="h-10 w-full rounded-full bg-[#0a7d45] px-5 text-base font-bold text-white hover:bg-[#12a25a]"
        >
          {applied ? "Applied" : applying ? "Sending…" : "Apply now"}
        </Button>
        <Button
          onClick={onSave}
          variant="outline"
          className="h-10 w-full rounded-full border-[#eceff2] px-5 text-base font-bold text-[#0f172a] hover:bg-[#f1f4f6]"
        >
          {saved ? "Saved" : "Save for later"}
        </Button>
      </div>
      )}

      {/* Owner actions. Rendered only when the caller supplies them, so a
          student card and an Admin's read-only card both stay action-free
          without needing to know about HR's permissions. */}
      {(onEdit || onDelete) && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {onEdit && (
            <Button
              onClick={onEdit}
              variant="outline"
              className="h-10 w-full rounded-full border-[#eceff2] px-5 text-base font-bold text-[#0f172a] hover:bg-[#f1f4f6]"
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              variant="outline"
              className="h-10 w-full rounded-full border-[#f3d3d1] px-5 text-base font-bold text-[#b42318] hover:bg-[#fdecec]"
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </MotionDiv>
  )
})

export { OpportunityCard }