import exp from "express";
import { InterviewSlotModel } from "../modules/InterviewSlotModel.js";
import { ApplicationModel } from "../modules/ApplicationModel.js";

export const Schedulerapp = exp.Router();

// HR defines available slots
Schedulerapp.post("/slots", async (req, res) => {
  try {
    const { driveId, hrId, startTime, endTime } = req.body;
    const slot = new InterviewSlotModel({ driveId, hrId, startTime, endTime });
    await slot.save();
    res.status(201).json({ message: "Slot created", payload: slot });
  } catch (err) {
    res.status(500).json({ message: "Error creating slot", error: err.message });
  }
});

// Get slots for a drive
Schedulerapp.get("/slots/:driveId", async (req, res) => {
  try {
    const slots = await InterviewSlotModel.find({ driveId: req.params.driveId });
    res.status(200).json({ payload: slots });
  } catch (err) {
    res.status(500).json({ message: "Error fetching slots", error: err.message });
  }
});

// Student books a slot
Schedulerapp.post("/book", async (req, res) => {
  try {
    const { slotId, studentId, applicationId } = req.body;
    const slot = await InterviewSlotModel.findById(slotId);
    if (!slot || slot.status === "BOOKED") {
      return res.status(400).json({ message: "Slot unavailable" });
    }

    slot.status = "BOOKED";
    slot.bookedBy = studentId;
    await slot.save();

    await ApplicationModel.findByIdAndUpdate(applicationId, { interviewSlotId: slotId });

    res.status(200).json({ message: "Slot booked successfully", payload: slot });
  } catch (err) {
    res.status(500).json({ message: "Error booking slot", error: err.message });
  }
});
