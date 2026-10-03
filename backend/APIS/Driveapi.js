import exp from 'express';
import { DriveModel } from '../modules/DriveModel.js';
import { CompanyModel } from '../modules/CompanyModel.js';
import { compare } from 'bcryptjs';
export const Driveapp=exp.Router();

const resolveCompanyByName = async (companyName) => {
  if (!companyName) return null;
  return CompanyModel.findOne({ CompanyName: new RegExp(`^${companyName}$`, 'i') });
};


Driveapp.post('/drive',async(req,res)=>{
  try {
    let { companyName, hrId, ...data } = req.body;
    
    // Resolve or create company
    let company = null;
    if (companyName) {
      company = await resolveCompanyByName(companyName);
      if (!company) {
        company = await CompanyModel.create({
          CompanyName: companyName,
          CompanyId: Date.now(),
          Email: `${companyName.replace(/\\s+/g, '').toLowerCase()}${Date.now()}@example.com`,
          isActive: true
        });
      }
    }
    
    if (company) {
      data.companyId = company._id;
    }
    if (hrId) {
      data.hrId = hrId;
    }
    
    //create the doc
    const newdoc=new DriveModel(data);
    //save  the doc
    const result= await newdoc.save();
    res.status(200).json({message:"Drive is added", payload: result})
  } catch(err) {
    console.error(err);
    res.status(500).json({message: err.message});
  }
})


Driveapp.get('/drive', async (req, res) => {
  try {
    const { companyName, hrId } = req.query;

    // HR users are filtered by their user id so each HR only sees their own drives
    if (hrId) {
      const result = await DriveModel.find({ hrId }).populate('companyId');
      return res.status(200).json({ message: 'Drives available', payload: result });
    }

    // Backward-compatible company filter for older clients
    if (companyName) {
      const company = await resolveCompanyByName(companyName);
      if (!company) {
        // Company doesn't exist yet (HR has no drives posted)
        return res.status(200).json({ message: 'Drives available', payload: [] });
      }
      const result = await DriveModel.find({ companyId: company._id }).populate('companyId');
      return res.status(200).json({ message: 'Drives available', payload: result });
    }

    // No filter — return all drives (for students/teachers)
    const result = await DriveModel.find().populate('companyId');
    res.status(200).json({ message: 'Drives avaliable', payload: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
})



Driveapp.get('/drive/:name',async(req,res)=>{
  //get the copmany name from params
  const name=req.params.name;
  //find the company based on the compnay name
  const company= await CompanyModel.findOne({ CompanyName: { $regex: name, $options: "i" } })
  if(!company){
    return res.status(404).json({message:"No company found"})
  }
     const result = await DriveModel.find({
      companyId: company._id
    }).populate("companyId");

  if(result?.length===0){
    return res.status(404).json({message:"No drive is found"})
  }
  res.status(200).json({message:"Drive Deatils",payload:result})

})

Driveapp.get('/drive/hr/:hrId', async (req, res) => {
  try {
    const { hrId } = req.params;
    const result = await DriveModel.find({ hrId }).populate('companyId');
    if (!result.length) {
      return res.status(404).json({ message: 'No drive is found' });
    }
    res.status(200).json({ message: 'Drive Details', payload: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


Driveapp.get('/drive/cgpa/:cgpa',async(req,res)=>{
  //get the cgpa from the url parameter
  const cgpa=parseFloat(req.params.cgpa);
  //find the companys greatre or equla to the cgpa
  const result=await DriveModel.find({MinCGPA:{$lte:cgpa}})
  if(result.length===0){
    return res.status(404).json({message:"No company listed"})
  }
  res.status(200).json({message:"Companys Deatils",payload:result})
})



Driveapp.put('/drive/:id',async(req,res)=>{
  //get the id and data from the req
  const id=req.params.id
  const updatedData=req.body
  //find the drive by id and replace it woth the updated data\
  const currentDrive = await DriveModel.findById(id);
  if (!currentDrive) {
    return res.status(404).json({message:"No drive found"})
  }
  const result=await DriveModel.findByIdAndUpdate(
    id,
    {$set:{...updatedData, hrId: currentDrive.hrId || updatedData.hrId || null}},
    {returnDocument:"after",runValidators:true}
  )
  //check and send the response
  if(!result){
    return res.status(404).json({message:"No drive found"})
  }
  res.status(201).json({message:"Drive Deatils are updated",payload:result})



})


Driveapp.patch('/drive/:id',async(req,res)=>{
  //get the data and the url from th req
  const id=req.params.id
  const data=req.body
  //find the drive
  const result=await DriveModel.findById(id)
  if(!result){
    return res.status(404).json({message:"No drive found"})
  }
  if(data.isActive===result.isActive){
    return res.status(200).json({message:`the drive is already ${data.isActive}`})
  }
  result.isActive=data.isActive
  await result.save()
  res.status(201).json({message:"Deatils are updated"})
})


