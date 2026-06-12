import exp from 'express'
import {TeacherModel} from '../modules/TeacherModel.js'
export const Teacherapp=exp.Router();



Teacherapp.post("/teacher",async(req,res)=>{
    //get the data from the req
    const data=req.body
    console.log(data)
    //create the document
    let newdoc= new TeacherModel(data)
    //save the document
    let result=await newdoc.save()
    res.status(201).json({message:"Teacher Created"})
})


Teacherapp.get('/teacher',async(req,res)=>{
    //find all the teachers
    const result=await TeacherModel.find()
    if(result===null){
        return res.status(404).json({message:"Teacher not found"})
    }
    res.status(200).json({message:"Tecahers",payload:result})
})


Teacherapp.get('/teacher/:id',async(req,res)=>{
    //get the id from thr url
    const id=req.params.id
    //find the teacher by id
    const result=await TeacherModel.findOne({Id:id})
    if(!result){
      return res.status(404).json({message:"Tecaher not found"})
    }
    res.status(200).json({message:"Tecaher info",payload:result})
})

Teacherapp.put('/teacher/:id',async(req,res)=>{
    //get the id from the url
    const id=req.params.id
    //get the data from the body
    const UpadtedData=req.body
    //find the teacher by id
    const result=await TeacherModel.findOneAndUpdate({Id:id},{$set:{...UpadtedData}},{returnDocument:"after",runValidators:true})
    if(!result){
        return res.status(404).json({message:"Teacher not found"})
    }
    res.status(201).json({message:"Updated",payload:result})
})


Teacherapp.delete('/teacher/:id',async(req,res)=>{
    //get the id from the url
    const id=req.params.id
    //find the teacher and delete
    const result=await TeacherModel.findOneAndDelete({Id:id})
    if(!result){
        return res.status(404).json({message:"Teachre not found"})
    }
    res.status(200).json({message:"Teacher is deleted"})
})

Teacherapp.patch('/teacher/:id',async(req,res)=>{
    //get the id from the url
    const id=req.params.id
    //get the updated data from the body
    const UpdatedData=req.body
    //find the teacher and update
    const result=await TeacherModel.findOneAndUpdate({Id:id},{$set:{...UpdatedData}},{returnDocument:"after",runValidators:true})
    if(!result){
        return res.status(404).json({message:"Teacher not found"})
    }
    if(result.isActive===false){
        return res.status(200).json({message:"teacher is already is same condition"})
    }
    res.status(201).json({message:"Teacher info updated"})
})
