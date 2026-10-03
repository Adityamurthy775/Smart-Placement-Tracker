import { Schema,model } from "mongoose";
const skills=new Schema({
    name:{
        type:String,
        required:[true,"Skills are required"]
    },
    level:{
        type:String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required:true
    }
},{
    _id:false
})
const StudentModels=new Schema({
    Deatils:{ type: Schema.Types.ObjectId, ref: "user", required: [true, "User ref is required"] },
    Rollno:{
        type:Number,
        required:[true,"Roll no is required"],
        unique:true
    },
    Section:{
        type:String,
        required:[true,"Section is required"]
    },
    CGPA:{
        type:Number,
        required:[true,"CGPA ios required"],
        min:0,
        max:10
    },
    Branch:{
        type:String,
        required:[true,"Branch is required"]
    },
    Backlogs:{
        type:Number,
        required:[true,"Enter the Backlogs"],
        default:0
    },
    Skills:[skills],
    resumes: [{
        name: { type: String },
        url: { type: String },
        label: { type: String }
    }],
    linkedinUrl: {
        type: String,
        default: ""
    },
    githubUrl: {
        type: String,
        default: ""
    },
    isacivte:{
    type:Boolean,
    default:true
    }

},{
    timestamps:false,
    versionKey:false,
    strict:"throw"
})
export const StudentModel=model("student",StudentModels)
