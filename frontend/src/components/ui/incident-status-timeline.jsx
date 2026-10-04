import { ChevronDownIcon, CircleAlertIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Registry block, JSX port. The sample incident data became props so the
// application timeline can drive it with a student's real status history.
const STATUS_VARIANT = {
  investigating: "danger",
  identified: "warning",
  monitoring: "success",
  resolved: "success",
  applied: "muted",
  shortlisted: "info",
  interview: "warning",
  selected: "success",
  rejected: "danger",
}

/**
 * @param {object} props
 * @param {string} props.title              header line
 * @param {string} [props.subtitle]         second header line
 * @param {string} [props.statusLabel]      badge text, e.g. "In progress"
 * @param {'success'|'warning'|'danger'|'info'|'muted'} [props.statusVariant]
 * @param {{status:string, message:string, time:string}[]} props.events
 * @param {string} [props.footer]           line under the separator
 * @param {boolean} [props.open]            timeline expanded on mount
 * @param {string} [props.triggerLabel]
 * @param {string} [props.className]
 */
export function StatusTimeline({
  title,
  subtitle,
  statusLabel,
  statusVariant = 'info',
  events = [],
  footer,
  open = true,
  triggerLabel = 'View timeline',
  className,
}) {
  const safeEvents = Array.isArray(events) ? events : []

  return (
    <div className={cn('w-full', className)}>
      <Card>
        <Collapsible defaultOpen={open}>
          <CardHeader className="border-b pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CircleAlertIcon className="mt-1 size-4 shrink-0 text-[#8a6a00]" />
                <div className="min-w-0">
                  <CardTitle className="truncate text-lg leading-snug">{title}</CardTitle>
                  {subtitle && (
                    <p className="mt-0.5 text-sm text-[#5a6b7d]">{subtitle}</p>
                  )}
                </div>
              </div>
              {statusLabel && (
                <Badge size="sm" variant={statusVariant}>
                  {statusLabel}
                </Badge>
              )}
            </div>
            <CollapsibleTrigger className="mt-2 inline-flex items-center gap-1 text-sm text-[#5a6b7d] transition-colors hover:text-[#0f172a]">
              {triggerLabel}
              <ChevronDownIcon className="size-3.5 transition-transform duration-200 in-data-panel-open:rotate-180" />
            </CollapsibleTrigger>
          </CardHeader>

          <CollapsiblePanel>
            <CardPanel className="py-3">
              {safeEvents.length === 0 ? (
                <p className="py-4 text-sm text-[#8a97a5]">Nothing recorded yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute top-1 bottom-1 left-[0.4375rem] w-px bg-[#eceff2]" />
                  <div className="space-y-4">
                    {safeEvents.map((event, i) => (
                      <div className="relative flex gap-3" key={`${event.status}-${event.time}-${i}`}>
                        <div className="relative z-10 mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border border-[#eceff2] bg-white">
                          <div
                            className={cn(
                              'size-1.5 rounded-full',
                              i === safeEvents.length - 1 ? 'bg-[#12a25a]' : 'bg-[#c3d7ec]',
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge size="sm" variant={STATUS_VARIANT[event.status] || 'muted'}>
                              {event.status}
                            </Badge>
                            <span className="text-xs text-[#8a97a5]">{event.time}</span>
                          </div>
                          <p className="text-sm leading-relaxed text-[#5a6b7d]">{event.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {footer && (
                <>
                  <Separator className="mt-4 mb-3" />
                  <p className="text-sm text-[#5a6b7d]">{footer}</p>
                </>
              )}
            </CardPanel>
          </CollapsiblePanel>
        </Collapsible>
      </Card>
    </div>
  )
}

export default StatusTimeline