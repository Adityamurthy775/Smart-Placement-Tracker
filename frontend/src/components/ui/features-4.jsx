import { BadgeCheck, Bell, Bot, Building2, CalendarCheck, ClipboardCheck, FileText, GitBranch, GraduationCap, KeyRound, LayoutDashboard, Mail, ScanEye, Search, Send, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "tracking", label: "Tracking", features: [
    { icon: GraduationCap, title: "Student profiles", description: "Skills, resumes, eligibility and preferences live on one searchable profile per student." },
    { icon: CalendarCheck, title: "Live placement drives", description: "Drives go live the moment a recruiter posts — eligibility, deadlines and slots in one place." },
    { icon: TrendingUp, title: "Placement analytics", description: "Branch-wise and company-wise hiring trends update in real time as offers land." } ] },
  { value: "automation", label: "Automation", features: [
    { icon: Send, title: "Bulk outreach", description: "Email eligible students about a drive in one click — no spreadsheets, no BCC chains." },
    { icon: Bot, title: "Smart shortlists", description: "Auto-match students to drives by branch, CGPA and skills before a human reviews." },
    { icon: Bell, title: "Deadline reminders", description: "Scheduled nudges for applications, interviews and offer acceptances with built-in retries." } ] },
  { value: "collaboration", label: "Collaboration", features: [
    { icon: Users, title: "Placement cell workspace", description: "Coordinators share one workspace with granular roles and instant student invites." },
    { icon: Building2, title: "Recruiter portal", description: "Recruiters shortlist, schedule and update candidate status without leaving the platform." },
    { icon: ClipboardCheck, title: "Interview rounds", description: "Log mock-round feedback per student so weak areas surface before the real interview." } ] },
  { value: "records", label: "Records", features: [
    { icon: FileText, title: "Offer letters", description: "Every offer recorded against the student, company and drive — signed and sealed." },
    { icon: KeyRound, title: "Role-based access", description: "Students, coordinators and recruiters each see exactly what they should — nothing more." },
    { icon: Search, title: "Audit trail", description: "Every status change is timestamped and traceable, from applied to offered." } ] },
];

const STRIP = [
  { icon: LayoutDashboard, label: "Dashboards" },
  { icon: Mail, label: "Email alerts" },
  { icon: ShieldCheck, label: "Verified records" },
  { icon: ScanEye, label: "Eligibility checks" },
  { icon: BadgeCheck, label: "Offer tracking" },
];

function FeatureCard({ feature }) {
  const Icon = feature.icon;
  return (
    <Card className={cn("group flex h-full flex-col gap-5 rounded-3xl border border-secondary bg-card p-7 sm:p-8", "transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50", "hover:shadow-[0_20px_50px_-20px_rgba(99,153,187,0.5)]")}>
      <div className={cn("flex size-12 items-center justify-center rounded-xl", "bg-secondary text-primary transition-colors", "group-hover:bg-primary group-hover:text-primary-foreground")}>
        <Icon className="size-6" />
      </div>
      <div className="space-y-2">
        <h3 className="font-heading text-xl font-semibold text-card-foreground sm:text-2xl">{feature.title}</h3>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{feature.description}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 pt-2 text-sm font-semibold text-muted-foreground">
        <GitBranch className="size-4" />
        Included on every plan
      </div>
    </Card>
  );
}

export default function FeaturesBlock(props) {
  const eyebrow = props.eyebrow ?? "Built for placement cells";
  const title = props.title ?? "Everything You Need";
  const description = props.description ?? "Student tracking, drive automation, recruiter collaboration and trustworthy records — together in one connected platform.";
  const defaultTab = props.defaultTab ?? "tracking";
  return (
    <section id="features" className="section-wash flex w-full items-center justify-center px-6 py-16 text-foreground sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-sm">
            <Sparkles data-icon="inline-start" className="size-4" />
            {eyebrow}
          </Badge>
          <h2 className="mt-5 font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-pretty text-xl leading-relaxed text-muted-foreground sm:text-2xl">{description}</p>
        </div>
        <Tabs defaultValue={defaultTab} className="mt-10 w-full items-center">
          <TabsList className="h-auto flex-wrap gap-1 rounded-xl p-1">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="rounded-lg px-5 py-2 text-base font-semibold">{tab.label}</TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-8">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {tab.features.map((feature) => (
                  <FeatureCard key={feature.title} feature={feature} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border pt-8 text-muted-foreground">
          {STRIP.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2 text-base font-semibold">
              <item.icon className="size-5 text-primary" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export { FeaturesBlock };

