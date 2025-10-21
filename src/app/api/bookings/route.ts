/**
 * Bookings API
 * GET /api/bookings - List all bookings with filters
 * POST /api/bookings - Create new booking
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { createBookingSchema } from '@/lib/validations';
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  errorResponse,
  badRequestResponse,
} from '@/lib/api-response';
import { sendBookingReminderEmail } from '@/lib/email';
import { sendBookingReminderSMS } from '@/lib/sms';

/**
 * GET /api/bookings
 * List all bookings with filters (calendar view, status, date range)
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
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

    // Date range filter
    if (startDate && endDate) {
      where.scheduledStart = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get bookings
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { scheduledStart: 'asc' },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              address: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return successResponse(
      { bookings },
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    console.error('Get bookings error:', error);
    return errorResponse('Failed to fetch bookings', 500);
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);

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

    // Check for scheduling conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        userId: user.userId,
        status: {
          not: 'CANCELLED',
        },
        OR: [
          {
            // New booking starts during existing booking
            AND: [
              { scheduledStart: { lte: new Date(data.scheduledStart) } },
              { scheduledEnd: { gt: new Date(data.scheduledStart) } },
            ],
          },
          {
            // New booking ends during existing booking
            AND: [
              { scheduledStart: { lt: new Date(data.scheduledEnd) } },
              { scheduledEnd: { gte: new Date(data.scheduledEnd) } },
            ],
          },
          {
            // New booking completely contains existing booking
            AND: [
              { scheduledStart: { gte: new Date(data.scheduledStart) } },
              { scheduledEnd: { lte: new Date(data.scheduledEnd) } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return badRequestResponse('Booking conflicts with an existing booking. Please choose a different time.');
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.userId,
        customerId: data.customerId,
        title: data.title,
        description: data.description,
        jobType: data.jobType,
        scheduledStart: new Date(data.scheduledStart),
        scheduledEnd: new Date(data.scheduledEnd),
        allDay: data.allDay || false,
        address: data.address || customer.address,
        suburb: data.suburb || customer.suburb,
        city: data.city || customer.city,
        state: data.state || customer.state,
        postcode: data.postcode || customer.postcode,
        estimatedCost: data.estimatedCost,
        materialsNeeded: data.materialsNeeded,
        internalNotes: data.internalNotes,
        customerNotes: data.customerNotes,
        priority: data.priority || 'NORMAL',
        status: 'SCHEDULED',
        assignedToId: data.assignedToId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    // Schedule reminder 24 hours before (non-blocking)
    const reminderTime = new Date(booking.scheduledStart);
    reminderTime.setHours(reminderTime.getHours() - 24);

    if (reminderTime > new Date()) {
      prisma.reminder
        .create({
          data: {
            bookingId: booking.id,
            reminderType: customer.email && customer.phone ? 'BOTH' : customer.email ? 'EMAIL' : 'SMS',
            scheduledFor: reminderTime,
            status: 'SCHEDULED',
          },
        })
        .catch((error) => {
          console.error('Failed to create reminder:', error);
        });
    }

    return createdResponse({ booking });
  } catch (error) {
    console.error('Create booking error:', error);
    return errorResponse('Failed to create booking', 500);
  }
}
