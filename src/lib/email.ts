/**
 * Email Service (SendGrid)
 * Transactional emails and notifications
 */

import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'hello@tradeflow.com.au';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'TradeFlow';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email
 */
export async function sendEmail(params: EmailParams): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid not configured, email not sent:', params.subject);
    return;
  }

  try {
    await sgMail.send({
      to: params.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: params.subject,
      html: params.html,
      text: params.text || params.html.replace(/<[^>]*>/g, ''),
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send booking reminder email
 */
export async function sendBookingReminderEmail(params: {
  to: string;
  customerName: string;
  bookingTitle: string;
  scheduledStart: Date;
  tradieBusinessName: string;
  tradiePhone: string;
}): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${params.customerName},</p>
            <p>This is a reminder about your upcoming appointment:</p>
            <p><strong>${params.bookingTitle}</strong></p>
            <p><strong>Date & Time:</strong> ${params.scheduledStart.toLocaleString('en-AU', {
              timeZone: 'Australia/Sydney',
              dateStyle: 'full',
              timeStyle: 'short'
            })}</p>
            <p>Your tradie from <strong>${params.tradieBusinessName}</strong> will be there on time.</p>
            <p>If you need to reschedule or have questions, please contact us at ${params.tradiePhone}.</p>
          </div>
          <div class="footer">
            <p>Powered by TradeFlow - Smart Scheduling for Tradies</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: params.to,
    subject: `Reminder: ${params.bookingTitle}`,
    html,
  });
}

/**
 * Send quote email
 */
export async function sendQuoteEmail(params: {
  to: string;
  customerName: string;
  quoteNumber: string;
  total: number;
  tradieBusinessName: string;
  quoteLink: string;
}): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Quote is Ready</h1>
          </div>
          <div class="content">
            <p>Hi ${params.customerName},</p>
            <p>${params.tradieBusinessName} has prepared a quote for you:</p>
            <p><strong>Quote Number:</strong> ${params.quoteNumber}</p>
            <p><strong>Total:</strong> $${(params.total / 100).toFixed(2)} AUD (inc. GST)</p>
            <p style="text-align: center;">
              <a href="${params.quoteLink}" class="button">View Quote</a>
            </p>
            <p>This quote is valid for 30 days. If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>Powered by TradeFlow - Smart Scheduling for Tradies</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: params.to,
    subject: `Quote ${params.quoteNumber} from ${params.tradieBusinessName}`,
    html,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  trialDays: number;
}): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to TradeFlow!</h1>
          </div>
          <div class="content">
            <p>Hi ${params.name},</p>
            <p>Thanks for signing up! Your ${params.trialDays}-day free trial has started.</p>
            <p>Here's what you can do with TradeFlow:</p>
            <ul>
              <li>Schedule and manage bookings with ease</li>
              <li>Send automatic SMS and email reminders</li>
              <li>Create professional quotes</li>
              <li>Track customers and job history</li>
              <li>Accept payments online</li>
            </ul>
            <p>Get started by creating your first booking!</p>
          </div>
          <div class="footer">
            <p>Questions? Reply to this email - we're here to help!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: params.to,
    subject: 'Welcome to TradeFlow - Your trial has started!',
    html,
  });
}
