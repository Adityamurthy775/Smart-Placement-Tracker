import cron from "node-cron";
import { DriveModel } from "../modules/DriveModel.js";
import { StudentModel } from "../modules/StudentModel.js";
import { ApplicationModel } from "../modules/ApplicationModel.js";
// import EmailService from "../modules/EmailService.js";

// Run every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  console.log("[Cron] Running deadline reminders job...");
  try {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(today.getDate() + 1);

    // Find active drives ending in exactly 3 days or 1 day (by date matching)
    // Note: For simplicity in this demo, we'll fetch all active drives and filter in JS
    const drives = await DriveModel.find({ isActive: true, status: { $in: ["UPCOMING", "ONGOING"] } });

    for (const drive of drives) {
      if (!drive.LastDate) continue;

      const diffTime = new Date(drive.LastDate).getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 3 || diffDays === 1) {
        // Find eligible students who haven't applied
        const applications = await ApplicationModel.find({ driveid: drive._id });
        const appliedStudentIds = applications.map(a => a.studentid.toString());

        const eligibleStudents = await StudentModel.find({
            isacivte: true,
            CGPA: { $gte: drive.MinCGPA },
            Branch: { $in: drive.AllowedBranch },
            _id: { $nin: appliedStudentIds }
        }).populate("Deatils"); // Assuming Deatils links to User model with email

        console.log(`[Cron] Drive ${drive.Title} ends in ${diffDays} day(s). Sending reminders to ${eligibleStudents.length} students.`);

        // In a real app, send actual emails using EmailService:
        /*
        for (const student of eligibleStudents) {
            const userEmail = student.Deatils?.email;
            if (userEmail) {
                await EmailService.sendReminderEmail(userEmail, drive.Title, diffDays);
            }
        }
        */
      }
    }
    console.log("[Cron] Deadline reminders job completed.");
  } catch (error) {
    console.error("[Cron Error]", error);
  }
});
