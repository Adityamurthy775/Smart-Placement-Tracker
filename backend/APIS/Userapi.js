import exp from 'express'
import { userModel} from '../modules/UserModel.js';
import jwt from 'jsonwebtoken';
import {hash,compare} from 'bcryptjs'
import { upload } from '../cofig/multer.js';
import { OAuth2Client } from 'google-auth-library';

export const userapp=exp.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
let { sign, verify } = jwt;

const normalizeRole = (role) => {
  const value = String(role || '').toLowerCase();
  if (value === 'hr') return 'HR';
  if (value === 'teacher') return 'Teacher';
  if (value === 'admin') return 'Admin';
  return 'Student';
};

const toClientUser = (user) => ({
  id: user._id,
  Id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  profileCompleted: user.profileCompleted || false,
});

const toProfileDetails = (user) => ({
  phone: user.phone || '',
  cgpa: user.cgpa || '',
  branch: user.branch || '',
  skills: user.skills || '',
  github: user.github || '',
  linkedin: user.linkedin || '',
  designation: user.designation || '',
  department: user.department || '',
  companyName: user.companyName || '',
  profileImage: user.profileImage || '',
  profileCompleted: user.profileCompleted || false,
});

//Register new user with profile image
userapp.post("/user", upload.single("image"), async (req, res, next) => {
  try {
    //get the data from the req body
    const data = { ...req.body, role: normalizeRole(req.body.role) };

    //get uploaded image url from cloudinary
    const imageUrl = req.file?.path || data.profileImage;

    //hash the password
    const hashedPassword = await hash(data.password, 12);

    //replace the old password with the hashed password
    data.password = hashedPassword;

    //attach image url to user data
    if (imageUrl) {
      data.profileImage = imageUrl;
    }

    //create the document
    const newdoc = new userModel(data);

    //save the user
    const result = await newdoc.save();

    res.status(201).json({
      message: "user is created",
      payload: result,
      user: toClientUser(result),
      profileDetails: toProfileDetails(result)
    });
  } catch (err) {
    next(err);
  }
});

//login route
userapp.post('/login',async(req,res)=>{
  //get theemail and password from the body
  const {email,password}=req.body;
  //find the user by email
  const user=await userModel.findOne({email:email})
  if(!user){
    return res.status(404).json({message:"user not found"})
  }
  //match the passwords
  const result=await compare(password,user.password);
  if(!result){
    return res.status(400).json({message:"invalid password"});
  }
  //if the password is matched generated the token
  const signtoken=sign({id:user._id,email:user.email,role:user.role},process.env.SECRET_KEY,{expiresIn:'1h'})
res.cookie("token", signtoken, {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  maxAge: 24 * 60 * 60 * 1000
})
    // Return user data so frontend can store it
    res.status(200).json({
      message:"Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        profileCompleted: user.profileCompleted || false
      },
      profileDetails: toProfileDetails(user)
    })
})

// Google Login / Signup
userapp.post('/google-login', async (req, res) => {
  try {
    const { credential, role } = req.body;

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await userModel.findOne({ email });

    if (!user) {
      // If no user and no role, they need to sign up properly (provide a role)
      if (!role) {
        return res.status(400).json({
          message: "User not found. Please sign up and select a role.",
          requiresSignup: true,
          googleData: { email, name, picture }
        });
      }

      // Create new user
      const randomPassword = await hash(Math.random().toString(36).slice(-10), 12);
      const newdoc = new userModel({
        name,
        email,
        password: randomPassword,
        role: normalizeRole(role),
        profileImage: picture,
        Id: `G-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        profileCompleted: false
      });
      user = await newdoc.save();
    }

    // Generate token
    const signtoken = sign({ id: user._id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });
res.cookie("token", signtoken, {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  maxAge: 24 * 60 * 60 * 1000
})

    res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        profileCompleted: user.profileCompleted || false
      },
      profileDetails: toProfileDetails(user)
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ message: "Invalid Google token or Login failed" });
  }
});

//update profile settings
userapp.post('/profile', async(req, res, next) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      cgpa,
      branch,
      skills,
      github,
      linkedin,
      companyName,
      designation,
      department,
      profileImage
    } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const updatedData = {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(cgpa !== undefined && { cgpa }),
      ...(branch !== undefined && { branch }),
      ...(skills !== undefined && { skills }),
      ...(github !== undefined && { github }),
      ...(linkedin !== undefined && { linkedin }),
      ...(companyName !== undefined && { companyName }),
      ...(designation !== undefined && { designation }),
      ...(department !== undefined && { department }),
      ...(profileImage !== undefined && { profileImage }),
      profileCompleted: true,
    };

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated",
      user: toClientUser(user),
      profileDetails: toProfileDetails(user)
    });
  } catch(err) {
    next(err);
  }
})

//forgot password - verify email exists
userapp.post('/forgot-password', async(req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }
    res.status(200).json({ message: "Email verified. You can now reset your password." });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
})

//reset password
userapp.post('/reset-password', async(req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
})

//logout route
userapp.post('/logout', async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.status(200).json({
    message: "Logout successful"
  });
});

//me route
userapp.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "No token" });
    const decodedToken = verify(token, process.env.SECRET_KEY);
    const user = await userModel.findById(decodedToken.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({
      user: toClientUser(user),
      profileDetails: toProfileDetails(user)
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});
