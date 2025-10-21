/**
 * Stripe Configuration and Utilities
 * Payment processing for Australian market
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Subscription Price IDs
export const SUBSCRIPTION_PRICES = {
  STARTER: {
    MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
    YEARLY: process.env.STRIPE_PRICE_STARTER_YEARLY || '',
  },
  PROFESSIONAL: {
    MONTHLY: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || '',
    YEARLY: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || '',
  },
  PREMIUM: {
    MONTHLY: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
    YEARLY: process.env.STRIPE_PRICE_PREMIUM_YEARLY || '',
  },
};

// Subscription tier pricing (in AUD cents)
export const SUBSCRIPTION_PRICING = {
  STARTER: {
    MONTHLY: 2900, // $29/month
    YEARLY: 29000, // $290/year (save $58)
  },
  PROFESSIONAL: {
    MONTHLY: 5900, // $59/month
    YEARLY: 59000, // $590/year (save $118)
  },
  PREMIUM: {
    MONTHLY: 9900, // $99/month
    YEARLY: 99000, // $990/year (save $198)
  },
};

/**
 * Create Stripe customer
 */
export async function createStripeCustomer(params: {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email: params.email,
    name: params.name,
    phone: params.phone,
    metadata: params.metadata,
  });
}

/**
 * Create subscription for customer
 */
export async function createSubscription(params: {
  customerId: string;
  priceId: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    trial_period_days: params.trialDays,
    metadata: params.metadata,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });
}

/**
 * Create payment intent for one-time payment
 */
export async function createPaymentIntent(params: {
  amount: number; // in cents
  currency?: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency || 'aud',
    customer: params.customerId,
    description: params.description,
    metadata: params.metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  } else {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Update subscription
 */
export async function updateSubscription(subscriptionId: string, priceId: string): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
