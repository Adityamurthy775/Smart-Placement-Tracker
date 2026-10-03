import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name:     { type: String, required: [true, "Name is required"] },
    email:    { type: String, required: [true, "Email is required"], unique: true },
    password: { type: String, required: [true, "Password is required"] },
    role:     { type: String, enum: ["Student", "Teacher", "Admin","HR"], required: [true, "Role is required"] },
    Id:       { type: String, default: "" },
    profileImage: { type: String, default: "" },
    phone: { type: String, default: "" },
    cgpa: { type: String, default: "" },
    branch: { type: String, default: "" },
    skills: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    companyName: { type: String, default: "" },
    designation: { type: String, default: "" },
    department: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: false, versionKey: false, strict: "throw" }
);

export const userModel = model("user", userSchema);
