import { z } from 'zod';
import { VerificationMethod } from '../../entities/vendor-claim.entity';
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

export const CreateVendorSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200, 'Company name too long'),
  website: z.union([z.url('Invalid website URL'), z.literal('')]).optional(),
  isActive: z.boolean().optional().default(false),

  // Vendor profile fields
  summary: z.string().optional(),
  detailedDescription: z.string().optional(),
  category: z.enum(VendorCategory).optional(),
  size: z.enum(VendorSize).optional(),
  location: z.string().optional(),
  founded: z.string().optional(),
  employees: z.string().optional(),
  phone: z.string().optional(),
  email: z.email('Invalid email format').optional(),
  logoUrl: z.url('Invalid logo URL').optional(),
  pricingModel: z.enum(PricingModel).optional(),
  priceRange: z.string().optional(),
  status: z.enum(VendorStatus).optional().default(VendorStatus.PENDING),
  verificationStatus: z.enum(VerificationStatus).optional().default(VerificationStatus.PENDING),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  targetCustomers: z.array(z.string()).optional(),
  pricingNotes: z.string().optional(),
  notes: z.string().optional(),
  searchHintsKeywords: z.array(z.string()).optional(),
  complianceCertifications: z.array(z.string()).optional(),
  integrationsCoreSupport: z.array(z.string()).optional(),
  digitalBankingPartners: z.array(z.string()).optional(),
  notableCustomers: z.array(z.string()).optional(),
  sourceUrl: z.url('Invalid source URL').optional(),
  confidence: z.number().min(0, 'Confidence must be at least 0').max(1, 'Confidence cannot exceed 1').optional().default(0),
  lastVerified: z.date().optional().nullable(),
});

export const UpdateVendorSchema = CreateVendorSchema;

export const VendorSearchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.enum(VendorCategory).optional(),
  size: z.enum(VendorSize).optional(),
  status: z.enum(VendorStatus).optional(),
  page: z.coerce.number().int().positive('Invalid page number').optional(),
  limit: z.coerce.number().int().positive('Invalid limit').max(100, 'Limit cannot exceed 100').optional(),
});


// Type exports for TypeScript
export type CreateVendorClaimDto = z.infer<typeof CreateVendorClaimSchema>;
export type VendorIdParam = z.infer<typeof VendorIdParamSchema>;
export type UpdateVendorDto = z.infer<typeof UpdateVendorSchema>;
export type VendorSearchParams = z.infer<typeof VendorSearchParamsSchema>;
export type CreateVendorDto = z.infer<typeof CreateVendorSchema>;
