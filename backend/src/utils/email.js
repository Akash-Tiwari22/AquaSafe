import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Email templates
const templates = {
  emailVerification: (data) => ({
    subject: 'Verify your AquaSafe account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your AquaSafe account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4A90E2, #0099CC); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌊 AquaSafe</h1>
            <p>Water Quality Monitoring Dashboard</p>
          </div>
          <div class="content">
            <h2>Welcome to AquaSafe, ${data.name}!</h2>
            <p>Thank you for registering with AquaSafe. To complete your account setup, please verify your email address by clicking the button below:</p>
            <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">${data.verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with AquaSafe, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 AquaSafe. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Reset your AquaSafe password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your AquaSafe password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4A90E2, #0099CC); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌊 AquaSafe</h1>
            <p>Water Quality Monitoring Dashboard</p>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${data.name},</p>
            <p>We received a request to reset your password for your AquaSafe account. Click the button below to reset your password:</p>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">${data.resetUrl}</p>
            <div class="warning">
              <strong>Security Notice:</strong> This password reset link will expire in 10 minutes for your security. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>© 2024 AquaSafe. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  welcome: (data) => ({
    subject: 'Welcome to AquaSafe!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AquaSafe</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4A90E2, #0099CC); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #4A90E2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌊 AquaSafe</h1>
            <p>Water Quality Monitoring Dashboard</p>
          </div>
          <div class="content">
            <h2>Welcome to AquaSafe, ${data.name}!</h2>
            <p>Your account has been successfully verified and you're ready to start monitoring water quality with AquaSafe.</p>
            
            <h3>What you can do with AquaSafe:</h3>
            <div class="feature">
              <strong>📊 Upload & Analyze Data</strong><br>
              Upload your water quality data in CSV or Excel format and get instant analysis.
            </div>
            <div class="feature">
              <strong>🔍 Real-time Monitoring</strong><br>
              Monitor water quality parameters and get alerts for any issues.
            </div>
            <div class="feature">
              <strong>📈 Generate Reports</strong><br>
              Create comprehensive reports and export them in various formats.
            </div>
            <div class="feature">
              <strong>🔮 Predictive Analytics</strong><br>
              Get insights into future water quality trends using our AI models.
            </div>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
            
            <p>If you have any questions or need help getting started, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 AquaSafe. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  dataProcessed: (data) => ({
    subject: 'Your water quality data has been processed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Data Processing Complete</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4A90E2, #0099CC); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .status { padding: 15px; border-radius: 4px; margin: 20px 0; }
          .status.success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
          .status.warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
          .status.danger { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌊 AquaSafe</h1>
            <p>Water Quality Monitoring Dashboard</p>
          </div>
          <div class="content">
            <h2>Data Processing Complete</h2>
            <p>Hello ${data.name},</p>
            <p>Your water quality data file "${data.fileName}" has been successfully processed.</p>
            
            <div class="status ${data.status === 'safe' ? 'success' : data.status === 'unsafe' ? 'warning' : 'danger'}">
              <strong>Overall Status: ${data.status.toUpperCase()}</strong><br>
              HMPI Score: ${data.hmpi.toFixed(2)}<br>
              Sample Count: ${data.sampleCount}
            </div>
            
            <p>You can now view detailed analysis, generate reports, and explore insights in your dashboard.</p>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Analysis</a>
            
            <p>Key findings from your data:</p>
            <ul>
              ${data.findings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 AquaSafe. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  alert: (data) => ({
    subject: 'Water Quality Alert - AquaSafe',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Water Quality Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4A90E2, #0099CC); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .alert { padding: 20px; border-radius: 4px; margin: 20px 0; }
          .alert.critical { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
          .alert.warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 AquaSafe Alert</h1>
            <p>Water Quality Monitoring Dashboard</p>
          </div>
          <div class="content">
            <h2>Water Quality Alert</h2>
            <p>Hello ${data.name},</p>
            <p>We've detected a water quality issue that requires your attention.</p>
            
            <div class="alert ${data.severity}">
              <strong>Alert Level: ${data.severity.toUpperCase()}</strong><br>
              <strong>Location:</strong> ${data.location}<br>
              <strong>Parameter:</strong> ${data.parameter}<br>
              <strong>Value:</strong> ${data.value} ${data.unit}<br>
              <strong>Standard:</strong> ${data.standard} ${data.unit}<br>
              <strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}
            </div>
            
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Recommended Action:</strong> ${data.recommendation}</p>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Details</a>
          </div>
          <div class="footer">
            <p>© 2024 AquaSafe. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    // Get template if template name is provided
    let emailOptions = { ...options };
    if (options.template && templates[options.template]) {
      const template = templates[options.template](options.data || {});
      emailOptions.subject = template.subject;
      emailOptions.html = template.html;
    }
    
    // Set default from address
    if (!emailOptions.from) {
      emailOptions.from = `"${process.env.FROM_NAME || 'AquaSafe'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`;
    }
    
    const result = await transporter.sendMail(emailOptions);
    
    logger.info('Email sent successfully', {
      to: emailOptions.to,
      subject: emailOptions.subject,
      messageId: result.messageId
    });
    
    return result;
  } catch (error) {
    logger.error('Email sending failed', {
      to: options.to,
      subject: options.subject,
      error: error.message
    });
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmail = async (recipients, options) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        ...options,
        to: recipient.email,
        data: { ...options.data, name: recipient.name }
      });
      results.push({ recipient, success: true, result });
    } catch (error) {
      results.push({ recipient, success: false, error: error.message });
    }
  }
  
  return results;
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration is valid');
    return true;
  } catch (error) {
    logger.error('Email configuration test failed', { error: error.message });
    return false;
  }
};

export default { sendEmail, sendBulkEmail, testEmailConfig, templates };
