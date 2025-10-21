/**
 * POST /api/auth/logout
 * Logout (client-side token removal)
 */

import { successResponse } from '@/lib/api-response';

export async function POST() {
  // With JWT, logout is handled client-side by removing the token
  // This endpoint is mainly for consistency and future enhancements
  return successResponse({ message: 'Logged out successfully' });
}
