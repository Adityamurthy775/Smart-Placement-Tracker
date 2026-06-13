// React and third-party library imports
import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, ScrollRestoration } from 'react-router';
import { useForm } from 'react-hook-form';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler, BarElement
} from 'chart.js';
import { Doughnut, Line, Bar, Pie } from 'react-chartjs-2';

// Register chart components globally so Chart.js works with react-chartjs-2
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, BarElement);

// Base URLs and environment configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const ATS_CHECKER_URL = import.meta.env.VITE_ATS_CHECKER_URL || API_BASE;

// Email templates for candidate status updates
const STATUS_EMAIL_COPY = {
  SHORTLISTED: {
    label: 'Shortlisted',
    subject: (company, role) => `You have been shortlisted for ${role} at ${company}`,
    message: (name, company, role) =>
      `Dear ${name},\n\nCongratulations! You have been shortlisted for the ${role} role at ${company}. Our team will contact you with the next steps.\n\nBest regards,\nPlacement Team`,
  },
  SELECTED: {
    label: 'Selected',
    subject: (company, role) => `Congratulations! You have been selected for ${role} at ${company}`,
    message: (name, company, role) =>
      `Dear ${name},\n\nCongratulations! You have been selected for the ${role} role at ${company}. The HR team will contact you soon with the next steps.\n\nBest regards,\nPlacement Team`,
  },
  REJECTED: {
    label: 'Rejected',
    subject: (company, role) => `Update on your application for ${role} at ${company}`,
    message: (name, company, role) =>
      `Dear ${name},\n\nThank you for your interest in the ${role} role at ${company}. After careful consideration, we will not be moving forward with your application at this time.\n\nBest regards,\nPlacement Team`,
  },
};

const STATUS_COLORS = {
  APPLIED:     { bg: '#378ADD', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  SHORTLISTED: { bg: '#EF9F27', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  SELECTED:    { bg: '#1e40af', badge: 'bg-blue-900/20 text-blue-300 border-blue-800/30' },
  REJECTED:    { bg: '#E24B4A', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

/* ─────────────── Toast ─────────────── */
// Reusable toast notification component shown in the bottom-right corner
function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colors = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error:   'bg-red-500/10 border-red-500/30 text-red-400',
    info:    'bg-blue-500/10 border-blue-500/30 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-sm shadow-2xl animate-fade-in ${colors[type]}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100 text-lg font-bold">&times;</button>
    </div>
  );
}

/* ─────────────── Helpers ─────────────── */
// Helper functions for data handling and local storage operations
const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  if (!file) { resolve(''); return; }
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// Save or update a student application in local storage and track applied drive IDs
const getCompanyName = (drive) => drive?.companyId?.CompanyName || drive?.company || 'Unknown';
const getDriveOwnerId = (drive) => String(drive?.hrId?._id || drive?.hrId || '');

const isProfileComplete = (profileDetails, role) => {
  const normalizedRole = String(role || '').toLowerCase();
  if (normalizedRole === 'hr') {
    return Boolean(profileDetails?.phone && profileDetails?.companyName);
  }
  if (normalizedRole === 'teacher') {
    return Boolean(profileDetails?.phone && profileDetails?.designation && profileDetails?.department);
  }
  return Boolean(profileDetails?.phone && profileDetails?.cgpa && profileDetails?.branch && profileDetails?.skills);
};

const groupCount = (items, getKey) => items.reduce((acc, item) => {
  const key = getKey(item) || 'Unknown';
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const toRows = (map, keyLabel = 'Name', valueLabel = 'Placements') =>
  Object.entries(map).map(([name, value]) => ({ [keyLabel]: name, [valueLabel]: value }));

// Export helpers for Excel and printable report generation
const saveWorkbook = (sheets, fileName) => {
  const workbook = XLSX.utils.book_new();
  sheets.forEach(({ name, rows }) => {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), name);
  });
  XLSX.writeFile(workbook, fileName);
};

// Prints a simple HTML version of the report in a new browser window
const printReport = (title, rows) => {
  const tableRows = rows.length
    ? rows.map(row => `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`).join('')
    : '<tr><td>No data available</td></tr>';
  const headers = rows.length
    ? Object.keys(rows[0]).map(key => `<th>${key}</th>`).join('')
    : '<th>Report</th>';
  const reportWindow = window.open('', '_blank');
  if (!reportWindow) return;
  reportWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
          h1 { margin-bottom: 6px; }
          p { color: #555; margin-bottom: 24px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Smart Placement Tracker report</p>
        <table><thead><tr>${headers}</tr></thead><tbody>${tableRows}</tbody></table>
      </body>
    </html>
  `);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
};

/* ─────────────── Profile Form Modal ─────────────── */
// Modal shown to students when profile details are missing or being updated
function ProfileFormModal({ onClose }) {
  const { user, saveProfileDetails } = useContext(UserContext);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [uploading, setUploading] = useState(false);
  const role = String(user?.role || '').toLowerCase();

  const onSubmit = async (data) => {
    setUploading(true);
    try {
      // Convert the selected profile image to a base64 URL before saving
      const profileImage = await fileToDataUrl(data.profileImage?.[0]);
      await saveProfileDetails({
        phone: data.phone,
        cgpa: data.cgpa,
        branch: data.branch,
        skills: data.skills,
        github: data.github,
        linkedin: data.linkedin,
        companyName: data.companyName,
        designation: data.designation,
        department: data.department,
        profileImage,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-md p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
        <p className="text-gray-400 mb-6 text-sm">Please provide a few more details to continue.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1 ml-1">Profile Image</label>
            <input type="file" accept="image/png,image/jpeg,image/webp"
              className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer"
              {...register('profileImage')} />
            <p className="text-xs text-gray-500 mt-1">Optional — leave blank for default avatar</p>
          </div>
          <div>
            <input type="text" placeholder="Phone Number"
              className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
              {...register('phone', { required: 'Phone number is required' })} />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {role === 'hr' && (
            <div>
              <input type="text" placeholder="Company Name"
                className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                {...register('companyName', { required: 'Company name is required' })} />
              {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName.message}</p>}
            </div>
          )}

          {role === 'teacher' && (
            <>
              <div>
                <select className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                  {...register('designation', { required: 'Designation is required' })}>
                  <option value="">Select Designation</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="HOD">HOD</option>
                  <option value="TPO">TPO</option>
                </select>
                {errors.designation && <p className="text-red-400 text-xs mt-1">{errors.designation.message}</p>}
              </div>
              <div>
                <select className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                  {...register('department', { required: 'Department is required' })}>
                  <option value="">Select Department</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="IT">IT</option>
                  <option value="AIDS">AIDS</option>
                  <option value="AIML">AIML</option>
                </select>
                {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department.message}</p>}
              </div>
            </>
          )}

          {(role !== 'hr' && role !== 'teacher') && (
            <>
              <div>
                <input type="text" placeholder="CGPA / Percentage"
                  className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                  {...register('cgpa', { required: 'CGPA is required' })} />
                {errors.cgpa && <p className="text-red-400 text-xs mt-1">{errors.cgpa.message}</p>}
              </div>
              <div>
                <input type="text" placeholder="Branch (e.g. CSE,EEE,ECE)"
                  className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                  {...register('branch', { required: 'Branch is required' })} />
                {errors.branch && <p className="text-red-400 text-xs mt-1">{errors.branch.message}</p>}
              </div>
              <div>
                <input type="text" placeholder="Key Skills (comma separated)"
                  className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                  {...register('skills', { required: 'Skills are required' })} />
                {errors.skills && <p className="text-red-400 text-xs mt-1">{errors.skills.message}</p>}
              </div>
              <div>
                <input type="text" placeholder="GitHub Profile URL (Optional)"
                  className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                  {...register('github')} />
              </div>
              <div>
                <input type="text" placeholder="LinkedIn Profile URL (Optional)"
                  className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                  {...register('linkedin')} />
              </div>
            </>
          )}
          <button type="submit" disabled={uploading}
            className="mt-4 bg-white text-black font-semibold py-3 rounded-full hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {uploading && (
              <span className="inline-block w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
            )}
            {uploading ? 'Saving...' : 'Save Details'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────── Apply Job Modal ─────────────── */
/* ─────────────── Apply Job Modal ─────────────── */
// Modal where students upload their resume and apply for a drive
function ApplyJobModal({ drive, onClose, onApplied }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { user, profileDetails } = useContext(UserContext);
  const [applying, setApplying] = useState(false);

  const onSubmit = async (data) => {
    setApplying(true);
    const resumeFile = data.resume?.[0];
    const resumeName = resumeFile?.name || 'resume.pdf';
    const resumeUrl = await fileToDataUrl(resumeFile);

    // Build the application object with student and drive details
    const newApplication = {
      driveId: drive.id || drive._id,
      company: drive.company,
      role: drive.role,
      salary: drive.salary,
      studentName: user?.name || 'Student',
      studentEmail: user?.email || '',
      studentCgpa: profileDetails?.cgpa || 'N/A',
      studentPhone: profileDetails?.phone || '',
      studentBranch: profileDetails?.branch || '',
      studentSkills: profileDetails?.skills || '',
      studentGithub: profileDetails?.github || '',
      studentLinkedin: profileDetails?.linkedin || '',
      resumeUrl,
      resumeName,
      status: 'APPLIED',
      appliedDate: new Date().toLocaleDateString(),
    };

    try {
      await axios.post(`${API_BASE}/student-api/apply`, {
        ...newApplication,
        studentid: user?.id || user?._id,
        driveid: drive.id || drive._id,
      });
      alert(`Successfully applied for ${drive.company}!`);
    } catch (err) {
      console.error(err);
      alert(`Application failed for ${drive.company}. Please try again.`);
    } finally {
      onApplied();
      onClose();
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-md p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Apply for {drive.company}</h2>
        <p className="text-gray-400 mb-6 text-sm">Role: {drive.role} · {drive.salary}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2 ml-1">Upload Resume (PDF)</label>
            <input type="file" accept=".pdf,.doc,.docx"
              className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer"
              {...register('resume', { required: 'Resume is required to apply' })} />
            {errors.resume && <p className="text-red-400 text-xs mt-1">{errors.resume.message}</p>}
          </div>
          <button type="button" onClick={() => window.open(ATS_CHECKER_URL, '_blank')}
            className="w-full bg-[#111111] border border-[#333333] text-white font-semibold py-3 rounded-full hover:bg-[#1a1a1a] transition">
            Check Resume with ATS
          </button>
          {/* Redirects the user to the configured ATS checker URL in a new tab */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
            <button type="button" onClick={onClose} disabled={applying}
              className="flex-1 bg-transparent border border-[#333333] text-white font-semibold py-3 rounded-full hover:bg-[#1a1a1a] transition disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={applying}
              className="flex-1 bg-white text-black font-semibold py-3 rounded-full hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {applying && (
                <span className="inline-block w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" />
              )}
              {applying ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────── Candidate Detail Modal (HR) ─────────────── */
/* ─────────────── Candidate Detail Modal ─────────────── */
// HR modal for reviewing an applicant, changing status, and viewing resume/profile links
function CandidateDetailModal({ candidate, drive, onClose, onUpdateStatus, showToast }) {
  const canViewResume = Boolean(candidate.resumeUrl);
  const [sending, setSending] = useState(false);

  const handleAction = async (status) => {
    setSending(true);
    try {
      const updatedCandidate = await onUpdateStatus(candidate, status);
      if (!updatedCandidate.studentEmail) throw new Error('Candidate email is missing.');

      const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      const company   = drive?.company || updatedCandidate.company || 'Our Company';
      const role      = drive?.role    || updatedCandidate.role    || 'the position';
      const name      = updatedCandidate.studentName || 'Student';
      const emailCopy = STATUS_EMAIL_COPY[status] || STATUS_EMAIL_COPY.SHORTLISTED;

      let messageText = emailCopy.message(name, company, role);
      if (status === 'SHORTLISTED' && updatedCandidate.interviewSlotId) {
        const slot = updatedCandidate.interviewSlotId;
        const start = new Date(slot.startTime).toLocaleString();
        const end = new Date(slot.endTime).toLocaleString();
        messageText += `\n\nWe have scheduled an interview slot for you:\nStart Time: ${start}\nEnd Time: ${end}\n\nPlease join on time.`;
      }

      const params = {
        to_email: updatedCandidate.studentEmail,
        to_name: name,
        company,
        role,
        status,
        status_label: emailCopy.label,
        subject: emailCopy.subject(company, role),
        message: messageText,
      };

      if (serviceId && templateId && publicKey) {
        const result = await emailjs.send(
          serviceId,
          templateId,
          params,
          publicKey
        );
        console.log("Email sent successfully via EmailJS:", result);
      } else {
        await axios.post(`${API_BASE}/notify-api/status-update`, {
          studentEmail: updatedCandidate.studentEmail,
          studentName: name,
          company,
          role,
          status,
          subject: params.subject,
          message: messageText,
        });
        console.log("Notification status update sent via API fallback");
      }

      showToast(
        `Email sent to ${updatedCandidate.studentName || name} — ${emailCopy.label}`,
        status === 'REJECTED' ? 'error' : 'success'
      );
    } catch (err) {
      console.error("EmailJS Error:", {
        status: err?.status,
        text: err?.text,
        error: err
      });

      showToast(
        `Email failed: ${err?.text || "Unknown error"}`,
        "error"
      );
    } finally {
      setSending(false);
    }
  }

  const openResume = () => {
    if (!canViewResume) return;
    try {
      // Download or open the stored resume data URL in a new browser tab
      if (candidate.resumeUrl.startsWith('data:')) {
        const [header, base64] = candidate.resumeUrl.split(',');
        const mime   = header.match(/:(.*?);/)[1];
        const binary = atob(base64);
        const bytes  = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        window.open(URL.createObjectURL(new Blob([bytes], { type: mime })), '_blank');
      } else {
        window.open(candidate.resumeUrl, '_blank');
      }
    } catch { alert('Unable to open resume.'); }
  };

  const statusBadge = (s) => {
    const map = {
      APPLIED:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
      SHORTLISTED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      SELECTED:    'bg-blue-900/20 text-blue-300 border-blue-800/30',
      REJECTED:    'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return map[s] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-2xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Candidate Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        <div className="flex flex-col gap-4">
          {/* User info */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-4 mb-4 min-w-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-[#333333] flex items-center justify-center text-2xl font-bold text-white">
                {candidate.studentName?.[0] || '?'}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-white truncate">{candidate.studentName}</h3>
                <p className="text-gray-400 text-sm break-all">{candidate.studentEmail}</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <span className="bg-[#111111] border border-[#333333] px-3 py-1 rounded-full text-sm text-gray-300">
                CGPA: {candidate.studentCgpa}
              </span>
              <span className="bg-[#111111] border border-[#333333] px-3 py-1 rounded-full text-sm text-gray-300">
                Applied: {candidate.appliedDate}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusBadge(candidate.status)}`}>
                {candidate.status}
              </span>
            </div>
          </div>

          {/* Additional details */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-4 sm:p-6 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
            <h4 className="text-white font-bold mb-3">Additional Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-[#111111] border border-[#333333] rounded-xl p-3 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
                <p className="text-gray-500 text-xs mb-1">Phone</p>
                <p className="text-gray-200">{candidate.studentPhone || 'Not provided'}</p>
              </div>
              <div className="bg-[#111111] border border-[#333333] rounded-xl p-3 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
                <p className="text-gray-500 text-xs mb-1">Branch</p>
                <p className="text-gray-200">{candidate.studentBranch || 'Not provided'}</p>
              </div>
              <div className="bg-[#111111] border border-[#333333] rounded-xl p-3 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
                <p className="text-gray-500 text-xs mb-1">GitHub</p>
                {candidate.studentGithub ? (
                  <a href={candidate.studentGithub} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-200 break-all">{candidate.studentGithub}</a>
                ) : (
                  <p className="text-gray-200">Not provided</p>
                )}
              </div>
              <div className="bg-[#111111] border border-[#333333] rounded-xl p-3 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
                <p className="text-gray-500 text-xs mb-1">LinkedIn</p>
                {candidate.studentLinkedin ? (
                  <a href={candidate.studentLinkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-200 break-all">{candidate.studentLinkedin}</a>
                ) : (
                  <p className="text-gray-200">Not provided</p>
                )}
              </div>
              <div className="bg-[#111111] border border-[#333333] rounded-xl p-3 sm:col-span-2 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
                <p className="text-gray-500 text-xs mb-1">Skills</p>
                <p className="text-gray-200">{candidate.studentSkills || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Resume */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-4 sm:p-6 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
            <h4 className="text-white font-bold mb-3">Resume</h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] border border-[#333333] rounded-xl p-4 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-red-400 text-xs font-bold">PDF</span>
                </div>
                <span className="text-gray-300 text-sm break-all">{candidate.resumeName || 'resume.pdf'}</span>
              </div>
              <button onClick={openResume}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition ${canViewResume ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#222222] text-gray-500 cursor-not-allowed'}`}>
                View
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
            <button disabled={sending} onClick={() => handleAction('SHORTLISTED')}
              className="flex-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold py-3 rounded-xl hover:bg-yellow-500 hover:text-black transition disabled:opacity-50">
              {sending ? '...' : 'Shortlist'}
            </button>
            <button disabled={sending} onClick={() => handleAction('REJECTED')}
              className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 font-semibold py-3 rounded-xl hover:bg-red-500 hover:text-white transition disabled:opacity-50">
              {sending ? '...' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── View Applicants Modal (HR) ─────────────── */
/* ─────────────── View Applicants Modal ─────────────── */
// HR view that lists all applicants for a drive and allows filtering / bulk actions
function ViewApplicantsModal({ drive, onClose, showToast, onStatusUpdated }) {
  const [applicants, setApplicants]           = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filterStatus, setFilterStatus]       = useState('');
  const [filterCgpa, setFilterCgpa]           = useState('');
  const [sortBy, setSortBy]                   = useState('');
  const [selectedAppIds, setSelectedAppIds]   = useState(new Set());
  const [loadingApplicants, setLoadingApplicants] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await axios.get(`${API_BASE}/student-api/applications`, {
          withCredentials: true,
          params: { driveid: drive.id || drive._id },
        });
        setApplicants(res.data.payload || []);
      } catch (err) {
        console.error('Failed to fetch drive applicants', err);
        setApplicants([]);
      } finally {
        setLoadingApplicants(false);
      }
    };
    fetchApplicants();
  }, [drive.id || drive._id]);

  const handleUpdateStatus = async (candidate, newStatus) => {
    try {
      const res = await axios.patch(`${API_BASE}/student-api/applications/${candidate._id}`, {
        status: newStatus,
      }, { withCredentials: true });
      const updated = res.data.payload;
      setApplicants(prev => prev.map(a => a._id === updated._id ? updated : a));
      if (onStatusUpdated) onStatusUpdated();
      return updated;
    } catch (err) {
      console.error('Failed to update status', err);
      showToast('Unable to update application status.', 'error');
      throw err;
    }
  };

  const handleBulkUpdate = async (newStatus) => {
    if (selectedAppIds.size === 0) return;
    try {
      const updatePromises = Array.from(selectedAppIds).map(id =>
        axios.patch(`${API_BASE}/student-api/applications/${id}`, { status: newStatus }, { withCredentials: true })
      );
      const results = await Promise.all(updatePromises);
      const updatedCandidates = results.map(r => r.data.payload);
      const updatedIds = new Set(updatedCandidates.map(c => c._id));
      
      setApplicants(prev => prev.map(a => updatedIds.has(a._id) ? updatedCandidates.find(c => c._id === a._id) : a));
      setSelectedAppIds(new Set());
      showToast(`Bulk updated ${updatedIds.size} candidates to ${newStatus}`);
      
      if (onStatusUpdated) onStatusUpdated();

      // Parallel bulk email notifications
      const emailPromises = updatedCandidates.map(async (candidate) => {
        try {
          if (!candidate.studentEmail) return;

          const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
          const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
          const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

          const company   = drive?.company || candidate.company || 'Our Company';
          const role      = drive?.role    || candidate.role    || 'the position';
          const name      = candidate.studentName || 'Student';
          const emailCopy = STATUS_EMAIL_COPY[newStatus] || STATUS_EMAIL_COPY.SHORTLISTED;

          let messageText = emailCopy.message(name, company, role);
          if (newStatus === 'SHORTLISTED' && candidate.interviewSlotId) {
            const slot = candidate.interviewSlotId;
            const start = new Date(slot.startTime).toLocaleString();
            const end = new Date(slot.endTime).toLocaleString();
            messageText += `\n\nWe have scheduled an interview slot for you:\nStart Time: ${start}\nEnd Time: ${end}\n\nPlease join on time.`;
          }

          const params = {
            to_email: candidate.studentEmail,
            to_name: name,
            company,
            role,
            status: newStatus,
            status_label: emailCopy.label,
            subject: emailCopy.subject(company, role),
            message: messageText,
          };

          if (serviceId && templateId && publicKey) {
            await emailjs.send(serviceId, templateId, params, publicKey);
          } else {
            await axios.post(`${API_BASE}/notify-api/status-update`, {
              studentEmail: candidate.studentEmail,
              studentName: name,
              company,
              role,
              status: newStatus,
              subject: params.subject,
              message: messageText,
            });
          }
        } catch (mailErr) {
          console.error(`Failed to send bulk email to ${candidate.studentEmail}`, mailErr);
        }
      });
      await Promise.all(emailPromises);
      showToast(`Sent notification emails to bulk updated candidates.`);
    } catch (err) {
      console.error('Failed to perform bulk update', err);
      showToast('Unable to perform bulk update.', 'error');
    }
  };

  const handleExportCSV = () => {
    if (filteredApplicants.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(filteredApplicants.map(a => ({
      Name: a.studentName, Email: a.studentEmail, CGPA: a.studentCgpa,
      Branch: a.studentBranch, Status: a.status, AppliedDate: a.appliedDate,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applicants');
    XLSX.writeFile(workbook, `${drive.company}_Applicants.xlsx`);
  };

  const filteredApplicants = applicants.filter(a => {
    const matchStatus = filterStatus ? a.status === filterStatus : true;
    const matchCgpa   = filterCgpa   ? parseFloat(a.studentCgpa || 0) >= parseFloat(filterCgpa) : true;
    return matchStatus && matchCgpa;
  }).sort((a, b) => {
    if (sortBy === 'cgpa') return parseFloat(b.studentCgpa || 0) - parseFloat(a.studentCgpa || 0);
    if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
    return 0;
  });

  const toggleSelect = (id) => {
    const next = new Set(selectedAppIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedAppIds(next);
  };

  const statusBadge = (s) => {
    const map = {
      APPLIED:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
      SHORTLISTED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      SELECTED:    'bg-blue-900/20 text-blue-300 border-blue-800/30',
      REJECTED:    'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return map[s] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-4xl p-5 sm:p-8 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-white mb-1">Applicants — {drive.company}</h2>
            <p className="text-gray-400 text-sm">Role: {drive.role} · {filteredApplicants.length} applicant(s)</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExportCSV}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
              Export Excel
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-xl">&times;</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-[#1a1a1a] rounded-xl border border-[#333333]">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#111111] border border-[#333333] text-white px-3 py-2 rounded-lg text-sm">
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <input type="number" step="0.1" placeholder="Min CGPA" value={filterCgpa}
            onChange={e => setFilterCgpa(e.target.value)}
            className="bg-[#111111] border border-[#333333] text-white px-3 py-2 rounded-lg text-sm w-32" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-[#111111] border border-[#333333] text-white px-3 py-2 rounded-lg text-sm">
            <option value="">Sort By...</option>
            <option value="cgpa">Highest CGPA</option>
            <option value="name">Name (A-Z)</option>
          </select>
          {selectedAppIds.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-400 mr-2">{selectedAppIds.size} selected</span>
              <button onClick={() => handleBulkUpdate('SHORTLISTED')}
                className="bg-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-500/40">Shortlist</button>
              <button onClick={() => handleBulkUpdate('SELECTED')}
                className="bg-green-500/20 text-green-500 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-500/40">Accept</button>
              <button onClick={() => handleBulkUpdate('REJECTED')}
                className="bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-500/40">Reject</button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {loadingApplicants ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, idx) => <SkeletonRow key={idx} />)}
            </div>
          ) : filteredApplicants.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredApplicants.map((app, idx) => (
                <div key={idx} className="bg-[#1a1a1a] border border-[#333333] p-4 rounded-xl flex items-center gap-4 hover:border-[#444444] transition">
                  <input type="checkbox" checked={selectedAppIds.has(app._id)}
                    onChange={() => toggleSelect(app._id)}
                    className="w-5 h-5 rounded border-[#444444] bg-[#111111] checked:bg-blue-500 cursor-pointer" />
                  <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 cursor-pointer"
                    onClick={() => setSelectedCandidate(app)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#222222] border border-[#333333] flex items-center justify-center font-bold">
                        {app.studentName?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-bold truncate">{app.studentName}</h4>
                        <p className="text-sm text-gray-400">CGPA: {app.studentCgpa} · {app.studentEmail}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#333333] flex items-center justify-center mb-4 text-2xl">◎</div>
              <h4 className="text-white font-semibold mb-2">No applicants match criteria.</h4>
              <p className="text-gray-400 text-sm max-w-sm">Try clearing the filters or wait for students to apply to this drive.</p>
            </div>
          )}
        </div>
      </div>

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          drive={drive}
          onClose={() => setSelectedCandidate(null)}
          onUpdateStatus={handleUpdateStatus}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function DriveDetailModal({ drive, onClose, onApply, isTeacher, isStudent, alreadyApplied, profileDetails }) {
  const branches = Array.isArray(drive.AllowedBranch) ? drive.AllowedBranch : [];
  const userCgpa = parseFloat(profileDetails?.cgpa || 0);
  const driveCgpa = parseFloat(drive.MinCGPA || 0);
  const userBranch = String(profileDetails?.branch || '').trim().toLowerCase();
  const normalizedBranches = branches.map(b => String(b || '').trim().toLowerCase());
  const isCgpaLow = userCgpa < driveCgpa;
  const isBranchInvalid = normalizedBranches.length > 0 && !normalizedBranches.includes('all') && !normalizedBranches.includes(userBranch);
  const isInactive = drive.isActive === false;
  const isExpired = new Date(drive.LastDate) < new Date();
  const daysLeft = Math.ceil((new Date(drive.LastDate) - new Date()) / 86400000);
  const deadlineLabel = isInactive ? 'Closed' : isExpired ? 'Expired' : daysLeft === 0 ? 'Last day!' : `${daysLeft}d left`;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-white">Drive Details</h2>
            <p className="text-gray-400 text-sm mt-1">Review this drive before taking action.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1a1a1a] border border-[#222222] rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Company</p>
            <p className="text-white font-semibold">{drive.company || drive.companyId?.CompanyName || 'Unknown'}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#222222] rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Role</p>
            <p className="text-white font-semibold">{drive.role || drive.JobRole || 'N/A'}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#222222] rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Package</p>
            <p className="text-white font-semibold">{drive.salary || drive.Package || 'N/A'}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#222222] rounded-2xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Deadline</p>
            <p className="text-white font-semibold">{drive.LastDate ? new Date(drive.LastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#222222] rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-3">Description</p>
          <p className="text-gray-300 text-sm leading-relaxed">{drive.description || drive.Title || 'No description available.'}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs bg-[#1a1a1a] border border-[#333333] px-3 py-1.5 rounded-full text-gray-300">Min CGPA: {drive.MinCGPA || 'N/A'}</span>
          <span className="text-xs bg-[#1a1a1a] border border-[#333333] px-3 py-1.5 rounded-full text-gray-300">{deadlineLabel}</span>
          <span className="text-xs bg-[#1a1a1a] border border-[#333333] px-3 py-1.5 rounded-full text-gray-300">Status: {isInactive ? 'Closed' : isExpired ? 'Expired' : 'Open'}</span>
        </div>

        <div className="bg-[#1a1a1a] border border-[#222222] rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-3">Allowed Branches</p>
          <div className="flex flex-wrap gap-2">
            {branches.length > 0 ? branches.map((branch, idx) => (
              <span key={idx} className="text-xs px-3 py-1 rounded-full bg-[#222222] text-gray-300 border border-[#333333]">{branch}</span>
            )) : (
              <span className="text-sm text-gray-400">All branches allowed</span>
            )}
          </div>
        </div>

        {isStudent && (
          <div className="space-y-3">
            {alreadyApplied ? (
              <div className="text-center rounded-2xl bg-green-500/10 border border-green-500/20 text-green-300 px-4 py-3">
                You already applied to this drive.
              </div>
            ) : (isInactive || isExpired) ? (
              <div className="text-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3">
                This drive is closed/expired.
              </div>
            ) : isCgpaLow ? (
              <div className="text-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3">
                Your CGPA is below the minimum requirement.
              </div>
            ) : isBranchInvalid ? (
              <div className="text-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3">
                Your branch is not eligible for this drive.
              </div>
            ) : (
              <button onClick={() => onApply(drive)}
                className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition">
                Apply Now
              </button>
            )}
          </div>
        )}

        {isTeacher && (
          <div className="rounded-2xl bg-[#1a1a1a] border border-[#222222] p-4 text-sm text-gray-300">
            This view is for teacher review only.
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Add Drive Modal (HR) ─────────────── */
/* ─────────────── Add Drive Modal ─────────────── */
// Modal for HR to create a new campus drive posting
function AddDriveModal({ onClose, onAdded, driveToEdit, isHR, hrCompanyName, hrUserId }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      companyId:     driveToEdit?.companyId?._id || driveToEdit?.companyId || '',
      Title:         driveToEdit?.Title || '',
      JobRole:       driveToEdit?.JobRole || '',
      Package:       driveToEdit?.Package || '',
      LastDate:      driveToEdit?.LastDate ? driveToEdit.LastDate.slice(0, 10) : '',
      MinCGPA:       driveToEdit?.MinCGPA || '',
      AllowedBranch: driveToEdit?.AllowedBranch || [],
      description:   driveToEdit?.description || '',
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies]   = useState([]);
  const branchOptions = ['CSE', 'ECE', 'EEE', 'AIML', 'DS', 'CS', 'ALL'];

  // Only fetch company list for non-HR users (HR company is auto-assigned)
  useEffect(() => {
    if (isHR) return;
    axios.get(`${API_BASE}/company-api/company`, { withCredentials: true })
      .then(res => setCompanies(res.data.payload || []))
      .catch(console.error);
  }, [isHR]);

  useEffect(() => {
    reset({
      companyId:     driveToEdit?.companyId?._id || driveToEdit?.companyId || '',
      Title:         driveToEdit?.Title || '',
      JobRole:       driveToEdit?.JobRole || '',
      Package:       driveToEdit?.Package || '',
      LastDate:      driveToEdit?.LastDate ? driveToEdit.LastDate.slice(0, 10) : '',
      MinCGPA:       driveToEdit?.MinCGPA || '',
      AllowedBranch: driveToEdit?.AllowedBranch || [],
      description:   driveToEdit?.description || '',
    });
  }, [driveToEdit, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        Title:         data.Title,
        JobRole:       data.JobRole,
        Package:       data.Package,
        LastDate:      data.LastDate,
        MinCGPA:       data.MinCGPA,
        AllowedBranch: data.AllowedBranch,
        description:   data.description,
        isActive:      driveToEdit ? driveToEdit.isActive : true,
      };

      // For HR users, auto-assign their account id so each HR owns only their drives
      if (isHR) {
        if (hrUserId) {
          payload.hrId = hrUserId;
        }
        if (hrCompanyName) {
          // Company doesn't exist yet — backend will create it
          payload.companyName = hrCompanyName;
        }
      } else {
        payload.companyId = data.companyId;
      }

      if (driveToEdit) {
        await axios.put(`${API_BASE}/drive-api/drive/${driveToEdit._id}`, payload, { withCredentials: true });
        alert('Drive Updated Successfully');
      } else {
        await axios.post(`${API_BASE}/drive-api/drive`, payload, { withCredentials: true });
        alert('Drive Added Successfully');
      }

      onAdded();
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${driveToEdit ? 'update' : 'add'} drive`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#111111] border border-[#222222] rounded-3xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Drive</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold transition">&times;</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Company dropdown — only shown for non-HR users */}
          {!isHR && (
          <div>
            <select
              className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white transition"
              {...register('companyId', { required: 'Company is required' })}>
              <option value="">Select Company</option>
              {companies.map(c => (
                <option key={c._id} value={c._id}>{c.CompanyName}</option>
              ))}
            </select>
            {errors.companyId && <p className="text-red-400 text-xs mt-1">{errors.companyId.message}</p>}
          </div>
          )}
          {isHR && hrCompanyName && (
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-gray-400 text-sm">Company:</span>
              <span className="text-white font-semibold">{hrCompanyName}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <input type="text" placeholder="Drive Title"
                className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white transition"
                {...register('Title', { required: 'Title is required' })} />
              {errors.Title && <p className="text-red-400 text-xs mt-1">{errors.Title.message}</p>}
            </div>
            <div>
              <input type="text" placeholder="Job Role"
                className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white transition"
                {...register('JobRole', { required: 'Job Role is required' })} />
              {errors.JobRole && <p className="text-red-400 text-xs mt-1">{errors.JobRole.message}</p>}
            </div>
            <div>
              <input type="text" placeholder="Package (e.g., 10 LPA)"
                className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white transition"
                {...register('Package', { required: 'Package is required' })} />
              {errors.Package && <p className="text-red-400 text-xs mt-1">{errors.Package.message}</p>}
            </div>
            <div>
              <input type="date"
                className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white transition"
                {...register('LastDate', { required: 'Last Date is required' })} />
              {errors.LastDate && <p className="text-red-400 text-xs mt-1">{errors.LastDate.message}</p>}
            </div>
            <div>
              <input type="number" step="0.1" placeholder="Min CGPA"
                className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                {...register('MinCGPA', { required: 'Min CGPA is required', min: 0, max: 10 })} />
              {errors.MinCGPA && <p className="text-red-400 text-xs mt-1">{errors.MinCGPA.message}</p>}
            </div>
          </div>
          {/* Multi-select branches */}
          <div>
            <div className="rounded-2xl border border-[#333333] bg-[#0f0f0f] p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-sm font-semibold text-white">Eligible Branches</p>
                <span className="text-xs text-gray-400">Select any number of branches</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {branchOptions.map((branch) => (
                  <label
                    key={branch}
                    className="flex items-center gap-2 rounded-xl border border-[#333333] bg-[#151515] px-3 py-2 text-sm text-gray-200 transition hover:border-blue-700/40 hover:bg-blue-900/10"
                  >
                    <input
                      type="checkbox"
                      value={branch}
                      className="accent-blue-600 h-4 w-4"
                      {...register('AllowedBranch', { required: 'Select at least one branch' })}
                    />
                    <span>{branch === 'ALL' ? 'ALL - All branches eligible' : branch}</span>
                  </label>
                ))}
              </div>
            </div>
            {errors.AllowedBranch && <p className="text-red-400 text-xs mt-1">{errors.AllowedBranch.message}</p>}
          </div>
          <div>
            <textarea placeholder="Description" rows="2"
              className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white resize-none transition"
              {...register('description')} />
          </div>
          <button type="submit" disabled={submitting}
            className="mt-4 bg-white text-black font-bold py-3.5 rounded-full hover:bg-gray-200 transition shadow-lg disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Add Drive'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────── Student Analytics ─────────────── */
/* ─────────────── Student Analytics Panel ─────────────── */
// Student dashboard summary showing application counts, status charts, and recent activity
function StudentAnalytics({ applications = [], drives = [] }) {
  const apps = useMemo(() => applications || [], [applications]);

  const counts = useMemo(() => {
    const c = { APPLIED: 0, SHORTLISTED: 0, SELECTED: 0, REJECTED: 0 };
    apps.forEach(a => { if (c[a.status] !== undefined) c[a.status]++; });
    return c;
  }, [apps]);

  const successRate = apps.length
    ? Math.round((counts.SELECTED / apps.length) * 100)
    : 0;

  const { months, monthCounts } = useMemo(() => {
    const map = {};
    apps.forEach(a => {
      const d = new Date(a.appliedDate);
      if (isNaN(d)) return;
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      map[key] = (map[key] || 0) + 1;
    });
    return { months: Object.keys(map), monthCounts: Object.values(map) };
  }, [apps]);

  const sorted = [...apps].sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

  const donutData = {
    labels: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
    datasets: [{
      data: [counts.APPLIED, counts.SHORTLISTED, counts.SELECTED, counts.REJECTED],
      backgroundColor: ['#378ADD', '#EF9F27', '#639922', '#E24B4A'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const lineData = {
    labels: months,
    datasets: [{
      label: 'Applications',
      data: monthCounts,
      borderColor: '#378ADD',
      backgroundColor: 'rgba(55,138,221,0.08)',
      borderWidth: 2,
      pointBackgroundColor: '#378ADD',
      pointRadius: 4,
      fill: true,
      tension: 0.4,
    }],
  };

  const axisOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#666', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { beginAtZero: true, ticks: { color: '#666', font: { size: 11 }, stepSize: 1, precision: 0 }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const statCards = [
    { label: 'Total applied',  value: apps.length,        sub: 'all drives',       color: 'text-white' },
    { label: 'Shortlisted',    value: counts.SHORTLISTED, sub: 'in review',        color: 'text-yellow-400' },
    { label: 'Selected',       value: counts.SELECTED,    sub: 'offers received',  color: 'text-green-400' },
    { label: 'Success rate',   value: `${successRate}%`,  sub: 'selected / total', color: 'text-white' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl sm:text-2xl font-bold">My Analytics</h3>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="bg-[#111111] border border-[#222222] rounded-2xl p-4">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-600 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Status breakdown</p>
          <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-400">
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c.bg }}></span>
                {s[0] + s.slice(1).toLowerCase()} {counts[s]}
              </span>
            ))}
          </div>
          <div className="relative h-48">
            <Doughnut data={donutData}
              options={{ responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Applications over time</p>
          <div className="relative h-56">
            {months.length > 0
              ? <Line data={lineData} options={axisOpts} />
              : <p className="text-gray-600 text-sm text-center pt-16">Not enough data yet.</p>
            }
          </div>
        </div>
      </div>


      {/* Hiring by Company + Candidate Status Pie */}
      {drives.length > 0 && (() => {
        const hireHist = toRows(groupCount(drives.filter(d => d.companyId?.CompanyName || d.company), d => d.companyId?.CompanyName || d.company || 'Unknown'), 'Company', 'Posted Drives');
        if (hireHist.length === 0) return null;
        const hireChart = {
          labels: hireHist.map(h => h.Company),
          datasets: [{
            label: 'Posted Drives',
            data: hireHist.map(h => h['Posted Drives']),
            backgroundColor: ['#378ADD', '#EF9F27', '#639922', '#E24B4A', '#9D5C9E', '#FF6B6B', '#4ECDC4', '#45B7D1'].slice(0, hireHist.length),
            borderWidth: 0,
          }],
        };
        const shortlisted = counts.SHORTLISTED || 0;
        const rejected    = counts.REJECTED    || 0;
        const candidatePieData = {
          labels: ['Shortlisted', 'Rejected'],
          datasets: [{
            data: [shortlisted, rejected],
            backgroundColor: ['#EF9F27', '#E24B4A'],
            borderWidth: 0,
            hoverOffset: 6,
          }],
        };
        const hasPieData = shortlisted > 0 || rejected > 0;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Hiring by Company</p>
              <div className="relative h-56">
                <Bar data={hireChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#666', stepSize: 1, precision: 0 }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#666' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
              </div>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Shortlisted vs Rejected</p>
              {hasPieData ? (
                <div className="flex flex-col items-center">
                  <div className="relative h-40 w-full max-w-[200px]">
                    <Pie data={candidatePieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                  <div className="flex gap-5 mt-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#EF9F27' }} />
                      Shortlisted <span className="text-yellow-400 font-bold ml-1">{shortlisted}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#E24B4A' }} />
                      Rejected <span className="text-red-400 font-bold ml-1">{rejected}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No candidate data yet.</p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Timeline */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Activity timeline</p>
        {sorted.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No applications yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {sorted.map((a, i) => {
              const sc     = STATUS_COLORS[a.status] || STATUS_COLORS.APPLIED;
              const isLast = i === sorted.length - 1;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: sc.bg }}></div>
                    {!isLast && <div className="w-px flex-1 bg-[#222222] mt-1" style={{ minHeight: '24px' }}></div>}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white">{a.company}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border uppercase ${sc.badge}`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {a.role}{a.salary ? ` · ${a.salary}` : ''} · {a.appliedDate}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Teacher Reports Panel ─────────────── */
// Teacher dashboard for placement reporting, charts, and export actions
function TeacherReports({ user, profileDetails, drives = [], allApplications = [], showToast }) {
  const [applications, setApplications] = useState([]);
  const [allApps, setAllApps] = useState(allApplications);

  useEffect(() => {
    const fetchSelectedApplications = async () => {
      try {
        const res = await axios.get(`${API_BASE}/student-api/applications`, {
          withCredentials: true,
          params: { status: 'SELECTED' },
        });
        setApplications(res.data.payload || []);
      } catch (err) {
        console.error('Failed to load selected applications', err);
        setApplications([]);
      }
    };

    const fetchAllApplications = async () => {
      if (allApplications.length > 0) { setAllApps(allApplications); return; }
      try {
        const res = await axios.get(`${API_BASE}/student-api/applications`, { withCredentials: true });
        setAllApps(res.data.payload || []);
      } catch (err) {
        console.error('Failed to load all applications for teacher charts', err);
      }
    };

    fetchSelectedApplications();
    fetchAllApplications();
  }, []);

  const reportOptions = [
    { key: 'branch', title: 'Branch-wise placements', label: 'Branch', valueLabel: 'Placements' },
    { key: 'company', title: 'Company-wise placements', label: 'Company', valueLabel: 'Placements' },
  ];

  const [activeReport, setActiveReport] = useState('branch');

  const schemaBranches = ['cse', 'eee', 'ece', 'me', 'ce', 'it', 'ds'];
  const normalizeBranch = (branch) => {
    const value = String(branch || '').trim().toLowerCase();
    return schemaBranches.includes(value) ? value : 'unknown';
  };

  const branchChartData = React.useMemo(() => {
    const branchData = groupCount(applications, a => normalizeBranch(a.studentBranch));
    const labels = [...schemaBranches, ...Object.keys(branchData).filter(key => !schemaBranches.includes(key))];
    const data = labels.map(label => branchData[label] || 0);
    return {
      labels,
      datasets: [{
        label: 'Placements',
        data,
        backgroundColor: ['#378ADD', '#EF9F27', '#639922', '#E24B4A', '#9D5C9E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#A52A2A'].slice(0, labels.length),
        borderWidth: 0,
      }],
    };
  }, [applications]);

  const companyChartData = React.useMemo(() => {
    const companyData = groupCount(applications, a => a.company || 'Unknown');
    const labels = Object.keys(companyData);
    const data = Object.values(companyData);
    return {
      labels,
      datasets: [{
        label: 'Placements',
        data,
        backgroundColor: ['#378ADD', '#EF9F27', '#639922', '#E24B4A', '#9D5C9E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#A52A2A', '#8A2BE2'].slice(0, labels.length),
        borderWidth: 0,
      }],
    };
  }, [applications]);

  const reportRows = React.useMemo(() => {
    if (activeReport === 'branch') {
      return toRows(groupCount(applications, a => normalizeBranch(a.studentBranch)), 'Branch', 'Placements');
    }
    if (activeReport === 'company') {
      return toRows(groupCount(applications, a => a.company || 'Unknown'), 'Company', 'Placements');
    }
    return [];
  }, [activeReport, applications]);

  const selectedReport = reportOptions.find(r => r.key === activeReport) || reportOptions[0];

  const handleExportExcel = () => {
    if (reportRows.length === 0) return;
    saveWorkbook([{ name: selectedReport.title, rows: reportRows }], `${selectedReport.title.replace(/\s+/g, '_')}.xlsx`);
  };

  const handleExportPDF = () => {
    printReport(selectedReport.title, reportRows);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-400 font-semibold mb-3">Teacher dashboard</p>
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Generate Reports</h3>
            <p className="text-gray-400 max-w-2xl">View branch-wise and company-wise placement summaries. Export any report as PDF or Excel.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleExportPDF}
              className="bg-white text-black font-semibold px-5 py-3 rounded-2xl hover:bg-gray-200 transition">
              Export PDF
            </button>
            <button onClick={handleExportExcel}
              className="bg-blue-600 text-white font-semibold px-5 py-3 rounded-2xl hover:bg-blue-500 transition">
              Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {reportOptions.map(report => (
          <button key={report.key} onClick={() => setActiveReport(report.key)}
            className={`rounded-3xl border p-5 text-left transition ${activeReport === report.key ? 'border-white bg-white text-black' : 'border-[#222222] bg-[#111111] text-gray-300 hover:border-[#444444]'}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">{report.title}</p>
            <p className="text-2xl font-bold">{reportRows.length > 0 ? reportRows.reduce((sum, row) => sum + Number(Object.values(row)[1] || 0), 0) : 0}</p>
            <p className="text-gray-500 text-sm mt-1">Total placements</p>
          </button>
        ))}
      </div>

      {(activeReport === 'branch' || activeReport === 'company') && reportRows.length > 0 ? (
        <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
          <h4 className="text-lg font-bold text-white mb-4">{selectedReport.title}</h4>
          <div className="relative h-80">
            {activeReport === 'branch'  && <Pie data={branchChartData}  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#ddd' } } } }} />}
            {activeReport === 'company' && <Pie data={companyChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#ddd' } } } }} />}
          </div>
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#222222] rounded-3xl overflow-hidden transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
          <div className="px-6 py-5 border-b border-[#222222]">
            <h4 className="text-lg font-bold text-white">{selectedReport.title}</h4>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-[0.2em] border-b border-[#222222]">
                  <th className="py-3 px-4">{selectedReport.label}</th>
                  <th className="py-3 px-4">{selectedReport.valueLabel}</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.length > 0 ? reportRows.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-[#0e0e0e]' : ''}>
                    <td className="py-3 px-4 text-sm text-gray-200">{Object.values(row)[0]}</td>
                    <td className="py-3 px-4 text-sm text-white">{Object.values(row)[1]}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="2" className="py-8 px-4 text-center text-gray-500">No placement data available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hiring by Company + Candidate Status Pie for Teacher */}
      {drives.length > 0 && (() => {
        const hireHist = toRows(groupCount(drives.filter(d => d.companyId?.CompanyName || d.company), d => d.companyId?.CompanyName || d.company || 'Unknown'), 'Company', 'Posted Drives');
        if (hireHist.length === 0) return null;
        const hireChart = {
          labels: hireHist.map(h => h.Company),
          datasets: [{
            label: 'Posted Drives',
            data: hireHist.map(h => h['Posted Drives']),
            backgroundColor: ['#378ADD', '#EF9F27', '#639922', '#E24B4A', '#9D5C9E', '#FF6B6B', '#4ECDC4', '#45B7D1'].slice(0, hireHist.length),
            borderWidth: 0,
          }],
        };
        const shortlisted = allApps.filter(a => a.status === 'SHORTLISTED').length;
        const rejected    = allApps.filter(a => a.status === 'REJECTED').length;
        const candidatePieData = {
          labels: ['Shortlisted', 'Rejected'],
          datasets: [{
            data: [shortlisted, rejected],
            backgroundColor: ['#EF9F27', '#E24B4A'],
            borderWidth: 0,
            hoverOffset: 6,
          }],
        };
        const hasPieData = shortlisted > 0 || rejected > 0;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">Hiring by Company</h4>
              <div className="relative h-64">
                <Bar data={hireChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#666', stepSize: 1, precision: 0 }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#666' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
              </div>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">Shortlisted vs Rejected</h4>
              {hasPieData ? (
                <div className="flex flex-col items-center">
                  <div className="relative h-48 w-full max-w-[220px]">
                    <Pie data={candidatePieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                  <div className="flex gap-6 mt-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#EF9F27' }} />
                      Shortlisted <span className="text-yellow-400 font-bold ml-1">{shortlisted}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#E24B4A' }} />
                      Rejected <span className="text-red-400 font-bold ml-1">{rejected}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-10">No candidate data yet.</p>
              )}
            </div>
          </div>
        );
      })()}

    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#222222] bg-[#111111] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="h-12 w-12 rounded-xl bg-[#1a1a1a]" />
        <div className="flex flex-col items-end gap-2">
          <div className="h-5 w-24 rounded-full bg-[#1a1a1a]" />
          <div className="h-4 w-16 rounded-full bg-[#1a1a1a]" />
        </div>
      </div>
      <div className="h-5 w-3/4 rounded bg-[#1a1a1a] mb-3" />
      <div className="h-4 w-1/2 rounded bg-[#1a1a1a] mb-6" />
      <div className="h-10 w-full rounded-xl bg-[#1a1a1a]" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 rounded-xl border border-[#333333] bg-[#1a1a1a] p-4">
      <div className="h-5 w-5 rounded bg-[#222222]" />
      <div className="h-10 w-10 rounded-full bg-[#222222]" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-1/3 rounded bg-[#222222] mb-2" />
        <div className="h-3 w-1/2 rounded bg-[#222222]" />
      </div>
      <div className="h-7 w-24 rounded-full bg-[#222222]" />
    </div>
  );
}

/* ─────────────── HR Dashboard ─────────────── */
// HR view for managing companies, drives, and hiring activity
function HRDashboard({ companies, drives, onCompaniesUpdated, showToast }) {
  const [form, setForm] = useState({ CompanyName: '', CompanyId: '', Email: '', Descrption: '' });
  const [editingCompany, setEditingCompany] = useState(null);
  const [saving, setSaving] = useState(false);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchAllApplications = async () => {
      try {
        const res = await axios.get(`${API_BASE}/student-api/applications`, { withCredentials: true });
        setApplications(res.data.payload || []);
      } catch (err) {
        console.error("Failed to fetch applications for HR dashboard", err);
      }
    };
    fetchAllApplications();
  }, []);

  const hrDriveIds = useMemo(() => new Set(drives.map(d => String(d._id || d.id))), [drives]);
  const hrApplications = useMemo(() => {
    return applications.filter(app => hrDriveIds.has(String(app.driveid || app.driveId)));
  }, [applications, hrDriveIds]);

  const stats = useMemo(() => {
    let shortlisted = 0;
    let rejected = 0;
    let selected = 0;
    let applied = 0;
    hrApplications.forEach(app => {
      if (app.status === 'SHORTLISTED') shortlisted++;
      if (app.status === 'REJECTED') rejected++;
      if (app.status === 'SELECTED') selected++;
      if (app.status === 'APPLIED') applied++;
    });
    return { shortlisted, rejected, selected, applied };
  }, [hrApplications]);

  const statusPieData = useMemo(() => {
    return {
      labels: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
      datasets: [{
        data: [stats.applied, stats.shortlisted, stats.selected, stats.rejected],
        backgroundColor: ['#378ADD', '#EF9F27', '#639922', '#E24B4A'],
        borderWidth: 0,
      }],
    };
  }, [stats]);

  const hireHistory = React.useMemo(() => {
    return toRows(groupCount(drives.filter(d => d.companyId?.CompanyName), d => getCompanyName(d)), 'Company', 'Posted Drives');
  }, [drives]);

  const hireChartData = React.useMemo(() => {
    const labels = hireHistory.map(h => h.Company);
    const data = hireHistory.map(h => h['Posted Drives']);
    return {
      labels,
      datasets: [{
        label: 'Posted Drives',
        data,
        backgroundColor: ['#378ADD', '#EF9F27', '#639922', '#E24B4A', '#9D5C9E', '#FF6B6B', '#4ECDC4', '#45B7D1'].slice(0, labels.length),
        borderWidth: 0,
      }],
    };
  }, [hireHistory]);

  const handleFieldChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setEditingCompany(null);
    setForm({ CompanyName: '', CompanyId: '', Email: '', Descrption: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      CompanyName: form.CompanyName,
      CompanyId: Number(form.CompanyId),
      Email: form.Email,
      Descrption: form.Descrption,
      isActive: true,
    };

    if (!payload.CompanyName || !payload.CompanyId || !payload.Email) {
      showToast('Company name, ID and email are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingCompany) {
        const companyKey = editingCompany.CompanyId || editingCompany._id;
        await axios.put(`${API_BASE}/company-api/company/${companyKey}`, payload, { withCredentials: true });
        showToast('Company updated successfully.');
      } else {
        await axios.post(`${API_BASE}/company-api/company`, payload, { withCredentials: true });
        showToast('Company added successfully.');
      }
      resetForm();
      onCompaniesUpdated();
    } catch (err) {
      console.error('Company submit failed', err);
      showToast('Failed to save company details.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setForm({
      CompanyName: company.CompanyName || '',
      CompanyId: String(company.CompanyId || ''),
      Email: company.Email || '',
      Descrption: company.Descrption || '',
    });
  };

  const handleToggleActive = async (company) => {
    try {
      const companyKey = company.CompanyId || company._id;
      await axios.patch(`${API_BASE}/company-api/company/${companyKey}`, { isActive: !company.isActive });
      showToast(`Company ${company.isActive ? 'disabled' : 'enabled'} successfully.`);
      onCompaniesUpdated();
    } catch (err) {
      console.error('Toggle active failed', err);
      showToast('Cannot update company status.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
        <h3 className="text-2xl font-bold mb-6">HR Analytics Dashboard</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-[#0f0f0f] rounded-3xl p-4 border border-[#222222] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Companies</p>
            <p className="text-3xl font-bold text-white">{companies.length}</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-3xl p-4 border border-[#222222] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Drives</p>
            <p className="text-3xl font-bold text-white">{drives.length}</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-3xl p-4 border border-[#222222] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-yellow-500/35 hover:shadow-[0_0_24px_rgba(239,159,39,0.18)]">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-500 mb-2">Shortlisted</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.shortlisted}</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-3xl p-4 border border-[#222222] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-green-500/35 hover:shadow-[0_0_24px_rgba(78,205,196,0.18)]">
            <p className="text-sm uppercase tracking-[0.2em] text-green-500 mb-2">Selected</p>
            <p className="text-3xl font-bold text-green-400">{stats.selected}</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-3xl p-4 border border-[#222222] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-red-500/35 hover:shadow-[0_0_24px_rgba(239,68,68,0.18)]">
            <p className="text-sm uppercase tracking-[0.2em] text-red-500 mb-2">Rejected</p>
            <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-3xl p-4 border border-[#222222] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">Active Cos</p>
            <p className="text-3xl font-bold text-white">{companies.filter(c => c.isActive).length}</p>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <div className="bg-[#0f0f0f] rounded-3xl p-6 border border-[#222222] w-full max-w-md">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4 text-center">Application Status Breakdown</p>
            {hrApplications.length > 0 ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-64 w-full max-w-[280px]">
                  <Pie data={statusPieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#ddd', padding: 12, font: { size: 12 } } } } }} />
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No applicant data available yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#222222] rounded-3xl p-6 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
        <h3 className="text-2xl font-bold mb-4">Company List</h3>
        <div className="grid gap-4">
          {companies.length === 0 ? (
            <p className="text-gray-400">No companies found. Add a company to manage hiring reports.</p>
          ) : companies.map(company => (
            <div key={company.CompanyId || company._id} className="bg-[#0f0f0f] rounded-3xl p-5 border border-[#222222] flex flex-col lg:flex-row lg:items-center justify-between gap-4 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01]">
              <div>
                <h4 className="text-lg font-semibold text-white">{company.CompanyName}</h4>
                <p className="text-gray-400 text-sm">ID: {company.CompanyId || 'N/A'} · HR Email: {company.Email || 'N/A'}</p>
                <p className="text-gray-500 text-sm mt-2">{company.Descrption || 'No description provided.'}</p>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <span className={`px-3 py-2 text-xs font-semibold rounded-full ${company.isActive ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                  {company.isActive ? 'Active' : 'Disabled'}
                </span>
                <button onClick={() => handleToggleActive(company)}
                  className={`px-4 py-2 rounded-2xl font-semibold transition ${company.isActive ? 'bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20' : 'bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500/20'}`}>
                  {company.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ─────────────── Main Page ─────────────── */
/* ─────────────── Main Page Component ─────────────── */
// Main UI component that switches between drives, analytics, settings, and modals
function Mainpage() {
  const { user, profileDetails, logout, saveProfileDetails } = useContext(UserContext);
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal]     = useState(false);
  const [profileReady, setProfileReady]             = useState(false);
  const [selectedDriveToApply, setSelectedDriveToApply] = useState(null);
  const [selectedDriveToView, setSelectedDriveToView]   = useState(null);
  const [selectedDriveToEdit, setSelectedDriveToEdit]   = useState(null);
  const [activeView, setActiveView]                 = useState('drives');
  const [appliedDriveIds, setAppliedDriveIds]       = useState([]);
  const [userApplications, setUserApplications]     = useState([]);
  const [showAddDriveModal, setShowAddDriveModal]   = useState(false);
  const [searchQuery, setSearchQuery]               = useState('');
  const [cgpaFilter, setCgpaFilter]                 = useState('');
  const [driveSortOrder, setDriveSortOrder]         = useState('newest');
  const [drives, setDrives]                         = useState([]);
  const [companies, setCompanies]                   = useState([]);
  const [toast, setToast]                           = useState(null);
  const [drivesLoading, setDrivesLoading]           = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  const isHR = user?.role === 'hr' || user?.role === 'HR';
  const isTeacher = user?.role === 'Teacher';
  const isStudent = !isHR && !isTeacher;

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const fetchDrives = async () => {
    try {
      if (!user) {
        setDrivesLoading(false);
        return;
      }
      // HR users only fetch drives they created, keyed by user id
      if (isHR && user?.id) {
        const res = await axios.get(`${API_BASE}/drive-api/drive/hr/${user.id}`, { withCredentials: true });
        setDrives(res.data.payload || []);
        return;
      }
      const res = await axios.get(`${API_BASE}/drive-api/drive`, { withCredentials: true });
      setDrives(res.data.payload || []);
    } catch (err) {
      console.error('Failed to fetch drives', err);
      setDrives([]);
    } finally {
      setDrivesLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/company-api/company`, { withCredentials: true });
      const all = res.data.payload || [];
      // For HR users, only show their own company
      if (isHR && profileDetails?.companyName) {
        const myCompany = all.filter(
          c => c.CompanyName?.toLowerCase() === profileDetails.companyName.toLowerCase()
        );
        setCompanies(myCompany);
      } else {
        setCompanies(all);
      }
    } catch (err) {
      console.error('Failed to fetch companies', err);
    }
  };

  const fetchUserApplications = useCallback(async () => {
    if (!user?.email) {
      setUserApplications([]);
      setAppliedDriveIds([]);
      setApplicationsLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/student-api/applications`, {
        withCredentials: true,
        params: { studentEmail: user.email },
      });
      const apps = res.data.payload || [];
      setUserApplications(apps);
      const ids = apps.map(a => String(a.driveid || a.driveId || ''));
      setAppliedDriveIds([...new Set(ids.filter(Boolean))]);
    } catch (err) {
      console.error('Failed to fetch user applications', err);
      setUserApplications([]);
      setAppliedDriveIds([]);
    } finally {
      setApplicationsLoading(false);
    }
  }, [user?.email]);

  const refreshDashboardData = useCallback(() => {
    fetchUserApplications();
    fetchDrives();
  }, [fetchUserApplications]);

  // Load the list of drives once when user/profileDetails are ready
  useEffect(() => { fetchDrives(); }, [isHR, user?.id]);
  // Load companies only for HR users so the HR dashboard has data
  useEffect(() => { if (isHR) fetchCompanies(); }, [isHR, profileDetails?.companyName]);
  // Load the signed-in student's applications from the backend
  useEffect(() => { fetchUserApplications(); }, [fetchUserApplications]);

  const { register: registerSettings, handleSubmit: handleSettingsSubmit, reset: resetSettings } = useForm({
    defaultValues: {
      name:     user?.name             || '',
      email:    user?.email            || '',
      companyName: profileDetails?.companyName || '',
      designation: profileDetails?.designation || '',
      department: profileDetails?.department || '',
      phone:    profileDetails?.phone  || '',
      cgpa:     profileDetails?.cgpa   || '',
      branch:   profileDetails?.branch || '',
      skills:   profileDetails?.skills || '',
      github:   profileDetails?.github || '',
      linkedin: profileDetails?.linkedin || '',
    },
  });

  //show profile modal if details are missing
  useEffect(() => {
    if (!user) {
      setShowProfileModal(false);
      setProfileReady(false);
      return;
    }
    const completed = user?.profileCompleted === true || isProfileComplete(profileDetails, user?.role);
    setProfileReady(true);
    setShowProfileModal(!completed);
  }, [user, profileDetails]);

  //sync settings form when user/profile changes
  useEffect(() => {
    resetSettings({
      name:     user?.name             || '',
      email:    user?.email            || '',
      companyName: profileDetails?.companyName || '',
      designation: profileDetails?.designation || '',
      department: profileDetails?.department || '',
      phone:    profileDetails?.phone  || '',
      cgpa:     profileDetails?.cgpa   || '',
      branch:   profileDetails?.branch || '',
      skills:   profileDetails?.skills || '',
      github:   profileDetails?.github || '',
      linkedin: profileDetails?.linkedin || '',
    });
  }, [user, profileDetails, resetSettings]);

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/%3E%3C/svg%3E";
  const profileImageUrl = profileDetails?.profileImage || user?.profileImage || defaultAvatar;

  const filteredDrives = drives.filter(d => {
    const companyName = d.companyId?.CompanyName || '';
    const searchValue = searchQuery.toLowerCase();
    const matchName   = companyName.toLowerCase().includes(searchValue) || d.Title?.toLowerCase().includes(searchValue) || d.JobRole?.toLowerCase().includes(searchValue);
    const matchCgpa   = cgpaFilter ? parseFloat(d.MinCGPA) <= parseFloat(cgpaFilter) : true;
    return matchName && matchCgpa;
  }).sort((a, b) => {
    const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : (a?._id ? parseInt(String(a._id).slice(0, 8), 16) * 1000 : 0);
    const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : (b?._id ? parseInt(String(b._id).slice(0, 8), 16) * 1000 : 0);
    return driveSortOrder === 'oldest' ? aTime - bTime : bTime - aTime;
  });

  const handleApplied = () => {
    fetchUserApplications();
  };

  const toggleDriveActive = async (drive) => {
    try {
      await axios.patch(`${API_BASE}/drive-api/drive/${drive._id}`, {
        isActive: !drive.isActive,
      }, { withCredentials: true });
      showToast(`Drive ${drive.isActive ? 'stopped' : 'resumed'} successfully.`);
      fetchDrives();
    } catch (err) {
      console.error('Failed to update drive status', err);
      showToast('Unable to update drive status.', 'error');
    }
  };

  const getAppliedRoles = () => userApplications;

  const onUpdateSettings = async (data) => {
    const profileImage = data.profileImage?.[0]
      ? await fileToDataUrl(data.profileImage[0])
      : profileDetails?.profileImage || user?.profileImage || '';
    await saveProfileDetails({
      ...profileDetails,
      name:     data.name,
      email:    data.email,
      companyName: data.companyName,
      designation: data.designation,
      department: data.department,
      phone:    data.phone,
      cgpa:     data.cgpa,
      branch:   data.branch,
      skills:   data.skills,
      github:   data.github,
      linkedin: data.linkedin,
      profileImage,
    });
    alert('Profile settings updated!');
  };

  const statusBadge = (s) => {
    const map = {
      APPLIED:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
      SHORTLISTED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      SELECTED:    'bg-green-500/10 text-green-400 border-green-500/20',
      REJECTED:    'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return map[s] || 'bg-green-500/10 text-green-500 border-green-500/20';
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white px-4 py-5 sm:p-6 lg:p-10 font-sans flex flex-col gap-5 sm:gap-8">
      <ScrollRestoration />
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* ── Profile Card ── */}
      <div className="w-full bg-[#111111] border border-[#222222] rounded-2xl p-5 sm:p-6 lg:p-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-8 justify-between relative shadow-lg transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#333333] shadow-lg bg-[#1a1a1a]">
              <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover"
                onError={e => { e.target.src = defaultAvatar; }} />
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#111111] shadow"></span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 break-words">{user?.name || 'Guest User'}</h2>
            <p className="text-gray-400 text-sm sm:text-base mb-3 break-all">{user?.email || 'No Email Provided'}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
              <span className="bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-[#333333] text-sm text-gray-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {user?.role || 'Student'}
              </span>
              {profileDetails?.designation && (
                <span className="bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-[#333333] text-sm text-gray-300">
                  {profileDetails.designation}
                </span>
              )}
              {profileDetails?.cgpa && !isTeacher && !isHR && (
                <span className="bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-[#333333] text-sm text-gray-300">
                  CGPA: {profileDetails.cgpa}
                </span>
              )}
              {(profileDetails?.department || profileDetails?.branch) && (
                <span className="bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-[#333333] text-sm text-gray-300">
                  {profileDetails.department || profileDetails.branch}
                </span>
              )}
              {isHR && profileDetails?.companyName && (
                <span className="bg-blue-500/10 text-blue-300 px-4 py-1.5 rounded-full border border-blue-500/20 text-sm font-medium">
                  🏢 {profileDetails.companyName}
                </span>

              )}
            </div>



            {/* ── Teacher extra details row ── */}
            {isTeacher && (
              <div className="flex flex-wrap gap-4 mt-1 text-sm">
                {profileDetails?.phone && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <span className="text-gray-600">📞</span>
                    <span>{profileDetails.phone}</span>
                  </div>
                )}
                {profileDetails?.department && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <span className="text-gray-600">🏛️</span>
                    <span>{profileDetails.department} Dept.</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Student quick stats ── */}
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login', { replace: true }); }}
          className="bg-red-500/10 text-red-500 border border-red-500/20 px-8 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 font-semibold w-full md:w-auto">
          Logout
        </button>
      </div>

      {/* ── Sidebar + Content ── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 w-full">

        {/* Sidebar */}
        <div className="w-full lg:w-64 flex lg:flex-col gap-3 shrink-0 overflow-x-auto pb-1 lg:pb-0">
          <h3 className="hidden lg:block text-gray-400 text-sm font-bold uppercase tracking-wider mb-2 px-2">Menu</h3>

          <button onClick={() => setActiveView('drives')}
            className={`px-5 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-200 font-semibold text-left border whitespace-nowrap ${
              activeView === 'drives'
                ? 'bg-white text-black border-white'
                : 'bg-[#111111] border-[#222222] hover:bg-[#1a1a1a] hover:border-red-500/25'
            }`}>
            {isHR ? 'Manage Drives' : 'Available Drives'}
          </button>

          {isStudent && (
            <button onClick={() => setActiveView('applied')}
              className={`px-5 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-200 font-semibold text-left border whitespace-nowrap ${
                activeView === 'applied'
                  ? 'bg-white text-black border-white'
                  : 'bg-[#111111] border-[#222222] hover:bg-[#1a1a1a] hover:border-red-500/25'
              }`}>
              Applied Roles
            </button>
          )}


                  {/* Analytics: HR uses their own dashboard, student uses StudentAnalytics, teacher uses reports */}
                  {isHR && (
                    <button onClick={() => setActiveView('analytics')}
                      className={`px-5 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-200 font-semibold text-left border whitespace-nowrap ${
                        activeView === 'analytics'
                          ? 'bg-white text-black border-white'
                          : 'bg-[#111111] border-[#222222] hover:bg-[#1a1a1a] hover:border-red-500/25'
                      }`}>
                      Analytics
                    </button>
                  )}

                  {!isHR && (
                    <button onClick={() => setActiveView('analytics')}
                      className={`px-5 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-200 font-semibold text-left border whitespace-nowrap ${
                        activeView === 'analytics'
                          ? 'bg-white text-black border-white'
                          : 'bg-[#111111] border-[#222222] hover:bg-[#1a1a1a] hover:border-red-500/25'
                      }`}>
                      {isTeacher ? 'Generate Reports' : 'My Analytics'}
                    </button>
                  )}

                  <button onClick={() => setActiveView('settings')}
                    className={`px-5 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all duration-200 font-semibold text-left border whitespace-nowrap ${
                      activeView === 'settings'
                        ? 'bg-white text-black border-white'
                        : 'bg-[#111111] border-[#222222] hover:bg-[#1a1a1a] hover:border-red-500/25'
                    }`}>
                    Settings
                  </button>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">

          {/* ── VIEW: DRIVES ── */}
          {activeView === 'drives' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 sm:mb-6 gap-4">
                <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  {isHR ? 'Your Posted Drives' : 'Available Drives'}
                  <span className="bg-white text-black text-xs px-3 py-1 rounded-full font-bold">{filteredDrives.length}</span>
                </h3>
                <div className="flex flex-wrap gap-3 items-center">
                  {!isHR && (
                    <>
                        <input type="text" placeholder="Search Title or Role..." value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-2 focus:outline-none focus:border-red-400 text-sm w-full sm:w-auto transition hover:shadow-[0_0_18px_rgba(239,68,68,0.12)]" />
                      {!isTeacher && (
                        <input type="number" step="0.1" placeholder="Max CGPA" value={cgpaFilter}
                          onChange={e => setCgpaFilter(e.target.value)}
                          className="bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-2 focus:outline-none focus:border-red-400 text-sm w-full sm:w-32 transition hover:shadow-[0_0_18px_rgba(239,68,68,0.12)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      )}
                    </>
                  )}
                  <select
                    value={driveSortOrder}
                    onChange={e => setDriveSortOrder(e.target.value)}
                    className="bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-2 focus:outline-none focus:border-red-400 text-sm transition hover:shadow-[0_0_18px_rgba(239,68,68,0.12)]"
                  >
                    <option value="newest">New to old</option>
                    <option value="oldest">Old to new</option>
                  </select>
                  {isHR && (
                    <button onClick={() => setShowAddDriveModal(true)}
                      className="bg-white text-black font-semibold px-5 py-2 rounded-xl hover:bg-gray-200 transition text-sm shadow-md hover:shadow-[0_0_22px_rgba(239,68,68,0.24)]">
                      + Add Drive
                    </button>
                  )}
                </div>
              </div>

              {/* HR stats bar */}
              {isHR && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {[
                    { label: 'Total Drives',  value: drives.length, color: 'from-blue-600 to-blue-400' },
                    { label: 'Active Drives', value: drives.filter(d => d.isActive).length, color: 'from-green-600 to-green-400' },
                    { label: 'Closing Soon',  value: drives.filter(d => { const days = Math.ceil((new Date(d.LastDate) - new Date()) / 86400000); return days >= 0 && days <= 3; }).length, color: 'from-orange-600 to-orange-400' },
                    { label: 'Expired',       value: drives.filter(d => new Date(d.LastDate) < new Date()).length, color: 'from-red-600 to-red-400' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#111111] border border-[#222222] rounded-2xl p-4 flex flex-col gap-1">
                      <span className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</span>
                      <span className="text-gray-500 text-xs font-medium">{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Drive cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {drivesLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
                ) : filteredDrives.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-[#2b2b2b] bg-[#0f0f0f]">
                    <div className="w-20 h-20 bg-[#1a1a1a] border border-[#222222] rounded-full flex items-center justify-center mb-4 text-4xl">🔍</div>
                    <h4 className="text-white font-bold text-lg mb-2">No drives found</h4>
                    <p className="text-gray-500 text-sm max-w-sm">Try adjusting your search or filter criteria, or wait for new drives to be posted.</p>
                  </div>
                ) : filteredDrives.map(drive => {
                  const companyName    = drive.companyId?.CompanyName || 'Unknown';
                  const alreadyApplied = appliedDriveIds.includes(drive._id);
                  const daysLeft       = Math.ceil((new Date(drive.LastDate) - new Date()) / 86400000);
                  const isClosingSoon  = daysLeft >= 0 && daysLeft <= 3;
                  const isExpired      = daysLeft < 0;
                  const isInactive     = drive.isActive === false;
                  const deadlineLabel  = isInactive ? 'Closed' : isExpired ? 'Expired' : daysLeft === 0 ? 'Last day!' : `${daysLeft}d left`;
                  const branches       = Array.isArray(drive.AllowedBranch) ? drive.AllowedBranch : [];
                  const userCgpa       = parseFloat(profileDetails?.cgpa || 0);
                  const driveCgpa      = parseFloat(drive.MinCGPA || 0);
                  const userBranch     = String(profileDetails?.branch || '').trim().toLowerCase();
                  const normalizedBranches = branches.map(b => String(b || '').trim().toLowerCase());
                  const isCgpaLow      = userCgpa < driveCgpa;
                  const isBranchInvalid = normalizedBranches.length > 0
                    && !normalizedBranches.includes('all')
                    && !normalizedBranches.includes(userBranch);

                  return (
                    <div key={drive._id} onClick={() => {
                        if (!isHR) setSelectedDriveToView({ ...drive, id: drive._id, company: companyName, role: drive.JobRole, salary: drive.Package });
                      }}
                      className={`cursor-pointer bg-[#111111] border rounded-2xl p-5 sm:p-6 hover:border-red-500/25 flex flex-col justify-between min-w-0 shadow-lg group ${isInactive ? 'border-gray-700 opacity-70' : isExpired ? 'border-red-900/40 opacity-70' : isClosingSoon ? 'border-orange-500/30' : 'border-[#222222]'}`}>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md group-hover:scale-105 transition-transform">
                            {companyName[0]}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs bg-[#1a1a1a] border border-[#333333] px-3 py-1 rounded-lg text-gray-300 font-medium">
                              Min CGPA: {drive.MinCGPA}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${isExpired ? 'bg-red-500/10 text-red-400 border border-red-500/20' : isClosingSoon ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-[#1a1a1a] text-gray-500'}`}>
                              {deadlineLabel}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-xl font-bold mb-1 truncate text-white">{companyName}</h4>
                        <p className="text-gray-400 text-sm mb-3 font-medium">{drive.Title} · {drive.JobRole}</p>
                        {branches.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {branches.slice(0, 3).map((b, i) => (
                              <span key={i} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">{b}</span>
                            ))}
                            {branches.length > 3 && <span className="text-xs text-gray-500 px-1">+{branches.length - 3} more</span>}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-[#222222] pt-4 mt-2">
                        <div className="flex flex-wrap justify-between items-center gap-2 mb-4 text-sm">
                          <span className="text-gray-200 font-bold bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#333333]">{drive.Package}</span>
                          <span className="text-gray-500 text-xs font-medium">
                            {new Date(drive.LastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {isHR ? (
                          <div className="grid gap-3">
                            <button onClick={() => setSelectedDriveToView({ ...drive, id: drive._id, company: companyName, role: drive.JobRole })}
                              className="w-full bg-[#1a1a1a] border border-[#333333] text-white font-semibold py-3 rounded-xl hover:bg-white hover:text-black transition shadow-sm">
                              View Candidates
                            </button>
                            <div className="flex gap-3">
                              <button onClick={() => setSelectedDriveToEdit(drive)}
                                className="flex-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold py-3 rounded-xl hover:bg-blue-500/20 transition">
                                Edit Drive
                              </button>
                              <button onClick={() => toggleDriveActive(drive)}
                                className={`flex-1 font-semibold py-3 rounded-xl transition ${drive.isActive ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500/20'}`}>
                                {drive.isActive ? 'Stop Drive' : 'Resume Drive'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {isTeacher ? null : alreadyApplied ? (
                              <button disabled className="w-full bg-green-500/10 text-green-500 border border-green-500/20 font-semibold py-3 rounded-xl cursor-not-allowed">
                                ✓ Applied
                              </button>
                            ) : (isInactive || isExpired) ? (
                              <button disabled className="w-full bg-[#1a1a1a] text-gray-500 border border-[#222222] font-semibold py-3 rounded-xl cursor-not-allowed">
                                Drive Closed/Expired
                              </button>
                            ) : (() => {
                              if (isCgpaLow)       return <div className="w-full text-center py-3 bg-red-500/10 text-red-500 font-bold rounded-xl text-sm">CGPA Too Low</div>;
                              if (isBranchInvalid) return <div className="w-full text-center py-3 bg-red-500/10 text-red-500 font-bold rounded-xl text-sm">Branch Not Eligible</div>;

                              return (
                                <button onClick={() => setSelectedDriveToApply({ ...drive, id: drive._id, company: companyName, role: drive.JobRole, salary: drive.Package })}
                                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition shadow-md">
                                  Apply Now
                                </button>
                              );
                            })()}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── VIEW: APPLIED ROLES ── */}
          {activeView === 'applied' && !isHR && !isTeacher && (() => {
            const roles = getAppliedRoles();
            return (
              <>
                <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 flex items-center gap-2">
                  Applied Roles
                  <span className="bg-white text-black text-xs px-3 py-1 rounded-full font-bold">{roles.length}</span>
                </h3>
                {applicationsLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, idx) => <SkeletonRow key={idx} />)}
                  </div>
                ) : roles.length === 0 ? (
                  <div className="bg-[#111111] border border-dashed border-[#222222] rounded-2xl p-8 sm:p-10 text-center text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-2xl">◎</div>
                    <p className="text-white font-semibold mb-2">No applications yet</p>
                    <p className="text-gray-400 text-sm">Browse the drives tab and apply to roles that match your profile.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {roles.map((role, idx) => (
                      <div key={idx} className="bg-[#111111] border border-[#222222] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 min-w-0">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-xl font-bold border border-[#333333]">
                            {role.company?.[0] || '?'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xl font-bold truncate">{role.company}</h4>
                            <p className="text-gray-400 text-sm">{role.role} · {role.salary}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusBadge(role.status)}`}>
                            {role.status}
                          </span>
                          <p className="text-gray-500 text-xs mt-2">Applied: {role.appliedDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}

          {/* ── VIEW: ANALYTICS ── */}
          {activeView === 'analytics' && !isHR && !isTeacher && (
            <StudentAnalytics applications={userApplications} drives={drives} />
          )}

          {activeView === 'analytics' && isTeacher && (
            <TeacherReports user={user} profileDetails={profileDetails} drives={drives} />
          )}

          {activeView === 'analytics' && isHR && (
            <HRDashboard companies={companies} drives={drives} onCompaniesUpdated={fetchCompanies} showToast={showToast} />
          )}

          {/* ── VIEW: SETTINGS ── */}
          {activeView === 'settings' && (
            <>
              <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">Profile Settings</h3>
              <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 sm:p-8 max-w-4xl">
                <form onSubmit={handleSettingsSubmit(onUpdateSettings)} className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                    <input type="text"
                      className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                      {...registerSettings('name', { required: true })} />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Email</label>
                    <input type="email"
                      className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                      {...registerSettings('email', { required: true })} />
                  </div>
                  {isHR && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Company Name</label>
                      <input type="text"
                        className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                        {...registerSettings('companyName', { required: true })} />
                    </div>
                  )}
                  {isTeacher && (
                    <>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Designation</label>
                        <select
                          className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                          {...registerSettings('designation', { required: true })}
                        >
                          <option value="">Select Designation</option>
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Professor">Professor</option>
                          <option value="HOD">HOD</option>
                          <option value="TPO">TPO</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Department</label>
                        <select
                          className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                          {...registerSettings('department', { required: true })}
                        >
                          <option value="">Select Department</option>
                          <option value="CSE">CSE</option>
                          <option value="ECE">ECE</option>
                          <option value="EEE">EEE</option>
                          <option value="MECH">MECH</option>
                          <option value="CIVIL">CIVIL</option>
                          <option value="IT">IT</option>
                          <option value="AIDS">AIDS</option>
                          <option value="AIML">AIML</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Profile Image</label>
                    <input type="file" accept="image/png,image/jpeg,image/webp"
                      className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200 cursor-pointer"
                      {...registerSettings('profileImage')} />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
                    <input type="text"
                      className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                      {...registerSettings('phone')} />
                  </div>
                  {!isHR && !isTeacher && (
                    <>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">CGPA</label>
                        <input type="text"
                          className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                          {...registerSettings('cgpa')} />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Branch</label>
                        <input type="text"
                          className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                          {...registerSettings('branch')} />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">GitHub Profile URL</label>
                        <input type="text"
                          className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                          {...registerSettings('github')} />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">LinkedIn Profile URL</label>
                        <input type="text"
                          className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white"
                          {...registerSettings('linkedin')} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-400 text-sm mb-2">Skills</label>
                        <textarea rows="3"
                          className="w-full bg-[#1a1a1a] border border-[#333333] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-white resize-none"
                          {...registerSettings('skills')} />
                      </div>
                    </>
                  )}
                  <button type="submit"
                    className="md:col-span-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition mt-2">
                    Save Changes
                  </button>
                </form>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── Modals ── */}
      {showProfileModal && profileReady && <ProfileFormModal onClose={() => setShowProfileModal(false)} />}
      {selectedDriveToApply && <ApplyJobModal drive={selectedDriveToApply} onClose={() => setSelectedDriveToApply(null)} onApplied={handleApplied} />}
      {selectedDriveToView && (
        isHR ? (
          <ViewApplicantsModal 
            drive={selectedDriveToView} 
            onClose={() => setSelectedDriveToView(null)} 
            showToast={showToast} 
            onStatusUpdated={refreshDashboardData} 
          />
        ) : (
          <DriveDetailModal
            drive={selectedDriveToView}
            onClose={() => setSelectedDriveToView(null)}
            onApply={(drive) => { setSelectedDriveToApply(drive); setSelectedDriveToView(null); }}
            isTeacher={isTeacher}
            isStudent={isStudent}
            alreadyApplied={appliedDriveIds.includes(selectedDriveToView._id)}
            profileDetails={profileDetails}
          />
        )
      )}
      {showAddDriveModal    && <AddDriveModal onClose={() => setShowAddDriveModal(false)} onAdded={() => { fetchDrives(); setShowAddDriveModal(false); }} isHR={isHR} hrCompanyName={profileDetails?.companyName} hrUserId={user?.id} />}
      {selectedDriveToEdit && <AddDriveModal driveToEdit={selectedDriveToEdit} onClose={() => setSelectedDriveToEdit(null)} onAdded={() => { fetchDrives(); setSelectedDriveToEdit(null); }} isHR={isHR} hrCompanyName={profileDetails?.companyName} hrUserId={user?.id} />}
    </div>
  );
}

export default Mainpage;
