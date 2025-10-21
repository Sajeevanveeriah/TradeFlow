/**
 * SMS Service (Twilio)
 * SMS reminders and notifications for Australian numbers
 */

import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+61412345678';

let twilioClient: twilio.Twilio | null = null;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * Format Australian phone number to E.164 format
 * Converts: 0412345678 -> +61412345678
 */
export function formatAustralianPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 04 (mobile) or 0[2-8] (landline), replace 0 with +61
  if (cleaned.startsWith('0')) {
    return `+61${cleaned.substring(1)}`;
  }

  // If already starts with 61, add +
  if (cleaned.startsWith('61')) {
    return `+${cleaned}`;
  }

  // If already in E.164 format
  if (cleaned.startsWith('+61')) {
    return cleaned;
  }

  // Default: assume it's missing country code
  return `+61${cleaned}`;
}

/**
 * Send SMS
 */
export async function sendSMS(params: {
  to: string;
  message: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!twilioClient) {
    console.warn('Twilio not configured, SMS not sent:', params.message);
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const formattedPhone = formatAustralianPhone(params.to);

    const message = await twilioClient.messages.create({
      body: params.message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: unknown) {
    console.error('Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send booking reminder SMS
 */
export async function sendBookingReminderSMS(params: {
  to: string;
  customerName: string;
  bookingTitle: string;
  scheduledStart: Date;
  tradieBusinessName: string;
  tradiePhone: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedDate = params.scheduledStart.toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const message = `Hi ${params.customerName}, this is a reminder about your ${params.bookingTitle} on ${formattedDate}. ${params.tradieBusinessName} will see you then. Questions? Call ${params.tradiePhone}`;

  return sendSMS({
    to: params.to,
    message,
  });
}

/**
 * Send quote notification SMS
 */
export async function sendQuoteNotificationSMS(params: {
  to: string;
  customerName: string;
  quoteNumber: string;
  tradieBusinessName: string;
  quoteLink: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const message = `Hi ${params.customerName}, ${params.tradieBusinessName} has sent you a quote (${params.quoteNumber}). View it here: ${params.quoteLink}`;

  return sendSMS({
    to: params.to,
    message,
  });
}
