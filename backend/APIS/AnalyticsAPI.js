import exp from "express";
import { ApplicationModel } from "../modules/ApplicationModel.js";
import { DriveModel } from "../modules/DriveModel.js";

export const Analyticsapp = exp.Router();

Analyticsapp.get("/dashboard", async (req, res) => {
  try {
    const totalPlacements = await ApplicationModel.countDocuments({ status: "SELECTED" });
    const allPlacements = await ApplicationModel.find({ status: "SELECTED" }).populate("studentid");

    const branchBreakdown = {};
    allPlacements.forEach((app) => {
      if (app.studentid && app.studentid.Branch) {
        const branch = app.studentid.Branch;
        branchBreakdown[branch] = (branchBreakdown[branch] || 0) + 1;
      }
    });

    const drives = await DriveModel.find();
    let totalPackage = 0;
    let drivesWithPackage = 0;
    drives.forEach(drive => {
      // Very naive package extraction assuming string like "10 LPA"
      const match = drive.Package?.match(/(\d+(\.\d+)?)/);
      if (match) {
        totalPackage += parseFloat(match[1]);
        drivesWithPackage++;
      }
    });
    const avgPackage = drivesWithPackage ? (totalPackage / drivesWithPackage).toFixed(2) : 0;

    res.status(200).json({
      payload: {
        totalPlacements,
        branchBreakdown,
        avgPackage
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics", error: err.message });
  }
});
