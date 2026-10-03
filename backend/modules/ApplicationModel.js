import { Schema,model } from "mongoose";
const ApplicationSchema=new Schema({
  studentid:{
    type:Schema.Types.ObjectId,
    ref:"student",
    required:[true,"Student id is required"]
  },
  driveid:{
    type:Schema.Types.ObjectId,
    ref:"drive",
    required:[true,"id is required"]
  },
  driveId: { type: String, default: '' },
  company: { type: String, default: '' },
  role: { type: String, default: '' },
  salary: { type: String, default: '' },
  status: {
    type: String,
    enum: ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"],
    default: "APPLIED",
  },
  studentName: { type: String, default: '' },
  studentEmail: { type: String, default: '' },
  studentCgpa: { type: String, default: '' },
  studentPhone: { type: String, default: '' },
  studentBranch: { type: String, default: '' },
  studentSkills: { type: String, default: '' },
  studentGithub: { type: String, default: '' },
  studentLinkedin: { type: String, default: '' },
  resumeUrl: {
    type: String,
    default: ""
  },
  resumeName: {
    type: String,
    default: ""
  },
  appliedDate: { type: String, default: () => new Date().toLocaleDateString() },
  appliedAt: { type: Date, default: Date.now },
  shortlistedAt: { type: Date },
  interviewedAt: { type: Date },
  selectedAt: { type: Date },
  rejectedAt: { type: Date },
  interviewSlotId: { type: Schema.Types.ObjectId, ref: "interviewSlot" },
    rounds:[
      {
        roundname:{
          type:String
        },
        result:{
          type:String,
          enum:["PASS","FAIL"],
          required:[true]
        },

      }
    ]

})

export const ApplicationModel = model("application", ApplicationSchema);
