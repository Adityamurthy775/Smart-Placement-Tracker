import exp from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { DriveModel } from '../modules/DriveModel.js';
import mongoose from 'mongoose';
import { CompanyModel } from '../modules/CompanyModel.js';
import { ApplicationModel } from '../modules/ApplicationModel.js';
import { compare } from 'bcryptjs';
export const Driveapp=exp.Router();

const resolveCompanyByName = async (companyName) => {
  if (!companyName) return null;
  return CompanyModel.findOne({ CompanyName: new RegExp(`^${companyName}$`, 'i') });
};

/* Admin may act on any drive; an HR may only act on the ones it posted.
   `verifyToken` already limits the caller to HR/Admin, so this is the second
   half of the check — without it any HR could edit or delete any other
   recruiter's drive by guessing an id. */
const canManageDrive = (req, drive) =>
  req.user?.role === 'Admin' || String(drive?.hrId) === String(req.user?.id);

/* Fields an edit is allowed to touch. `req.body` used to be spread straight into
   $set, which let a client overwrite companyId/hrId with anything — including a
   company NAME, which is the "Cast to ObjectId failed for value \"Google\""
   error. The company is re-resolved from a name here instead. */
const EDITABLE_FIELDS = [
  'Title',
  'JobRole',
  'Package',
  'LastDate',
  'MinCGPA',
  'AllowedBranch',
  'status',
  'description',
  'isActive',
];


Driveapp.post('/drive', verifyToken("HR", "Admin"),async(req,res)=>{
  try {
    let { companyName, hrId, ...data } = req.body;

    /* The create-drive modal used to post the company's NAME in a field called
       `companyId`, which left `companyName` undefined here and pushed the raw
       string ("Google") into `data.companyId` — an ObjectId path, so it came
       back as `Cast to ObjectId failed for value "Google"`. Treat a non-ObjectId
       `companyId` as a company name so the field name cannot reintroduce it. */
    if (!companyName && data.companyId && !mongoose.isValidObjectId(data.companyId)) {
      companyName = data.companyId;
      delete data.companyId;
    }

    // Resolve or create company
    let company = null;
    if (companyName) {
      company = await resolveCompanyByName(companyName);
      if (!company) {
        company = await CompanyModel.create({
          CompanyName: companyName,
          CompanyId: Date.now(),
          Email: `${companyName.replace(/\s+/g, '').toLowerCase()}${Date.now()}@example.com`,
          isActive: true
        });
      }
    }
    
    if (company) {
      data.companyId = company._id;
    }
    // A drive with no company ref is a validation error, not a cast error.
    if (!data.companyId) {
      return res.status(400).json({message:"companyName is required to create a drive"});
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
    // A non-ObjectId id used to reach Mongo and come back as a 500 CastError.
    if (!mongoose.isValidObjectId(hrId)) {
      return res.status(400).json({ message: 'Invalid hrId' });
    }
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



Driveapp.put('/drive/:id', verifyToken("HR", "Admin"),async(req,res)=>{
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({message:"Invalid drive id"});
  }
  try {
    const currentDrive = await DriveModel.findById(id);
    if (!currentDrive) {
      return res.status(404).json({message:"No drive found"})
    }
    if (!canManageDrive(req, currentDrive)) {
      return res.status(403).json({message:"You can only edit drives you posted"});
    }

    // Only the whitelisted fields, so hrId/companyId/_id cannot be tampered with.
    const $set = {};
    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) $set[field] = req.body[field];
    });

    // Same company handling as create: accept a name, resolve it to a real ref.
    const { companyName, companyId } = req.body;
    if (companyName) {
      let company = await resolveCompanyByName(companyName);
      if (!company) {
        company = await CompanyModel.create({
          CompanyName: companyName,
          CompanyId: Date.now(),
          Email: `${companyName.replace(/\s+/g, '').toLowerCase()}${Date.now()}@example.com`,
          isActive: true
        });
      }
      $set.companyId = company._id;
    } else if (companyId && mongoose.isValidObjectId(companyId)) {
      $set.companyId = companyId;
    }

    const result = await DriveModel.findByIdAndUpdate(
      id,
      { $set },
      { returnDocument:"after", runValidators:true, new:true }
    );
    if(!result){
      return res.status(404).json({message:"No drive found"})
    }
    res.status(200).json({message:"Drive details are updated",payload:result})
  } catch(err) {
    console.error(err);
    res.status(500).json({message: err.message});
  }
})


Driveapp.patch('/drive/:id', verifyToken("HR", "Admin"),async(req,res)=>{
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({message:"Invalid drive id"});
  }
  try {
    //find the drive
    const result=await DriveModel.findById(id)
    if(!result){
      return res.status(404).json({message:"No drive found"})
    }
    if (!canManageDrive(req, result)) {
      return res.status(403).json({message:"You can only update drives you posted"});
    }
    if(req.body.isActive===result.isActive){
      return res.status(200).json({message:`the drive is already ${result.isActive}`})
    }
    result.isActive=Boolean(req.body.isActive)
    await result.save()
    res.status(200).json({message:"Details are updated"})
  } catch(err) {
    console.error(err);
    res.status(500).json({message: err.message});
  }
})


/* Delete a drive. HR may only delete its own; Admin may delete any. The
   applications pointing at the drive are removed with it — a drive row whose
   applications outlive it leaves the HR counts and charts permanently skewed. */
Driveapp.delete('/drive/:id', verifyToken("HR", "Admin"), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid drive id" });
  }
  try {
    const drive = await DriveModel.findById(id);
    if (!drive) {
      return res.status(404).json({ message: "No drive found" });
    }
    if (!canManageDrive(req, drive)) {
      return res.status(403).json({ message: "You can only delete drives you posted" });
    }

    // Applications carry the drive twice: `driveid` (ObjectId ref) and
    // `driveId` (the denormalised String some writers still fill). Both are
    // removed so a deleted drive leaves nothing pointing at it.
    await ApplicationModel.deleteMany({
      $or: [{ driveid: drive._id }, { driveId: String(drive._id) }],
    });
    await DriveModel.deleteOne({ _id: drive._id });

    res.status(200).json({ message: "Drive deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


