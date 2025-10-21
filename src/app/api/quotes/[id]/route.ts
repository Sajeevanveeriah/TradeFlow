/**
 * Quote by ID API
 * GET /api/quotes/[id] - Get quote details
 * PATCH /api/quotes/[id] - Update quote
 * DELETE /api/quotes/[id] - Delete quote
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { updateQuoteSchema } from '@/lib/validations';
import { calculateGST } from '@/lib/utils';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  errorResponse,
  noContentResponse,
} from '@/lib/api-response';

/**
 * GET /api/quotes/[id]
 * Get quote details
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      include: {
        customer: true,
        booking: true,
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentType: true,
            paidAt: true,
          },
        },
      },
    });

    if (!quote) {
      return notFoundResponse('Quote not found');
    }

    return successResponse({ quote });
  } catch (error) {
    console.error('Get quote error:', error);
    return errorResponse('Failed to fetch quote', 500);
  }
}

/**
 * PATCH /api/quotes/[id]
 * Update quote
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Check if quote exists and belongs to user
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!existingQuote) {
      return notFoundResponse('Quote not found');
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateQuoteSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const data = validation.data;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.terms !== undefined) updateData.terms = data.terms;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.validUntil) updateData.validUntil = new Date(data.validUntil);

    // Recalculate totals if line items changed
    if (data.lineItems) {
      const subtotal = data.lineItems.reduce((sum, item) => sum + item.total, 0);
      const discountAmount = data.discountAmount || existingQuote.discountAmount;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const gstCalculation = calculateGST(subtotalAfterDiscount);

      updateData.lineItems = data.lineItems;
      updateData.subtotal = subtotalAfterDiscount;
      updateData.taxAmount = gstCalculation.gst;
      updateData.total = gstCalculation.total;
      updateData.discountAmount = discountAmount;

      // Recalculate deposit if percentage exists
      if (data.depositPercentage || existingQuote.depositPercentage) {
        const depositPercentage = data.depositPercentage || existingQuote.depositPercentage || 0;
        updateData.depositAmount = Math.round((gstCalculation.total * depositPercentage) / 100);
        updateData.depositPercentage = depositPercentage;
      }
    } else if (data.discountAmount !== undefined) {
      // Just discount changed
      const subtotalAfterDiscount = existingQuote.subtotal - data.discountAmount;
      const gstCalculation = calculateGST(subtotalAfterDiscount);

      updateData.subtotal = subtotalAfterDiscount;
      updateData.taxAmount = gstCalculation.gst;
      updateData.total = gstCalculation.total;
      updateData.discountAmount = data.discountAmount;
    }

    // Update quote
    const quote = await prisma.quote.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
      },
    });

    return successResponse({ quote });
  } catch (error) {
    console.error('Update quote error:', error);
    return errorResponse('Failed to update quote', 500);
  }
}

/**
 * DELETE /api/quotes/[id]
 * Delete quote
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Check if quote exists and belongs to user
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!existingQuote) {
      return notFoundResponse('Quote not found');
    }

    // Delete quote
    await prisma.quote.delete({
      where: { id: params.id },
    });

    return noContentResponse();
  } catch (error) {
    console.error('Delete quote error:', error);
    return errorResponse('Failed to delete quote', 500);
  }
}
