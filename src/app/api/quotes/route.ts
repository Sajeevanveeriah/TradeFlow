/**
 * Quotes API
 * GET /api/quotes - List all quotes
 * POST /api/quotes - Create new quote
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { createQuoteSchema } from '@/lib/validations';
import { generateQuoteNumber, calculateGST } from '@/lib/utils';
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  errorResponse,
  badRequestResponse,
} from '@/lib/api-response';

/**
 * GET /api/quotes
 * List all quotes with filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      userId: user.userId,
    };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    // Get quotes
    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          booking: {
            select: {
              id: true,
              title: true,
              scheduledStart: true,
            },
          },
        },
      }),
      prisma.quote.count({ where }),
    ]);

    return successResponse(
      { quotes },
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    console.error('Get quotes error:', error);
    return errorResponse('Failed to fetch quotes', 500);
  }
}

/**
 * POST /api/quotes
 * Create a new quote
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createQuoteSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const data = validation.data;

    // Verify customer belongs to user
    const customer = await prisma.customer.findFirst({
      where: {
        id: data.customerId,
        userId: user.userId,
      },
    });

    if (!customer) {
      return badRequestResponse('Customer not found or does not belong to you');
    }

    // If bookingId provided, verify it belongs to user
    if (data.bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: data.bookingId,
          userId: user.userId,
        },
      });

      if (!booking) {
        return badRequestResponse('Booking not found or does not belong to you');
      }
    }

    // Calculate totals
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = data.discountAmount || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;

    // Calculate GST (10% for Australia)
    const gstCalculation = calculateGST(subtotalAfterDiscount);

    // Generate quote number
    const quoteCount = await prisma.quote.count({
      where: { userId: user.userId },
    });
    const quoteNumber = generateQuoteNumber(quoteCount + 1);

    // Calculate deposit if percentage provided
    let depositAmount = null;
    if (data.depositPercentage) {
      depositAmount = Math.round((gstCalculation.total * data.depositPercentage) / 100);
    }

    // Set valid until date (30 days from now if not provided)
    const validUntil = data.validUntil ? new Date(data.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        userId: user.userId,
        customerId: data.customerId,
        bookingId: data.bookingId,
        quoteNumber,
        title: data.title,
        description: data.description,
        lineItems: data.lineItems,
        subtotal: subtotalAfterDiscount,
        taxRate: 10.0,
        taxAmount: gstCalculation.gst,
        discountAmount,
        total: gstCalculation.total,
        status: 'DRAFT',
        validUntil,
        terms: data.terms,
        notes: data.notes,
        depositPercentage: data.depositPercentage,
        depositAmount,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return createdResponse({ quote });
  } catch (error) {
    console.error('Create quote error:', error);
    return errorResponse('Failed to create quote', 500);
  }
}
