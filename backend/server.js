import exp from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { Studentapp } from './APIS/Studentapi.js'
import { Teacherapp } from './APIS/Teacherapi.js';
import { Companyapp } from './APIS/Companyapi.js';
import { Driveapp } from './APIS/Driveapi.js';
import { userapp } from './APIS/Userapi.js'
import { Adminapp } from './APIS/adminapi.js';
import { notifyapp } from './APIS/Notifyapi.js';
import { Analyticsapp } from './APIS/AnalyticsAPI.js';
import { Schedulerapp } from './APIS/SchedulerAPI.js';
import './cron/DeadlineReminders.js';
import dns from 'dns'
import cors from 'cors';

dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4'])
config(); // ← dotenv must be called before anything else

const app = exp();
const port = process.env.PORT || 5000;
const allowedOrigins = [process.env.FRONTEND_URL || 'https://smart-placement-tracker-ebon.vercel.app', 'http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
}));
app.use(cookieParser())
app.use(exp.json({ limit: '10mb' }))
app.use('/student-api', Studentapp)
app.use('/teacher-api', Teacherapp)
app.use('/company-api', Companyapp)
app.use('/drive-api', Driveapp)
app.use('/user-api', userapp)
app.use('/admin-api', Adminapp)
app.use('/notify-api', notifyapp)
app.use('/analytics-api', Analyticsapp)
app.use('/scheduler-api', Schedulerapp)

const connection = async () => {
    try {
        await connect(process.env.DB_URL)
        console.log("Database connection successful")
        app.listen(port, () => console.log("Server is live on", port))
    } catch (err) {
        console.log(err.message)
    }
}

connection();


//to handle invalid path
app.use((req, res, next) => {
  console.log(req.url);
  res.status(404).json({ message: `path ${req.url} is invalid` });
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.log("error is ",err)
  console.log("Full error:", JSON.stringify(err, null, 2));
  //ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  //CastError
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //send server side error
  res.status(500).json({ message: "error occurred", error: "Server side error" });
});
