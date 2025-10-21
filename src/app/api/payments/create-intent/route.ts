/**
 * POST /api/payments/create-intent
 * Create Stripe payment intent for one-time payment
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { createPaymentIntent } from '@/lib/stripe';
import { createPaymentIntentSchema } from '@/lib/validations';
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  errorResponse,
  badRequestResponse,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createPaymentIntentSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const { amount, bookingId, quoteId, description } = validation.data;

    // Get user details
    const userDetails = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        stripeCustomerId: true,
        email: true,
        businessName: true,
      },
    });

    if (!userDetails) {
      return badRequestResponse('User not found');
    }

    // Verify booking or quote belongs to user
    let booking = null;
    let quote = null;

    if (bookingId) {
      booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          userId: user.userId,
        },
        include: {
          customer: true,
        },
      });

      if (!booking) {
        return badRequestResponse('Booking not found');
      }
    }

    if (quoteId) {
      quote = await prisma.quote.findFirst({
        where: {
          id: quoteId,
          userId: user.userId,
        },
        include: {
          customer: true,
        },
      });

      if (!quote) {
        return badRequestResponse('Quote not found');
      }
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent({
      amount: Math.round(amount), // Ensure it's in cents
      customerId: userDetails.stripeCustomerId,
      description: description || `Payment for ${userDetails.businessName}`,
      metadata: {
        userId: user.userId,
        ...(bookingId && { bookingId }),
        ...(quoteId && { quoteId }),
      },
    });

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: user.userId,
        bookingId,
        quoteId,
        stripePaymentIntentId: paymentIntent.id,
        amount: Math.round(amount),
        currency: 'AUD',
        status: 'PENDING',
        description,
      },
    });

    return successResponse({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      payment,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    return errorResponse('Failed to create payment intent', 500);
  }
}
