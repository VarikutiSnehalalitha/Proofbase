import nodemailer from 'nodemailer';
import { config } from '../config';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!config.email.host || !config.email.user) {
    console.warn('[EMAIL] SMTP not configured. Emails will be logged to console.');
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  return transporter;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transport = getTransporter();

  if (!transport) {
    // Log email to console in development
    console.log(`\n📧 [EMAIL] To: ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    console.log(`   Body: ${options.html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
    console.log('');
    return;
  }

  await transport.sendMail({
    from: config.email.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your Proofbase account',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a1a; margin-bottom: 16px;">Welcome to Proofbase</h2>
        <p style="color: #525252; line-height: 1.6;">
          Please verify your email address to activate your account.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: 500;">
          Verify Email
        </a>
        <p style="color: #a3a3a3; font-size: 13px;">
          Or copy this link: ${verifyUrl}
        </p>
        <p style="color: #a3a3a3; font-size: 13px;">
          This link expires in 24 hours.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your Proofbase password',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a1a; margin-bottom: 16px;">Password Reset</h2>
        <p style="color: #525252; line-height: 1.6;">
          You requested a password reset. Click the button below to set a new password.
        </p>
        <a href="${resetUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: 500;">
          Reset Password
        </a>
        <p style="color: #a3a3a3; font-size: 13px;">
          Or copy this link: ${resetUrl}
        </p>
        <p style="color: #a3a3a3; font-size: 13px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendShareNotificationEmail(
  email: string,
  projectName: string,
  sharedByName: string,
  shareUrl: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `${sharedByName} shared a project with you on Proofbase`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a1a; margin-bottom: 16px;">Project Shared With You</h2>
        <p style="color: #525252; line-height: 1.6;">
          <strong>${sharedByName}</strong> has shared the project <strong>"${projectName}"</strong> with you.
        </p>
        <a href="${shareUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; font-weight: 500;">
          View Project
        </a>
      </div>
    `,
  });
}
