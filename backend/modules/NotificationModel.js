import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    studentid:{
      type: Schema.Types.ObjectId,
      ref: "student",
      required: [true, "User ref is required"]
    },
    message:{
      type: String,
    required: [true, "Message is required"]
  },
    type:{
      type: String,
      enum: ["DRIVE_ALERT", "STATUS_UPDATE", "GENERAL"],
      default: "GENERAL"
    },
    relatedId:{
      type: Schema.Types.ObjectId,
      ref:"drive",
    },
  },
  { timestamps: true, versionKey: false, strict: "throw" }
);

export const notificationModel = model("notification", notificationSchema);
