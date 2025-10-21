/**
 * POST /api/auth/signup
 * Register new tradie account
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { signupSchema } from '@/lib/validations';
import { successResponse, errorResponse, conflictResponse, validationErrorResponse, rateLimitResponse } from '@/lib/api-response';
import { checkRateLimit, AUTH_RATE_LIMIT } from '@/lib/rate-limit';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`signup:${ip}`, AUTH_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return rateLimitResponse('Too many signup attempts. Please try again later.');
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const { email, password, businessName, phone, tradeType, abn } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return conflictResponse('Email already registered');
    }

    // Check if ABN already exists (if provided)
    if (abn) {
      const existingABN = await prisma.user.findUnique({
        where: { abn },
      });

      if (existingABN) {
        return conflictResponse('ABN already registered');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + parseInt(process.env.TRIAL_DAYS || '14'));

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        businessName,
        phone,
        tradeType,
        abn,
        subscriptionTier: 'STARTER',
        subscriptionStatus: 'TRIAL',
        trialEndsAt,
      },
      select: {
        id: true,
        email: true,
        businessName: true,
        phone: true,
        tradeType: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
    });

    // Send welcome email (non-blocking)
    if (user.email) {
      sendWelcomeEmail({
        to: user.email,
        name: user.businessName || 'there',
        trialDays: parseInt(process.env.TRIAL_DAYS || '14'),
      }).catch((error) => {
        console.error('Failed to send welcome email:', error);
      });
    }

    return successResponse({
      user,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Failed to create account', 500);
  }
}
