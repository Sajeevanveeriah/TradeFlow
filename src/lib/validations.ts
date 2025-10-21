/**
 * Zod Validation Schemas
 * Input validation for API requests
 */

import { z } from 'zod';

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(2, 'Business name is required').optional(),
  phone: z.string().optional(),
  tradeType: z.string().optional(),
  abn: z.string().length(11, 'ABN must be 11 digits').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  businessName: z.string().min(2).optional(),
  phone: z.string().optional(),
  tradeType: z.string().optional(),
  abn: z.string().length(11).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  workingHoursStart: z.number().min(0).max(23).optional(),
  workingHoursEnd: z.number().min(0).max(23).optional(),
  workingDays: z.array(z.string()).optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});

// ==========================================
// CUSTOMER SCHEMAS
// ==========================================

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  notes: z.string().optional(),
  propertyType: z.string().optional(),
  preferredContact: z.enum(['phone', 'email', 'sms']).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// ==========================================
// BOOKING SCHEMAS
// ==========================================

export const createBookingSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  jobType: z.string().optional(),
  scheduledStart: z.string().datetime('Invalid start date'),
  scheduledEnd: z.string().datetime('Invalid end date'),
  allDay: z.boolean().optional(),
  address: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  estimatedCost: z.number().positive().optional(),
  materialsNeeded: z.string().optional(),
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().uuid().optional(),
}).refine((data) => {
  const start = new Date(data.scheduledStart);
  const end = new Date(data.scheduledEnd);
  return end > start;
}, {
  message: 'End time must be after start time',
  path: ['scheduledEnd'],
});

export const updateBookingSchema = z.object({
  customerId: z.string().uuid().optional(),
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  jobType: z.string().optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  allDay: z.boolean().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'PENDING']).optional(),
  address: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  estimatedCost: z.number().positive().optional(),
  actualCost: z.number().positive().optional(),
  materialsNeeded: z.string().optional(),
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().uuid().optional(),
  depositAmount: z.number().positive().optional(),
  depositPaid: z.boolean().optional(),
  cancellationReason: z.string().optional(),
});

// ==========================================
// QUOTE SCHEMAS
// ==========================================

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  total: z.number().positive('Total must be positive'),
  notes: z.string().optional(),
});

export const createQuoteSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  bookingId: z.string().uuid().optional(),
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  discountAmount: z.number().min(0).optional(),
  validUntil: z.string().datetime().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  depositPercentage: z.number().min(0).max(100).optional(),
});

export const updateQuoteSchema = createQuoteSchema.partial();

export const sendQuoteSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
  sendEmail: z.boolean().optional(),
  sendSMS: z.boolean().optional(),
});

// ==========================================
// PAYMENT SCHEMAS
// ==========================================

export const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  bookingId: z.string().uuid().optional(),
  quoteId: z.string().uuid().optional(),
  description: z.string().optional(),
});

// ==========================================
// SUBSCRIPTION SCHEMAS
// ==========================================

export const updateSubscriptionSchema = z.object({
  tier: z.enum(['STARTER', 'PROFESSIONAL', 'PREMIUM']),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']),
});

// ==========================================
// TEAM MEMBER SCHEMAS (Premium)
// ==========================================

export const createTeamMemberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email().optional(),
  phone: z.string().min(10, 'Phone number is required'),
  role: z.string().optional(),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ==========================================
// FILTERS & QUERY SCHEMAS
// ==========================================

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export const bookingFilterSchema = dateRangeSchema.extend({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'PENDING']).optional(),
  customerId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
}).merge(paginationSchema);

export const customerFilterSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).merge(paginationSchema);

export const quoteFilterSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED']).optional(),
  customerId: z.string().uuid().optional(),
}).merge(paginationSchema);

// ==========================================
// TYPE EXPORTS
// ==========================================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type BookingFilter = z.infer<typeof bookingFilterSchema>;
export type CustomerFilter = z.infer<typeof customerFilterSchema>;
export type QuoteFilter = z.infer<typeof quoteFilterSchema>;
