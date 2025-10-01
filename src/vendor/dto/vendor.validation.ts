import { z } from 'zod';
import { VerificationMethod } from '../../entities/vendor-claim.entity';

// Enum schemas
export const VerificationMethodSchema = z.enum(VerificationMethod);

// Vendor claim schemas
export const CreateVendorClaimSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: z.email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number too long'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  companyEmail: z.email('Invalid company email format'),
  verificationMethod: VerificationMethodSchema,
  message: z.string().max(1000, 'Message too long').optional(),
});

export const DecideVendorClaimSchema = z.object({
  approve: z.boolean(),
  rejectionReason: z.string().max(500, 'Rejection reason too long').optional(),
});

// Vendor search schema
export const VendorSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  size: z.string().optional(),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
});

// Rating schema
export const CreateRatingSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(1000, 'Comment too long').optional(),
  bankId: z.number().int().positive('Bank ID must be positive'),
});

// Vendor update schema
export const UpdateVendorSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200, 'Company name too long').optional(),
  website: z.url('Invalid website URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

// Parameter validation schemas
export const VendorIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid vendor ID'),
});

export const ClaimIdParamSchema = z.object({
  claimId: z.coerce.number().int().positive('Invalid claim ID'),
});

export const ResearchIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid vendor ID'),
  researchId: z.coerce.number().int().positive('Invalid research ID'),
});

// Type exports for TypeScript
export type CreateVendorClaimDto = z.infer<typeof CreateVendorClaimSchema>;
export type DecideVendorClaimDto = z.infer<typeof DecideVendorClaimSchema>;
export type VendorSearchDto = z.infer<typeof VendorSearchSchema>;
export type CreateRatingDto = z.infer<typeof CreateRatingSchema>;
export type UpdateVendorDto = z.infer<typeof UpdateVendorSchema>;
export type VendorIdParam = z.infer<typeof VendorIdParamSchema>;
export type ClaimIdParam = z.infer<typeof ClaimIdParamSchema>;
export type ResearchIdParam = z.infer<typeof ResearchIdParamSchema>;
