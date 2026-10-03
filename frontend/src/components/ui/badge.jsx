import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        success: "border-[#c9ecd9] bg-[#e7f7ee] text-[#0a7d45]",
        warning: "border-[#f5e3bb] bg-[#fff7e0] text-[#8a6a00]",
        danger: "border-[#f5cfcd] bg-[#fdecec] text-[#b42318]",
        muted: "border-[#eceff2] bg-[#f1f4f6] text-[#5a6b7d]",
        outline: "border-[#eceff2] bg-white text-[#0f172a]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  )
}

// shadcn registry pattern: variants live next to the component
// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }