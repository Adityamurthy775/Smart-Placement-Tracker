import exp from 'express';
import {CompanyModel} from '../modules/CompanyModel.js';
import { verifyToken } from '../middleware/verifyToken.js';
export const Companyapp=exp.Router();


Companyapp.post('/company',async(requestAnimationFrame,res)=>{
  //get the data from the body
  const data=requestAnimationFrame.body
  //create the doc
  const newdoc= new CompanyModel(data)
  //save the doc
  const result=newdoc.save();
  res.status(200).json({message:"Company deatils are added"})
})

Companyapp.get('/company',async(req,res)=>{
  //get the data and store in result and send it in res
  const result=await CompanyModel.find()
  if(!result){
    return res.status(404).json({message:"No company are present"})
  }
  res.status(200).json({message:"Companys",payload:result})
})

Companyapp.get('/company/:name',async(req,res)=>{
  //get the company name from the req url
  const name=req.params.name;
  //find the matches with the name
  const result=await CompanyModel.find({ CompanyName: { $regex: name, $options: "i" } })
  if (result.length === 0){
   return  res.status(404).json({message:"No company with that name"})
  }
  res.status(200).json({message:"comapny deatils",payload:result})
})

Companyapp.put('/company/:id',verifyToken("HR"),async(req,res)=>{
  //get the id and data from req
  const id=req.params.id
  const Updateddata=req.body
  //find the company by id
  const company=await CompanyModel.findOneAndUpdate({CompanyId:id},{$set:{...Updateddata}},{returnDocument:"after",runValidators:true})
  //check the result and send res
  if(!company){
    return res.status(404).json({message:"No Company found"})
  }
  res.status(201).json({message:"Company deatils are updated",payload:company})
})

Companyapp.patch('/company/:id',async(req,res)=>{
  //get the id and data from req
  const id=req.params.id
  const data=req.body
  //find the company by id
  const company=await CompanyModel.findOne({CompanyId:id})
  //check the result and send res
  if(!company){
    return res.status(404).json({message:"No Company found"})
  }
  if(company.isActive===data.isActive){
    return res.status(200).json({message: `They are already in ${data.isActive} `})
  }
  company.isActive=data.isActive
  await company.save()
  res.status(201).json({message:"Company deatils are updated",payload:company})
})

