# Graph Report - Smart-Placement-Tracker-main  (2026-09-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 460 nodes · 638 edges · 22 communities (21 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21

## God Nodes (most connected - your core abstractions)
1. `react` - 15 edges
2. `mongoose` - 11 edges
3. `express` - 11 edges
4. `react-router` - 9 edges
5. `aliases` - 6 edges
6. `tailwind` - 6 edges
7. `GlyphPortal()` - 5 edges
8. `TeacherReports()` - 5 edges
9. `scripts` - 5 edges
10. `ApplicationModel` - 5 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `useLenis()`  [EXTRACTED]
  frontend/src/components/RootLayout.jsx → frontend/src/lib/useLenis.js

## Import Cycles
- None detected.

## Communities (22 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (139): accentBg, accentBgHover, accentBorderFocus, accentRingFocus, accentText, black, cardClass, cardDesc (+131 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (36): name, overrides, es-toolkit, private, scripts, build, dev, lint (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (24): App(), RAMP, visitsConfig, Footer(), groups, socials, Header(), Login() (+16 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (19): ApplyJobModal(), fileToDataUrl(), getCompanyName(), groupCount(), HRDashboard(), isProfileComplete(), Mainpage(), printReport() (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (27): dependencies, axios, chart.js, class-variance-authority, clsx, @emailjs/browser, @fontsource-variable/geist, gsap (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (19): Home(), STEPS, THEME, Preloader(), WORD, calculateHeight(), Component(), GradientBars() (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (17): dependencies, bcryptjs, cloudinary, cookie-parser, cors, dns, dotenv, express (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (14): author, description, keywords, license, main, name, type, version (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.21
Nodes (9): Adminapp, CompanyModel, CompanyModels, DriveModel, DriveSchema, skills, StudentModel, StudentModels (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (9): Schedulerapp, Studentapp, ApplicationModel, ApplicationSchema, InterviewSlotModel, InterviewSlotSchema, notificationModel, notificationSchema (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (8): googleClient, userapp, upload, userModel, userSchema, bcryptjs, google-auth-library, multer

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (5): Analyticsapp, Driveapp, allowedOrigins, app, express

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react, @types/react-dom (+2 more)

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (7): ChartContext, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION, THEMES, useChart()

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (5): notifyapp, statusMessages, sendEmail(), transporter, nodemailer

### Community 16 - "Community 16"
Cohesion: 0.40
Nodes (4): Companyapp, verifyToken(), dotenv, jsonwebtoken

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (5): clamp(), GlyphPortal(), interior(), scrollParent(), smooth()

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (3): Teacherapp, TeacherModel, TeacherModels

### Community 20 - "Community 20"
Cohesion: 0.50
Nodes (4): scripts, dev, start, test

### Community 21 - "Community 21"
Cohesion: 0.50
Nodes (3): compilerOptions, baseUrl, paths

## Knowledge Gaps
- **275 isolated node(s):** `accentBg`, `accentBgHover`, `accentBorderFocus`, `accentRingFocus`, `accentText` (+270 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 295 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 2` to `Community 1`, `Community 3`, `Community 5`, `Community 14`, `Community 17`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `react-router` connect `Community 2` to `Community 1`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **What connects `accentBg`, `accentBgHover`, `accentBorderFocus` to the rest of the system?**
  _275 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.014285714285714285 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.056910569105691054 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1126984126984127 - nodes in this community are weakly interconnected._