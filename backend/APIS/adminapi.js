import exp from 'express'
import { StudentModel } from '../modules/StudentModel.js'
import { DriveModel } from '../modules/DriveModel.js'
import { TeacherModel } from '../modules/TeacherModel.js'
import { CompanyModel } from '../modules/CompanyModel.js'

export const Adminapp=exp.Router();

//get all the students
Adminapp.get('/admin/student',async(req,res)=>{
  //find all the students
  const result=await StudentModel.find().populate("Deatils");
  //check and send the response
  if(!result){
    return res.status(404).json({message:"No student Found"})
  }
  res.status(200).json({message:"Student Deatils",payload:result})
})

//get the stiuent by id
Adminapp.get('/admin/student/:id',async(req,res)=>{
  //get the id from the url
  const id=req.params.id
  //find the student by id
  const result=await StudentModel.find({Rollno:id}).populate("Deatils")
  //check the result and sent the result
  if(!result){
    return res.status(404).json({message:"No  student Found"})
  }
  res.status(200).json({message:"Student Found",payload:result})
})

//find all the teachers
Adminapp.get('/admin/teacher',async(req,res)=>{
  //find all the teachers
  const result=await TeacherModel.find().populate("Deatils")
  //check and send result
  if(!result){
    return res.status(404).json({message:"No teacher found"})
  }
  res.status(200).json({message:"Teacher Details",payload:result})
})

//get the teacher by id
Adminapp.get('/admin/teacher/:id',async(req,res)=>{
  //get the id from url
  const id=req.params.id
  //find the teacher byid
  const result=await TeacherModel.findOne({Id:id}).populate("Deatils")
  //check and send the res
  if(!result){
    return res.status(404).json({message:"No teacher found"})
  }
  res.status(200).json({message:"Teacher Deatils",payload:result})
})

//get all the companys
Adminapp.get('/admin/company',async(req,res)=>{
  //get the id from url
  const id=req.params.id
  //find the teacher byid
  const result=await CompanyModel.find()
  //check and send the res
  if(!result){
    return res.status(404).json({message:"No compnay found"})
  }
  res.status(200).json({message:"compnay Deatils",payload:result})
})


Adminapp.get('/admin/company/:id',async(req,res)=>{
  //get the id from url
  const id=req.params.id
  //find the teacher byid
  const result=await CompanyModel.findOne({CompanyId:id})
  //check and send the res
  if(!result){
    return res.status(404).json({message:"No company  found"})
  }
  res.status(200).json({message:"compnay Deatils",payload:result})
})

Adminapp.get('/admin/drive',async(req,res)=>{
  //get the id from url
  const id=req.params.id
  //find the teacher byid
  const result=await DriveModel.find().populate("companyId")
  //check and send the res
  if(!result){
    return res.status(404).json({message:"No Drive found"})
  }
  res.status(200).json({message:"Drive Deatils",payload:result})
})
