/**
 * Customer by ID API
 * GET /api/customers/[id] - Get customer details
 * PATCH /api/customers/[id] - Update customer
 * DELETE /api/customers/[id] - Delete customer
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { updateCustomerSchema } from '@/lib/validations';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  errorResponse,
  noContentResponse,
} from '@/lib/api-response';

/**
 * GET /api/customers/[id]
 * Get customer details with booking history
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      include: {
        bookings: {
          orderBy: { scheduledStart: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            scheduledStart: true,
            scheduledEnd: true,
            status: true,
            estimatedCost: true,
            actualCost: true,
          },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            quoteNumber: true,
            title: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      return notFoundResponse('Customer not found');
    }

    return successResponse({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    return errorResponse('Failed to fetch customer', 500);
  }
}

/**
 * PATCH /api/customers/[id]
 * Update customer
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Check if customer exists and belongs to user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!existingCustomer) {
      return notFoundResponse('Customer not found');
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateCustomerSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const data = validation.data;

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.suburb !== undefined && { suburb: data.suburb }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.postcode !== undefined && { postcode: data.postcode }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.propertyType !== undefined && { propertyType: data.propertyType }),
        ...(data.preferredContact && { preferredContact: data.preferredContact }),
        ...(data.tags && { tags: data.tags }),
        lastContactedAt: new Date(),
      },
    });

    return successResponse({ customer });
  } catch (error) {
    console.error('Update customer error:', error);
    return errorResponse('Failed to update customer', 500);
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete customer (and cascade delete bookings, quotes)
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Check if customer exists and belongs to user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!existingCustomer) {
      return notFoundResponse('Customer not found');
    }

    // Delete customer (cascades to bookings and quotes)
    await prisma.customer.delete({
      where: { id: params.id },
    });

    return noContentResponse();
  } catch (error) {
    console.error('Delete customer error:', error);
    return errorResponse('Failed to delete customer', 500);
  }
}
