/**
 * API Response Helpers
 * Standardized API response format
 */

import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Success response
 */
export function successResponse<T>(data: T, meta?: ApiResponse['meta']): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status: 200 }
  );
}

/**
 * Created response (201)
 */
export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 201 }
  );
}

/**
 * No content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    },
    { status }
  );
}

/**
 * Bad request response (400)
 */
export function badRequestResponse(message: string = 'Bad request', details?: unknown): NextResponse<ApiResponse> {
  return errorResponse(message, 400, 'BAD_REQUEST', details);
}

/**
 * Unauthorized response (401)
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

/**
 * Forbidden response (403)
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse(message, 403, 'FORBIDDEN');
}

/**
 * Not found response (404)
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiResponse> {
  return errorResponse(message, 404, 'NOT_FOUND');
}

/**
 * Conflict response (409)
 */
export function conflictResponse(message: string = 'Resource already exists'): NextResponse<ApiResponse> {
  return errorResponse(message, 409, 'CONFLICT');
}

/**
 * Rate limit response (429)
 */
export function rateLimitResponse(message: string = 'Too many requests'): NextResponse<ApiResponse> {
  return errorResponse(message, 429, 'RATE_LIMIT_EXCEEDED');
}

/**
 * Internal server error response (500)
 */
export function internalErrorResponse(message: string = 'Internal server error'): NextResponse<ApiResponse> {
  return errorResponse(message, 500, 'INTERNAL_ERROR');
}

/**
 * Validation error response
 */
export function validationErrorResponse(details: unknown): NextResponse<ApiResponse> {
  return errorResponse('Validation failed', 422, 'VALIDATION_ERROR', details);
}
