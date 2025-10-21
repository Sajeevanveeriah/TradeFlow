/**
 * POST /api/quotes/[id]/send
 * Send quote to customer via email/SMS
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse } from '@/lib/api-response';
import { sendQuoteEmail } from '@/lib/email';
import { sendQuoteNotificationSMS } from '@/lib/sms';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Get quote with customer details
    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      include: {
        customer: true,
        user: {
          select: {
            businessName: true,
            email: true,
          },
        },
      },
    });

    if (!quote) {
      return notFoundResponse('Quote not found');
    }

    // Get send options from request
    const body = await request.json();
    const sendEmail = body.sendEmail !== false; // Default true
    const sendSMS = body.sendSMS !== false; // Default true

    const quoteLink = `${process.env.NEXT_PUBLIC_APP_URL}/quotes/${quote.id}/view`;

    // Send email
    if (sendEmail && quote.customer.email) {
      await sendQuoteEmail({
        to: quote.customer.email,
        customerName: quote.customer.name,
        quoteNumber: quote.quoteNumber,
        total: quote.total,
        tradieBusinessName: quote.user.businessName || 'Your Tradie',
        quoteLink,
      }).catch((error) => {
        console.error('Failed to send quote email:', error);
      });
    }

    // Send SMS
    if (sendSMS && quote.customer.phone) {
      await sendQuoteNotificationSMS({
        to: quote.customer.phone,
        customerName: quote.customer.name,
        quoteNumber: quote.quoteNumber,
        tradieBusinessName: quote.user.businessName || 'Your Tradie',
        quoteLink,
      }).catch((error) => {
        console.error('Failed to send quote SMS:', error);
      });
    }

    // Update quote status
    const updatedQuote = await prisma.quote.update({
      where: { id: params.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return successResponse({
      quote: updatedQuote,
      message: 'Quote sent successfully',
    });
  } catch (error) {
    console.error('Send quote error:', error);
    return errorResponse('Failed to send quote', 500);
  }
}
