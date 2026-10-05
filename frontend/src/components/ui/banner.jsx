import { AlertTriangle, CircleCheck, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* Banner (astryx-banner port).
   @astryxdesign/* is a private Meta registry that does not resolve on the
   public npm registry, so `npm i @astryxdesign/core` fails. This local
   component mirrors the same API — status / title / description /
   endContent — on the project's Tailwind v4 tokens, lucide-react icons
   and the existing cn() util, so call sites stay interchangeable. */

const STATUS = {
  info: {
    tone: "border-[#c9dcf7] bg-[#e8effd] text-[#1e5bb8]",
    iconTone: "text-[#1e5bb8]",
    Icon: Info,
  },
  success: {
    tone: "border-[#c9ecd9] bg-[#e7f7ee] text-[#0a7d45]",
    iconTone: "text-[#0a7d45]",
    Icon: CircleCheck,
  },
  warning: {
    tone: "border-[#f5e3bb] bg-[#fff7e0] text-[#8a6a00]",
    iconTone: "text-[#8a6a00]",
    Icon: AlertTriangle,
  },
  error: {
    tone: "border-[#f5cfcd] bg-[#fdecec] text-[#b42318]",
    iconTone: "text-[#b42318]",
    Icon: XCircle,
  },
};

/**
 * @param {object} props
 * @param {"info"|"success"|"warning"|"error"} [props.status]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {import("react").ReactNode} [props.endContent]
 */
function Banner({ status = "info", title, description, endContent, className }) {
  const meta = STATUS[status] ?? STATUS.info;
  const { Icon } = meta;
  return (
    <div
      role="status"
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-4 py-3",
        meta.tone,
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", meta.iconTone)} />
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold leading-snug">{title}</p>
        {description ? (
          <p className="mt-0.5 text-sm leading-relaxed opacity-90">{description}</p>
        ) : null}
      </div>
      {endContent ? <div className="flex shrink-0 items-center">{endContent}</div> : null}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Banner };
export default Banner;
