import nodemailer from "nodemailer";

// Configure nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS, // Your email password or app password
    },
  });
};

// Send attendance threshold exceeded notification
export async function sendAttendanceThresholdNotification(thresholdData) {
  const { employeeType, subType, organization, currentCount, threshold, date } = thresholdData;

  const transporter = createTransporter();

  const subject = `⚠️ Attendance Threshold Exceeded Alert - ${employeeType}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚨 Threshold Exceeded Alert</h1>
        <p>Employee Count Limit Reached</p>
      </div>

      <div class="content">
        <div class="alert">
          <h3 style="color: #856404; margin: 0;">⚠️ Action Required</h3>
          <p>The attendance count for <strong>${employeeType}${subType ? ` (${subType})` : ''}</strong> has exceeded the configured threshold.</p>
        </div>

        <div class="details">
          <h3>Details:</h3>
          <ul>
            <li><strong>Employee Type:</strong> ${employeeType}</li>
            ${subType ? `<li><strong>Sub-Type:</strong> ${subType}</li>` : ''}
            <li><strong>Organization:</strong> ${organization}</li>
            <li><strong>Current Count:</strong> ${currentCount}</li>
            <li><strong>Threshold Limit:</strong> ${threshold}</li>
            <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            <li><strong>Exceeded By:</strong> ${currentCount - threshold} employees</li>
          </ul>
        </div>

        <p>Please review the attendance records and take necessary actions to manage the workforce capacity.</p>
      </div>

      <div class="footer">
        <p>This is an automated notification from the Payroll Management System.</p>
        <p>Generated at ${new Date().toLocaleTimeString()}</p>
      </div>
    </body>
    </html>
  `;

  const recipientEmail = process.env.ATTENDANCE_THRESHOLD_EMAIL || process.env.SMTP_USER;

  const mailOptions = {
    from: `"Payroll System" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Attendance threshold notification sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send attendance threshold notification:", error);
    throw error;
  }
}

// Send document reminder notification
export async function sendDocumentReminderNotification(reminderData) {
  const { employee, missingDocuments, reminderDays } = reminderData;

  const transporter = createTransporter();

  const subject = `📄 Document Reminder - ${employee.personalDetails.firstName} ${employee.personalDetails.lastName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .reminder { background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .employee-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .document-list { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 Document Submission Reminder</h1>
        <p>Pending Documents Notice</p>
      </div>

      <div class="content">
        <div class="reminder">
          <h3 style="color: #0c5460; margin: 0;">⏰ Reminder</h3>
          <p>The following employee has missing required documents. This is a reminder sent after ${reminderDays} days of registration.</p>
        </div>

        <div class="employee-details">
          <h3>Employee Information:</h3>
          <ul>
            <li><strong>Employee ID:</strong> ${employee.employeeId}</li>
            <li><strong>Name:</strong> ${employee.personalDetails.firstName} ${employee.personalDetails.lastName}</li>
            <li><strong>Email:</strong> ${employee.personalDetails.email}</li>
            <li><strong>Phone:</strong> ${employee.personalDetails.phone}</li>
            <li><strong>Date of Joining:</strong> ${new Date(employee.personalDetails.dateOfJoining).toLocaleDateString()}</li>
            <li><strong>Department:</strong> ${employee.jobDetails?.department || 'N/A'}</li>
            <li><strong>Organization:</strong> ${employee.jobDetails?.organizationId?.name || employee.jobDetails?.organization || 'N/A'}</li>
          </ul>
        </div>

        <div class="document-list">
          <h3>Missing Documents:</h3>
          <ul>
            ${missingDocuments.map(doc => `<li><strong>${doc.documentType}</strong></li>`).join('')}
          </ul>
        </div>

        <p>Please ensure that all required documents are submitted as soon as possible to complete the employee's profile and comply with company policies.</p>

        <p>If you have already submitted these documents, please disregard this reminder.</p>
      </div>

      <div class="footer">
        <p>This is an automated reminder from the Payroll Management System.</p>
        <p>Generated at ${new Date().toLocaleTimeString()}</p>
      </div>
    </body>
    </html>
  `;

  const recipientEmail = process.env.DOCUMENT_REMINDER_EMAIL || employee.personalDetails.email || process.env.SMTP_USER;

  const mailOptions = {
    from: `"Payroll System" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Document reminder notification sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send document reminder notification:", error);
    throw error;
  }
}