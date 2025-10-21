/**
 * GET /api/auth/me
 * Get current user profile
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const tokenUser = getUserFromRequest(request);

    if (!tokenUser) {
      return unauthorizedResponse('Authentication required');
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        businessName: true,
        tradeType: true,
        abn: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        avatar: true,
        address: true,
        city: true,
        state: true,
        postcode: true,
        timezone: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        workingDays: true,
        emailNotifications: true,
        smsNotifications: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Failed to fetch user data', 500);
  }
}
