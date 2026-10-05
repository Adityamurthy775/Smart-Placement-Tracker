/**
 * Dashboard demo data.
 *
 *   npm run seed:dashboard
 *
 * Gives the demo student a real application history so the KPI cards, the
 * placement tracker, the trend chart and the My Analytics section have
 * something to show, adds four drives whose deadlines fall inside the next 30
 * days so "Closing Soon" is populated, and adds three demo students on other
 * branches so "Branch Placements" has more than one bar.
 *
 * Idempotent, and scoped to the reserved example.com demo domain exactly the
 * way seed-demo.js is: only demo-domain applications are ever deleted or
 * written, and the extra drives are keyed by a "[demo]" title so re-running
 * never duplicates them. Real accounts and real applications are untouched.
 */
import { config } from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import { hash } from "bcryptjs";

import { userModel } from "./modules/UserModel.js";
import { StudentModel } from "./modules/StudentModel.js";
import { CompanyModel } from "./modules/CompanyModel.js";
import { DriveModel } from "./modules/DriveModel.js";
import { ApplicationModel } from "./modules/ApplicationModel.js";

// CompanyModel is imported for the side effect of registering the "company"
// model. DriveModel.companyId is a ref to it, and `.populate("companyId")`
// throws "Schema hasn't been registered for model" without it loaded.
void CompanyModel;

config();

// Same DNS workaround as server.js: some resolvers return an IPv6 address for
// Atlas SRV records that this network cannot route.
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const DOMAIN = "example.com";
const DEMO_EMAIL = `student@${DOMAIN}`;
const DEMO_PASSWORD = "Demo@12345";

const DAY = 24 * 60 * 60 * 1000;
const atDays = (offset) => {
  const at = new Date();
  at.setHours(10, 0, 0, 0);
  return new Date(at.getTime() + offset * DAY);
};

// company, role, package, status, daysAgo
const HISTORY = [
  ["infosys", "Full-Time", "12 LPA", "SELECTED", 148],
  ["Google", "Software Engineer", "10 LPA", "SELECTED", 131],
  ["Excelerate", "Software Engineer", "10 LPA", "REJECTED", 122],
  ["FaceBook", "Software Engineer", "20 LPA", "REJECTED", 110],
  ["Google", "Software Internship", "10 LPA", "SHORTLISTED", 96],
  ["Excelerate", "Full stack dev", "10 LPA", "SELECTED", 84],
  ["infosys", "Software Engineer", "12 LPA", "INTERVIEW", 71],
  ["Test", "Full stack dev", "10 LPA", "SHORTLISTED", 59],
  ["SWETRTYK", "Software Engineer", "10 LPA", "REJECTED", 47],
  ["Google", "Software Engineer", "10 LPA", "APPLIED", 38],
  ["Excelerate", "Software Internship", "10 LPA", "SHORTLISTED", 29],
  ["FaceBook", "Software Engineer", "20 LPA", "INTERVIEW", 21],
  ["infosys", "Full-Time", "12 LPA", "APPLIED", 14],
  ["SWETRTYK", "Software Engineer", "10 LPA", "APPLIED", 8],
  ["Google", "Software Internship", "10 LPA", "APPLIED", 3],
  // Applications onto the extra demo-HR drives so the HR dashboard and the
  // recruiter notification feed ("X applied to Y") have live rows.
  ["Acme Corp", "Software Engineer", "15 LPA", "SHORTLISTED", 5],
  ["TCS", "Software Engineer", "9 LPA", "APPLIED", 3],
];

// Extra demo students exist only so Branch Placements has more than one bar.
// [email, name, roll, section, branch, cgpa, [company, role, pkg, status, daysAgo]]
const PEERS = [
  ["student2", "Demo Student Two", 2, "B", "ECE", 8.1, [
    ["infosys", "Full-Time", "12 LPA", "SELECTED", 92],
    ["Google", "Software Engineer", "10 LPA", "REJECTED", 61],
    ["TCS", "Software Engineer", "9 LPA", "APPLIED", 2],
  ]],
  ["student3", "Demo Student Three", 3, "A", "AIML", 8.9, [
    ["Excelerate", "Software Engineer", "10 LPA", "SELECTED", 77],
    ["FaceBook", "Software Engineer", "20 LPA", "SHORTLISTED", 26],
    ["Acme Corp", "Software Engineer", "15 LPA", "INTERVIEW", 4],
  ]],
  ["student4", "Demo Student Four", 4, "C", "MECH", 7.6, [
    ["SWETRTYK", "Software Engineer", "10 LPA", "SELECTED", 54],
  ]],
];

// [title, company, role, package, daysFromNow, minCgpa, isActive?]
const UPCOMING_DRIVES = [
  ["[demo] Google Campus Drive", "Google", "Software Engineer", "10 LPA", 5, 7],
  ["[demo] Infosys Walk-in", "infosys", "Full-Time", "12 LPA", 11, 7],
  ["[demo] Excelerate Internship", "Excelerate", "Software Internship", "10 LPA", 19, 7.5],
  ["[demo] FaceBook Hackathon", "FaceBook", "Software Engineer", "20 LPA", 26, 7],
  // Extra drives owned by the demo HR. Two active, one paused (isActive false),
  // one with a deadline already passed — so the drives-tab Active/Inactive
  // dropdown has real rows in BOTH buckets after seeding.
  ["[demo] Acme Corp SDE Drive", "Acme Corp", "Software Engineer", "15 LPA", 8, 7],
  ["[demo] TCS Ninja Drive", "TCS", "Software Engineer", "9 LPA", 14, 6.5],
  ["[demo] Wipro Elite Drive", "Wipro", "Full stack dev", "8 LPA", 21, 6, false],
  ["[demo] Deloitte Analyst Drive", "Deloitte", "Business Analyst", "11 LPA", -5, 7],
];

// Timestamps the status transition implies, so the data reads consistently.
function statusStamps(status, appliedAt) {
  const stamps = {};
  if (status !== "APPLIED") stamps.shortlistedAt = new Date(appliedAt.getTime() + 3 * DAY);
  if (status === "INTERVIEW" || status === "SELECTED") {
    stamps.interviewedAt = new Date(appliedAt.getTime() + 7 * DAY);
  }
  if (status === "SELECTED") stamps.selectedAt = new Date(appliedAt.getTime() + 12 * DAY);
  if (status === "REJECTED") stamps.rejectedAt = new Date(appliedAt.getTime() + 10 * DAY);
  return stamps;
}

async function seed() {
  if (!process.env.DB_URL) {
    console.error("DB_URL is not set — copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_URL);
  console.log("Connected to MongoDB");

  const drives = await DriveModel.find().populate("companyId");
  if (!drives.length) {
    console.error("No drives in the database. Seed drives before this script.");
    await mongoose.disconnect();
    process.exit(1);
  }
  const named = (drive) => String(drive.companyId?.CompanyName || "").toLowerCase();
  const findDrive = (company) => drives.find((d) => named(d) === company.toLowerCase());

  /* 1. drives whose deadline lands inside the dashboard's 30-day window */
  const demoHR = await userModel.findOne({ email: `hr@${DOMAIN}` });
  let created = 0;
  // The demo drives this HR owns, keyed by company. Applications are attached to
  // these specifically: `findDrive(company)` returns the FIRST drive for a
  // company, which is a pre-existing drive owned by somebody else — HR's stats
  // scope to `hrId`, so applications landing there showed up nowhere on the HR
  // dashboard and every chart read zero.
  const demoDrives = new Map();
  for (const [title, company, role, pkg, days, minCgpa, active = true] of UPCOMING_DRIVES) {
    let source = findDrive(company);
    if (!source) {
      // The HR's own drives must not depend on somebody else having posted for
      // the company first — create the company so the drive can exist.
      let co = await CompanyModel.findOne({ CompanyName: company });
      if (!co) {
        co = await CompanyModel.create({
          CompanyName: company,
          CompanyId: Date.now(),
          Email: `${company.replace(/\s+/g, "").toLowerCase()}@example.com`,
          isActive: true,
        });
      }
      source = { companyId: co._id };
    }
    const companyId = source.companyId?._id ?? source.companyId;
    const existing = await DriveModel.findOne({ Title: title });
    if (existing) {
      // Re-running must refresh the window, otherwise the deadlines drift out
      // of the next-30-days range and Closing Soon empties again.
      await DriveModel.updateOne(
        { _id: existing._id },
        { $set: { LastDate: atDays(days), status: "UPCOMING", isActive: active, hrId: demoHR?._id } },
      );
      demoDrives.set(company.toLowerCase(), await DriveModel.findById(existing._id));
      continue;
    }
    const made = await DriveModel.create({
      companyId,
      hrId: demoHR?._id,
      Title: title,
      JobRole: role,
      Package: pkg,
      LastDate: atDays(days),
      MinCGPA: minCgpa,
      AllowedBranch: ["CSE", "AIML", "ALL"],
      status: "UPCOMING",
      description: "Seeded by seed-dashboard-demo.js for the dashboard demo.",
      isActive: active,
    });
    demoDrives.set(company.toLowerCase(), made);
    created += 1;
  }
  console.log(`  drives: ${created} created, ${UPCOMING_DRIVES.length - created} refreshed`);
  console.log(`  demo HR: ${demoHR ? demoHR.email : "NOT FOUND"} — charts will be empty without it`);

  /* 2. demo students */
  const password = await hash(DEMO_PASSWORD, 12);
  const demoUser = await userModel.findOne({ email: DEMO_EMAIL });
  const demoDoc = demoUser ? await StudentModel.findOne({ Deatils: demoUser._id }) : null;
  if (!demoUser || !demoDoc) {
    console.error(`No ${DEMO_EMAIL} student document. Run npm run seed:demo first.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const students = [
    {
      email: DEMO_EMAIL,
      doc: demoDoc,
      profile: {
        name: demoUser.name,
        email: demoUser.email,
        cgpa: String(demoUser.cgpa ?? ""),
        branch: demoUser.branch || "CSE",
      },
      apps: HISTORY,
    },
  ];

  // The `students` collection still carries a legacy unique index on `user`
  // (the field was renamed to `Deatils` in the model but the index was never
  // dropped). Writing through StudentModel leaves `user` undefined, so the
  // first peer would collide with the existing null. The peer document is
  // therefore written raw with BOTH fields populated, which satisfies the stale
  // index and still resolves for every StudentModel query.
  const studentDocs = mongoose.connection.db.collection("students");

  for (const [slug, name, roll, section, branch, cgpa, apps] of PEERS) {
    const email = `${slug}@${DOMAIN}`;
    const user = await userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          name, password, role: "Student", Id: `STU-00${roll}`,
          cgpa: String(cgpa), branch, phone: `900000001${roll}`,
          profileCompleted: true, isActive: true,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );
    const current = (await studentDocs.findOne({ user: user._id })) || { _id: new mongoose.Types.ObjectId() };
    await studentDocs.updateOne(
      { _id: current._id },
      {
        $set: {
          user: user._id,
          Deatils: user._id,
          Rollno: roll,
          Section: section,
          CGPA: cgpa,
          Branch: branch,
          Backlogs: 0,
          Skills: [{ name: "JavaScript", level: "Intermediate" }],
        },
      },
      // upsert is required: a plain replaceOne/updateOne matches nothing on the
      // first run and silently writes zero documents.
      { upsert: true },
    );
    students.push({
      email,
      doc: { _id: current._id },
      profile: { name, email, cgpa: String(cgpa), branch },
      apps,
    });
  }

  /* 3. applications: replace only the demo-domain rows */
  const emails = students.map((s) => s.email);
  const removed = await ApplicationModel.deleteMany({ studentEmail: { $in: emails } });

  const rows = [];
  let attachedToDemoDrives = 0;
  for (const student of students) {
    for (const [company, role, pkg, status, daysAgo] of student.apps) {
      // Prefer this HR's own drive so the HR dashboard (which scopes every
      // number to drives it owns) actually receives these applications.
      const drive =
        demoDrives.get(company.toLowerCase()) || findDrive(company) || drives[0];
      if (demoDrives.has(company.toLowerCase())) attachedToDemoDrives += 1;
      const appliedAt = atDays(-daysAgo);
      rows.push({
        studentid: student.doc._id,
        driveid: drive._id,
        driveId: String(drive._id),
        company,
        role,
        salary: pkg,
        status,
        studentName: student.profile.name,
        studentEmail: student.profile.email,
        studentCgpa: student.profile.cgpa,
        studentBranch: student.profile.branch,
        appliedDate: appliedAt.toLocaleDateString(),
        appliedAt,
        ...statusStamps(status, appliedAt),
      });
    }
  }
  const inserted = await ApplicationModel.insertMany(rows);

  console.log(`  applications: ${removed.deletedCount} removed, ${inserted.length} inserted`);
  console.log(`    of those, ${attachedToDemoDrives} landed on the demo HR's drives (the rest need a matching company drive)`);
  console.log(`  students: ${students.length} (${emails.join(", ")})`);
  console.log(`\nDone. Password for all demo accounts: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
