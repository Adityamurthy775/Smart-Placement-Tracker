# Smart Placement Tracker

A modern full-stack placement management platform built with React, Node.js, Express, and MongoDB. This application helps students, placement officers, teachers, and companies manage campus recruitment drives, applications, candidate status, analytics, and notifications from a single dashboard.

---

## 📌 Project Overview

This project is a complete campus placement tracker developed using React, Node.js, Express, and MongoDB. It brings together student profiles, company drives, applications, email notifications, and analytics in one cohesive platform.

Key capabilities include:

- Role-based access for students, teachers, companies, and admins
- Student profile management with resume and eligibility details
- Company and drive creation with branch/CGPA filters
- Candidate application tracking and status updates
- Automated deadline reminders and email notifications
- Placement analytics and performance dashboards

The app demonstrates real-world full-stack practices such as REST API development, JWT authentication, MongoDB schema design, React state management, and frontend-backend integration.

---

## 🎯 Main Objectives

- Build a role-aware placement management system
- Implement secure user registration and login
- Manage student, teacher, company, and drive data
- Create a candidate application workflow
- Enable application status updates and email notifications
- Provide placement analytics and recruiter tracking
- Use MongoDB models and Express REST APIs
- Deliver a responsive production-ready UI

---

## 🚀 Features

### 🔐 Authentication System

- Student, teacher, company, and admin registration
- Secure login with JWT-based authentication
- Password hashing with bcryptjs
- Protected routes for role-based access control
- Session handling and secure cookie support

---

### 👩‍🎓 Student Management

- Create and update student profiles
- Save CGPA, branch, skills, GitHub, LinkedIn, and phone details
- Upload profile images for student profiles
- Apply to active recruitment drives
- Track application status and history

---

### 🏢 Company & Drive Management

- Manage company records and recruiter profiles
- Create new placement drives with role, package, and deadline
- Set eligibility by minimum CGPA and allowed branches
- View drive details and eligibility summaries
- Mark drives as active, upcoming, or closed

---

### 📝 Application Workflow

- Submit applications with student profile data
- Review drive applicants from the dashboard
- Shortlist, select, or reject candidates
- Send status emails for shortlisted, selected, and rejected students
- Export applicant lists to Excel for reporting

---

### 📊 Analytics & Notifications

- Placement dashboard with selected placements and package averages
- Branch-wise placement distribution
- Drive and recruiter performance insights
- Automated cron reminders for upcoming deadlines
- Email notifications for candidates and drive updates

---

### ⚡ Additional Functionality

- REST API integration between frontend and backend
- MongoDB data modeling with Mongoose
- Cloudinary-ready image upload support
- Toast notifications and loading states
- Responsive dashboard layout with modern UI styling
- Error handling across API calls

---

## 🛠️ Tech Stack

- Frontend: React, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express, CORS
- Database: MongoDB, Mongoose
- Authentication: JWT, bcryptjs
- Email: EmailJS / Nodemailer
- Deployment: Localhost, frontend served with Vite

---

## 📁 Project Structure

```
personal-project/
│
├── backend/
│   ├── APIS/
│   │   ├── adminapi.js
│   │   ├── AnalyticsAPI.js
│   │   ├── Companyapi.js
│   │   ├── Driveapi.js
│   │   ├── Notifyapi.js
│   │   ├── SchedulerAPI.js
│   │   ├── Studentapi.js
│   │   ├── Teacherapi.js
│   │   └── Userapi.js
│   ├── cofig/
│   │   ├── cloudinary.js
│   │   ├── cloudinaryUpload.js
│   │   └── multer.js
│   ├── cron/
│   │   └── DeadlineReminders.js
│   ├── middleware/
│   │   └── verifyToken.js
│   ├── modules/
│   │   ├── ApplicationModel.js
│   │   ├── CompanyModel.js
│   │   ├── DriveModel.js
│   │   ├── EmailService.js
│   │   ├── InterviewSlotModel.js
│   │   ├── NotificationModel.js
│   │   ├── StudentModel.js
│   │   ├── TeacherModel.js
│   │   └── UserModel.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── store/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
```
