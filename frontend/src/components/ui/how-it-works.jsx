import { cn } from "@/lib/utils";
import { Layers, Search, Zap } from "lucide-react";

// The props for a single step card
const StepCard = ({ icon, title, description, benefits }) => (
  <div
    className={cn(
      "relative rounded-2xl border border-secondary bg-card p-6 text-card-foreground transition-all duration-300 ease-in-out",
      "hover:scale-105 hover:shadow-lg hover:border-accent hover:bg-card"
    )}
  >
    {/* Icon */}
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary">
      {icon}
    </div>
    {/* Title and Description */}
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="mb-6 text-muted-foreground">{description}</p>
    {/* Benefits List */}
    <ul className="space-y-3">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-center gap-3">
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
          </div>
          <span className="text-muted-foreground">{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * A responsive "How It Works" section that displays a 3-step process.
 * It is styled with shadcn/ui theme variables to support light and dark modes.
 */
export const HowItWorks = ({ className, ...props }) => {
  const stepsData = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Create your profile",
      description:
        "Sign up and build a rich profile with skills, resume and preferences in minutes.",
      benefits: [
        "Skills, resume and preferences in minutes",
        "Guided setup with smart defaults",
        "Verified student and recruiter accounts",
      ],
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Apply to drives",
      description:
        "Browse live placement drives matched to you, apply with one click and track every application.",
      benefits: [
        "Drives matched to your profile",
        "One-click applications",
        "Real-time status for every application",
      ],
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Get placed",
      description:
        "Interview, receive offers and monitor your success rate in real time.",
      benefits: [
        "Interview schedules and mock rounds",
        "Offer letters in one place",
        "Live placement analytics",
      ],
    },
  ];

  return (
    <section
      id="how-it-works"
      className={cn("w-full bg-background py-16 sm:py-24", className)}
      {...props}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          {/* Eyebrow stays Text: Primary on Background is 2.8:1 and this is
              small type. Primary is reserved for icons, borders and large shapes. */}
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
            Our Process
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From registration to offer letter — a streamlined path designed for
            clarity, built for students, recruiters and placement teams.
          </p>
        </div>

        {/* Step Indicators with Connecting Line */}
        <div className="relative mx-auto mb-8 w-full max-w-4xl">
          <div
            aria-hidden="true"
            className="absolute left-[16.6667%] top-1/2 h-0.5 w-[66.6667%] -translate-y-1/2 bg-border"
          ></div>
          {/* Use grid to align numbers with the card grid below */}
          <div className="relative grid grid-cols-3">
            {stepsData.map((_, index) => (
              <div
                key={index}
                // Center the number within its grid column
                className="flex h-8 w-8 items-center justify-center justify-self-center rounded-full bg-muted font-semibold text-foreground ring-4 ring-background"
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Steps Grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {stepsData.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              benefits={step.benefits}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
