// Email template functions for Phase 2 Resend integration
// These return HTML strings ready for transactional email delivery

interface ApplicationData {
  name: string;
  email: string;
  phone: string;
  fitnessGoal: string;
  trainingExperience: string;
  commitmentLevel: string;
}

export function getApplicantConfirmationEmail(data: ApplicationData): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Your Iron Oasis Application",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 20px; }
            .content { margin-bottom: 30px; }
            .footer { font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; padding-top: 20px; }
            .highlight { color: #C9A84C; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Iron Oasis</h1>
            </div>

            <div class="content">
              <p>Hi <strong>${data.name}</strong>,</p>

              <p>Thank you for applying to Iron Oasis. Your application has been received.</p>

              <p>Our team typically reviews applications within <span class="highlight">48 hours</span>.</p>

              <p>In the meantime, here's what to expect:</p>
              <ul>
                <li>We'll review your profile and training goals</li>
                <li>Verify your fit for our community</li>
                <li>Reach out with next steps (onboarding, tour, membership terms)</li>
              </ul>

              <p>Questions? Feel free to reply to this email.</p>

              <p>The Iron Oasis Team</p>
            </div>

            <div class="footer">
              <p>This is an automated message. Please do not reply with sensitive information.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Iron Oasis

Hi ${data.name},

Thank you for applying to Iron Oasis. Your application has been received.

Our team typically reviews applications within 48 hours.

In the meantime, here's what to expect:
- We'll review your profile and training goals
- Verify your fit for our community
- Reach out with next steps (onboarding, tour, membership terms)

Questions? Feel free to reply to this email.

The Iron Oasis Team
    `.trim(),
  };
}

export function getOperatorNotificationEmail(data: ApplicationData): {
  subject: string;
  html: string;
  text: string;
  to: string;
} {
  const operatorEmail = process.env.OPERATOR_EMAIL || "ops@ironoasis.com";

  return {
    to: operatorEmail,
    subject: `New Application: ${data.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 20px; }
            .application-info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .info-row { display: flex; margin-bottom: 10px; }
            .info-label { font-weight: bold; width: 150px; color: #666; }
            .info-value { flex: 1; }
            .action-buttons { display: flex; gap: 10px; margin-top: 20px; }
            .btn { display: inline-block; padding: 10px 20px; background: #C9A84C; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; }
            .footer { font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Application Received</h1>
            </div>

            <div class="application-info">
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${data.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value"><a href="mailto:${data.email}">${data.email}</a></span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value"><a href="tel:${data.phone}">${data.phone}</a></span>
              </div>
              <div class="info-row">
                <span class="info-label">Fitness Goal:</span>
                <span class="info-value">${data.fitnessGoal}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Experience:</span>
                <span class="info-value">${data.trainingExperience}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Commitment:</span>
                <span class="info-value">${data.commitmentLevel}</span>
              </div>
            </div>

            <div class="action-buttons">
              <a href="mailto:${data.email}" class="btn">Contact Applicant</a>
            </div>

            <div class="footer">
              <p><strong>Next Steps:</strong> Review this application and reach out to the applicant within 48 hours.</p>
              <p>Operator Dashboard coming in Phase 3.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Application Received

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Fitness Goal: ${data.fitnessGoal}
Experience: ${data.trainingExperience}
Commitment: ${data.commitmentLevel}

Next Steps:
Review this application and reach out to the applicant within 48 hours.

Contact: ${data.email} or ${data.phone}

Operator Dashboard coming in Phase 3.
    `.trim(),
  };
}
