import { Schema, model } from "mongoose";

const DriveSchema = new Schema({

  companyId: {
    type: Schema.Types.ObjectId,
    ref: "company",
    required: [true, "Company ref is required"]
  },
  hrId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    default: null
  },

  Title: {
    type: String,
    required: true,
    trim: true
  },

  JobRole: {
    type: String,
    required: true,
    trim: true
  },

  Package: {
    type: String,
    required: true
  },

  LastDate: {
    type: Date,
    required: true
  },

  MinCGPA: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },

  AllowedBranch: {
  type: [String],
  enum: ["CSE", "ECE", "EEE", "AIML", "DS", "CS", "ALL"],
  required: true
},

  status: {
    type: String,
    enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
    default: "UPCOMING"
  },

  description: {
    type: String,
    default: ""
  },
  isActive:{
    type:Boolean,
    required:true
  }

}, {
  timestamps: true,
  versionKey: false
});

export const DriveModel = model("drive", DriveSchema);
