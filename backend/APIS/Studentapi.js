import exp from 'express'
export const Studentapp=exp.Router();
import { StudentModel } from '../modules/StudentModel.js';
import { model } from 'mongoose';
import { Schema } from 'mongoose';
import { ApplicationModel } from '../modules/ApplicationModel.js';

Studentapp.post('/apply', async(req, res) => {
    try {
        const data = req.body;
        // data should contain studentid and driveid, plus student and drive preview details
        const newdoc = new ApplicationModel(data);
        const result = await newdoc.save();
        res.status(201).json({message: "Successfully applied", payload: result});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
})

Studentapp.get('/applications', async(req, res) => {
    try {
        const { studentEmail, studentid, status, driveid } = req.query;
        const query = {};
        if (studentEmail) query.studentEmail = studentEmail;
        if (studentid) query.studentid = studentid;
        if (status) query.status = status;
        if (driveid) query.driveid = driveid;
        const result = await ApplicationModel.find(query);
        res.status(200).json({message: "Applications fetched", payload: result});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

Studentapp.patch('/applications/:id', async(req, res) => {
    try {
        const updates = req.body;
        const application = await ApplicationModel.findById(req.params.id);
        if (!application) {
            return res.status(404).json({message: 'Application not found'});
        }
        Object.assign(application, updates);
        if (updates.status) {
          const now = new Date();
          if (updates.status === 'SHORTLISTED') application.shortlistedAt = now;
          if (updates.status === 'INTERVIEW') application.interviewedAt = now;
          if (updates.status === 'SELECTED') application.selectedAt = now;
          if (updates.status === 'REJECTED') application.rejectedAt = now;
        }
        const saved = await application.save();
        res.status(200).json({message: 'Application updated', payload: saved});
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

Studentapp.post('/student',async(req,res)=>{
    //get the data from the req
    let data=req.body
    let newdoc=new StudentModel(data)
    //save the doc
    let result=await newdoc.save();
    //send the res
    res.status(201).json({message:"Student Created"})
})

Studentapp.get('/student',async(req,res)=>{
    //find all students
    let result= await StudentModel.find()
    //send the res
    res.status(200).json({message:"Student details",payload:result})
})

Studentapp.get('/student/:id',async(req,res)=>{
    //get the id from the ulr
    let id=req.params.id
    //find the student by id
    let result=await StudentModel.find({Rollno:id})
    if (result===null){
        res.status(404).json({message:"Student not found"})
    }
    res.status(200).json({message:"Student  found",payload:result})
})

Studentapp.put('/student/:id',async(req,res)=>{
    //get the id from the url
    let id=req.params.id
    //get the updated datafrom the req
    let UpdatedData=req.body
    //find the student and upadted the data
    let result=await StudentModel.findOneAndUpdate({Rollno:id},{$set:{...UpdatedData}},{returnDocument:'after',runValidators:true})

    if(!result){
       return  res.status(404).json({message:"Student not found"})
    }
    res.status(200).json({message:"Student Details are updated",payload:result})
})

Studentapp.delete('/student/:id',async(req,res)=>{
    //get the id from the url
    let id=req.params.id
    //delete the studebnt by id
    let result=await StudentModel.findOneAndDelete({Rollno:id})
    if(!result){
        return res.status(404).json({message:"Student notfound"})
    }
    res.status(200).json({message:"Student deleted"})
})

Studentapp.patch('/student/:id',async(req,res)=>{
    //get the id from the url
    const id=req.params.id
    //get the data from req
    const data=req.body
    //find the student by id
    const Student=await StudentModel.findOne({Rollno:id})
    if(!Student){
        return res.status(404).json({message:"No student is found"})
    }
    //check if the state matches
    if(data.isacivte===Student.isacivte){
        return res.status(200).json({message:`The Student is already in ${data.isacivte}`})
    }
    Student.isacivte=data.isacivte
    //save the doc after update
    await Student.save();
    res.status(200).json({message:"Student Details are updated"})
})
