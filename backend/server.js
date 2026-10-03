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
// CORS allow-list. FRONTEND_URL may be a single origin or a comma-separated
// list (split + trim), so a deployed URL and localhost can both be allowed
// from the environment instead of being hardcoded.
//
// The localhost entries cover the Vite dev range 5173-5199. Hardcoding just
// 5173 looks fine until the dev server moves to another port (a busy 5173 makes
// Vite pick 5174), and then the browser blocks the response while Node still
// returns 200 — axios surfaces that as a generic "Network Error" with no
// mention of CORS. A wrong port must not be a CORS failure, so the whole dev
// range is allowed. CORS is a browser-side control, not authentication, and
// these are all loopback addresses.
const DEV_PORTS = Array.from({ length: 27 }, (_, i) => 5173 + i);
const allowedOrigins = [
  ...new Set(
    [
      ...String(process.env.FRONTEND_URL || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
      ...DEV_PORTS.flatMap((p) => [`http://localhost:${p}`, `http://127.0.0.1:${p}`]),
    ],
  ),
];
// CORS. `callback(new Error(...))` is the wrong tool here: it turns a rejected
// origin into a thrown error that the error handler renders as HTTP 500. The
// browser only ever sees "500", never the CORS reason, so the real cause is
// invisible and the failure looks like a broken server. `callback(null, false)`
// is the correct response — no CORS headers are sent, the browser blocks the
// response itself, and the server stays a clean 200/404 for non-browser clients.
// Behind Render/any TLS-terminating proxy, `req.secure` is false unless Express
// is told to trust the proxy's `X-Forwarded-Proto`. Without this, authCookie()
// cannot detect HTTPS and would drop the `Secure`/`SameSite=None` attributes the
// cross-site Vercel -> Render deployment needs.
app.set('trust proxy', 1);

// The cors package's default reflects only the CORS-safelisted request headers
// (Accept, Content-Language, Content-Type with restricted values, ...).
// axios sends `Content-Type: application/json`, which is NOT safelisted, so every
// POST/PATCH triggers a preflight — and the preflight came back without
// `Access-Control-Allow-Origin`, which Chrome reports as
// `PreflightMissingAllowOriginHeader` and surfaces to JS as an opaque
// "Failed to fetch" / "Network Error" with HTTP 200 visible in the network tab.
// Reflecting the requested headers fixes the preflight.
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[cors] blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
};
app.use(cors(corsOptions));
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
