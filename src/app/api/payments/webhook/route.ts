/**
 * POST /api/payments/webhook
 * Stripe webhook handler for payment events
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/stripe';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return errorResponse('Missing stripe signature', 400);
    }

    // Verify webhook signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return errorResponse('Invalid signature', 400);
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;

        // Update payment in database
        await prisma.payment.updateMany({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'SUCCEEDED',
            paidAt: new Date(),
            stripeChargeId: paymentIntent.latest_charge as string,
          },
        });

        // If payment was for a booking deposit, mark it as paid
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
          include: { booking: true },
        });

        if (payment?.bookingId && payment.paymentType === 'DEPOSIT') {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { depositPaid: true },
          });
        }

        // If payment was for a quote, mark quote as accepted
        if (payment?.quoteId) {
          await prisma.quote.update({
            where: { id: payment.quoteId },
            data: {
              status: 'ACCEPTED',
              acceptedAt: new Date(),
            },
          });
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;

        await prisma.payment.updateMany({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'FAILED',
            failureReason: paymentIntent.last_payment_error?.message,
          },
        });

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        // Update user subscription status
        await prisma.user.updateMany({
          where: {
            stripeCustomerId: subscription.customer as string,
          },
          data: {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
            subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
          },
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await prisma.user.updateMany({
          where: {
            stripeCustomerId: subscription.customer as string,
          },
          data: {
            subscriptionStatus: 'CANCELLED',
            subscriptionEndsAt: new Date(subscription.ended_at! * 1000),
          },
        });

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;

        // Subscription payment succeeded - ensure user is active
        await prisma.user.updateMany({
          where: {
            stripeCustomerId: invoice.customer as string,
          },
          data: {
            subscriptionStatus: 'ACTIVE',
          },
        });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        // Subscription payment failed - mark as past due
        await prisma.user.updateMany({
          where: {
            stripeCustomerId: invoice.customer as string,
          },
          data: {
            subscriptionStatus: 'PAST_DUE',
          },
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return errorResponse('Webhook handler failed', 500);
  }
}
