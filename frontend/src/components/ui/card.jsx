import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card"
    className={cn("rounded-3xl border border-[#eceff2] bg-white text-[#0f172a] shadow-sm", className)}
    {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} data-slot="card-header" className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} data-slot="card-title" className={cn("text-2xl font-bold leading-tight tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} data-slot="card-description" className={cn("text-base text-[#5a6b7d]", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardPanel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} data-slot="card-panel" className={cn("p-6 pt-0", className)} {...props} />
))
CardPanel.displayName = "CardPanel"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} data-slot="card-content" className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} data-slot="card-footer" className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardPanel }