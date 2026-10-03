import { Schema,model } from "mongoose";

const TeacherModels=new Schema({
    Deatils:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    Id:{
        type:Number,
        required:[true,"id is required"],
        unique:true
    },
    designation: {
      type: String,
      enum: ["Assistant Professor", "Associate Professor", "Professor", "HOD", "TPO"],
      required: [true, "Designation is required"],
    },
    department: {
      type: String,
      enum: ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AIDS", "AIML"],
      required: [true, "Department is required"],
    },
    isActive:{
        type:Boolean,
        default:true
    },
    Profileimg:{
        type:String,
        default:""
    }

},{
    timestamps:false,
    versionKey:false,
    strict:"throw"
})

export const TeacherModel=model("teacher",TeacherModels)
