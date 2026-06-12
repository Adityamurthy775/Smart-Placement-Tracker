import exp from 'express';
import { sendEmail } from '../modules/EmailService.js';

export const notifyapp = exp.Router();

const statusMessages = {
  SHORTLISTED: {
    subject: (company, role) => `🎉 You've been Shortlisted for ${role} at ${company}`,
    body: (name, company, role) =>
      `Dear ${name},\n\nCongratulations! We are pleased to inform you that you have been SHORTLISTED for the position of ${role} at ${company}.\n\nOur team will reach out shortly with further details regarding the next steps in the selection process.\n\nBest of luck!\nPlacement Team`
  },
  SELECTED: {
    subject: (company, role) => `🎊 Congratulations! You've been Selected for ${role} at ${company}`,
    body: (name, company, role) =>
      `Dear ${name},\n\nWe are thrilled to inform you that you have been SELECTED for the position of ${role} at ${company}!\n\nThis is a huge achievement. The HR team will contact you soon with your offer letter and onboarding details.\n\nCongratulations once again!\nPlacement Team`
  },
  REJECTED: {
    subject: (company, role) => `Update on your application for ${role} at ${company}`,
    body: (name, company, role) =>
      `Dear ${name},\n\nThank you for your interest in the ${role} position at ${company} and for taking the time to go through our selection process.\n\nAfter careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe encourage you to keep applying and wish you all the best in your career journey.\n\nWarm regards,\nPlacement Team`
  }
};

// POST /notify-api/status-update
notifyapp.post('/status-update', async (req, res) => {
  try {
    const { studentEmail, studentName, company, role, status } = req.body;

    if (!studentEmail || !status) {
      return res.status(400).json({ message: 'studentEmail and status are required' });
    }

    const template = statusMessages[status];
    if (!template) {
      return res.status(400).json({ message: `Unknown status: ${status}` });
    }

    const subject = template.subject(company || 'the company', role || 'the role');
    const text = template.body(studentName || 'Student', company || 'the company', role || 'the role');

    const result = await sendEmail(studentEmail, subject, text);

    if (result.success) {
      res.status(200).json({ message: 'Email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send email', error: result.error });
    }
  } catch (err) {
    console.error('Notification error:', err);
    res.status(500).json({ message: err.message });
  }
});
