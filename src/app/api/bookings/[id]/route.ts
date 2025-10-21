/**
 * Booking by ID API
 * GET /api/bookings/[id] - Get booking details
 * PATCH /api/bookings/[id] - Update booking
 * DELETE /api/bookings/[id] - Cancel booking
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { updateBookingSchema } from '@/lib/validations';
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  errorResponse,
  noContentResponse,
  badRequestResponse,
} from '@/lib/api-response';

/**
 * GET /api/bookings/[id]
 * Get booking details
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      include: {
        customer: true,
        assignedTo: true,
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            total: true,
            status: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentType: true,
            paidAt: true,
          },
        },
        reminders: {
          select: {
            id: true,
            reminderType: true,
            scheduledFor: true,
            status: true,
            sentAt: true,
          },
        },
      },
    });

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    return successResponse({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return errorResponse('Failed to fetch booking', 500);
  }
}

/**
 * PATCH /api/bookings/[id]
 * Update booking
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Check if booking exists and belongs to user
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!existingBooking) {
      return notFoundResponse('Booking not found');
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateBookingSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const data = validation.data;

    // Check for conflicts if time is being changed
    if (data.scheduledStart || data.scheduledEnd) {
      const newStart = data.scheduledStart ? new Date(data.scheduledStart) : existingBooking.scheduledStart;
      const newEnd = data.scheduledEnd ? new Date(data.scheduledEnd) : existingBooking.scheduledEnd;

      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          id: { not: params.id },
          userId: user.userId,
          status: {
            not: 'CANCELLED',
          },
          OR: [
            {
              AND: [{ scheduledStart: { lte: newStart } }, { scheduledEnd: { gt: newStart } }],
            },
            {
              AND: [{ scheduledStart: { lt: newEnd } }, { scheduledEnd: { gte: newEnd } }],
            },
            {
              AND: [{ scheduledStart: { gte: newStart } }, { scheduledEnd: { lte: newEnd } }],
            },
          ],
        },
      });

      if (conflictingBooking) {
        return badRequestResponse('Booking conflicts with an existing booking');
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.jobType !== undefined) updateData.jobType = data.jobType;
    if (data.scheduledStart) updateData.scheduledStart = new Date(data.scheduledStart);
    if (data.scheduledEnd) updateData.scheduledEnd = new Date(data.scheduledEnd);
    if (data.allDay !== undefined) updateData.allDay = data.allDay;
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'COMPLETED') {
        updateData.completedAt = new Date();
        updateData.actualEnd = new Date();
      }
      if (data.status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = data.cancellationReason;
      }
      if (data.status === 'IN_PROGRESS') {
        updateData.actualStart = new Date();
      }
    }
    if (data.address !== undefined) updateData.address = data.address;
    if (data.suburb !== undefined) updateData.suburb = data.suburb;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.postcode !== undefined) updateData.postcode = data.postcode;
    if (data.estimatedCost !== undefined) updateData.estimatedCost = data.estimatedCost;
    if (data.actualCost !== undefined) updateData.actualCost = data.actualCost;
    if (data.materialsNeeded !== undefined) updateData.materialsNeeded = data.materialsNeeded;
    if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
    if (data.customerNotes !== undefined) updateData.customerNotes = data.customerNotes;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    if (data.depositAmount !== undefined) updateData.depositAmount = data.depositAmount;
    if (data.depositPaid !== undefined) updateData.depositPaid = data.depositPaid;

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        assignedTo: true,
      },
    });

    return successResponse({ booking });
  } catch (error) {
    console.error('Update booking error:', error);
    return errorResponse('Failed to update booking', 500);
  }
}

/**
 * DELETE /api/bookings/[id]
 * Cancel booking (soft delete by setting status to CANCELLED)
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Check if booking exists and belongs to user
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!existingBooking) {
      return notFoundResponse('Booking not found');
    }

    // Soft delete - update status to CANCELLED
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    // Cancel any pending reminders
    await prisma.reminder.updateMany({
      where: {
        bookingId: params.id,
        status: 'SCHEDULED',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return noContentResponse();
  } catch (error) {
    console.error('Delete booking error:', error);
    return errorResponse('Failed to cancel booking', 500);
  }
}
