/**
 * Demo user seed.
 *
 *   npm run seed:demo
 *
 * Creates one account per role so the dashboard can be explored without
 * registering by hand. Safe to re-run: every user is upserted by email, and
 * only addresses on the reserved `example.com` demo domain are ever touched â€”
 * real accounts are never read, modified or deleted.
 *
 * All four accounts share the password below. Change it (and the emails) before
 * this is ever pointed at anything but a throwaway database.
 */
import { config } from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import { hash } from "bcryptjs";

import { userModel } from "./modules/UserModel.js";
import { StudentModel } from "./modules/StudentModel.js";
import { TeacherModel } from "./modules/TeacherModel.js";

config();

// Same DNS workaround as server.js: some resolvers return an IPv6 address for
// Atlas SRV records that this network cannot route, which surfaces as
// `querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net`. Forcing IPv4-first
// against public resolvers makes the seed connect the same way the server does.
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const DEMO_PASSWORD = "Demo@12345";
const DOMAIN = "example.com";

const USERS = [
  {
    email: `admin@${DOMAIN}`,
    name: "Demo Admin",
    role: "Admin",
    Id: "ADMIN-001",
    phone: "9000000001",
    designation: "TPO",
    department: "CSE",
  },
  {
    email: `teacher@${DOMAIN}`,
    name: "Demo Teacher",
    role: "Teacher",
    Id: "TEACH-001",
    phone: "9000000002",
    designation: "Assistant Professor",
    department: "CSE",
  },
  {
    email: `hr@${DOMAIN}`,
    name: "Demo HR",
    role: "HR",
    Id: "HR-001",
    phone: "9000000003",
    companyName: "Acme Corp",
    designation: "Recruiter",
  },
  {
    email: `student@${DOMAIN}`,
    name: "Demo Student",
    role: "Student",
    Id: "STU-001",
    phone: "9000000004",
    cgpa: "8.5",
    branch: "CSE",
    skills: "JavaScript, React, Node",
  },
];

async function seed() {
  if (!process.env.DB_URL) {
    console.error("DB_URL is not set â€” copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_URL);
  console.log("Connected to MongoDB");

  const hashedPassword = await hash(DEMO_PASSWORD, 12);

  for (const { email, name, role, Id, ...rest } of USERS) {
    // `profileCompleted` is what the dashboard reads to decide whether to show
    // the "finish your profile" prompt, so the demo users are filled in.
    const user = await userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          password: hashedPassword,
          role,
          Id,
          ...rest,
          profileCompleted: true,
          isActive: true,
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );

    // Side documents. Students and teachers get one so profile-driven screens
    // have something to read; the schemas require these fields, so skipping
    // them leaves a demo account that 500s on the first profile fetch.
    if (role === "Student") {
      await StudentModel.findOneAndUpdate(
        { Deatils: user._id },
        {
          $set: {
            Rollno: 1,
            Section: "A",
            CGPA: Number(rest.cgpa) || 8.5,
            Branch: rest.branch || "CSE",
            Backlogs: 0,
            linkedinUrl: "https://linkedin.com/in/demo-student",
            githubUrl: "https://github.com/demo-student",
            Skills: [
              { name: "JavaScript", level: "Advanced" },
              { name: "React", level: "Intermediate" },
            ],
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      );
    }

    if (role === "Teacher") {
      await TeacherModel.findOneAndUpdate(
        { Deatils: user._id },
        {
          $set: {
            Id: 1,
            designation: rest.designation,
            department: rest.department,
          },
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
      );
    }

    console.log(`  ${role.padEnd(8)} ${email}`);
  }

  console.log(`\nDone. Password for all accounts: ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

