import { Schema, model } from "mongoose";

const InterviewSlotSchema = new Schema({
  driveId: {
    type: Schema.Types.ObjectId,
    ref: "drive",
    required: true
  },
  hrId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["AVAILABLE", "BOOKED"],
    default: "AVAILABLE"
  },
  bookedBy: {
    type: Schema.Types.ObjectId,
    ref: "student",
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

export const InterviewSlotModel = model("interviewSlot", InterviewSlotSchema);
