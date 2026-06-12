import { Schema,model } from "mongoose";
const CompanyModels=new Schema({
    CompanyName:{
        type:String,
        required:[true,"CompanyName is required"]
    },
    CompanyId:{
        type:Number,
        required:[true,"Id is required"]
    },

    Email:{
        type:String,
        required:true,
        unique:true
    },Descrption:{
        type:String,
        default:""
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:false,
    versionKey:false,
    strict:"throw"
})
export const CompanyModel= model("company",CompanyModels)
