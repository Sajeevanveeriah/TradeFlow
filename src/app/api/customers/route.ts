/**
 * Customers API
 * GET /api/customers - List all customers
 * POST /api/customers - Create new customer
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { createCustomerSchema } from '@/lib/validations';
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  errorResponse,
} from '@/lib/api-response';

/**
 * GET /api/customers
 * List all customers for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      userId: user.userId,
    };

    // Search by name, email, or phone
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          suburb: true,
          city: true,
          state: true,
          postcode: true,
          notes: true,
          propertyType: true,
          preferredContact: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          lastContactedAt: true,
          _count: {
            select: {
              bookings: true,
              quotes: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return successResponse(
      { customers },
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    console.error('Get customers error:', error);
    return errorResponse('Failed to fetch customers', 500);
  }
}

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createCustomerSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const data = validation.data;

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        userId: user.userId,
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        suburb: data.suburb,
        city: data.city,
        state: data.state,
        postcode: data.postcode,
        notes: data.notes,
        propertyType: data.propertyType,
        preferredContact: data.preferredContact,
        tags: data.tags || [],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        suburb: true,
        city: true,
        state: true,
        postcode: true,
        notes: true,
        propertyType: true,
        preferredContact: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createdResponse({ customer });
  } catch (error) {
    console.error('Create customer error:', error);
    return errorResponse('Failed to create customer', 500);
  }
}
