import { z } from 'zod';
import { VerificationMethod } from '../../entities/vendor-claim.entity';
import { nullableString, nullableStringArray } from 'utils/validationHelpers';
import { PricingModel, VendorCategory, VendorSize, VendorStatus, VerificationStatus } from 'src/entities/vendor-profile.entity';

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

// Parameter validation schemas
export const VendorIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid vendor ID'),
});

export const UpdateVendorSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200, 'Company name too long').optional(),
  website: z.union([z.url('Invalid website URL'), z.literal(''), z.null()]).optional(),
  isActive: z.boolean().optional(),

  // Vendor profile fields
  summary: nullableString.optional(),
  detailedDescription: nullableString.optional(),
  category: z.enum(VendorCategory).nullable().optional(),
  size: z.enum(VendorSize).nullable().optional(),
  location: nullableString.optional(),
  founded: nullableString.optional(),
  employees: nullableString.optional(),
  phone: nullableString.optional(),
  email: z.union([z.email('Invalid email format'), z.null()]).optional(),
  logoUrl: z.union([z.url('Invalid logo URL'), z.null()]).optional(),
  pricingModel: z.enum(PricingModel).nullable().optional(),
  priceRange: nullableString.optional(),
  status: z.enum(VendorStatus).nullable().optional(),
  verificationStatus: z.enum(VerificationStatus).nullable().optional(),
  tags: nullableStringArray.optional(),
  features: nullableStringArray.optional(),
  integrations: nullableStringArray.optional(),
  targetCustomers: nullableStringArray.optional(),
  pricingNotes: nullableString.optional(),
  notes: nullableString.optional(),
  searchHintsKeywords: nullableStringArray.optional(),
  complianceCertifications: nullableStringArray.optional(),
  integrationsCoreSupport: nullableStringArray.optional(),
  digitalBankingPartners: nullableStringArray.optional(),
  notableCustomers: nullableStringArray.optional(),
  sourceUrl: z.union([z.url('Invalid source URL'), z.null()]).optional(),
  confidence: z.union([z.number().min(0, 'Confidence must be at least 0').max(1, 'Confidence cannot exceed 1'), z.null()]).optional(),
  lastVerified: z.union([z.iso.datetime(), z.date(), z.null()]).optional(),
});


// Type exports for TypeScript
export type CreateVendorClaimDto = z.infer<typeof CreateVendorClaimSchema>;
export type VendorIdParam = z.infer<typeof VendorIdParamSchema>;
export type UpdateVendorDto = z.infer<typeof UpdateVendorSchema>;
