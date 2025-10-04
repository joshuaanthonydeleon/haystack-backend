import { z } from 'zod';

export const VendorIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid vendor ID'),
});

export const CreateRatingSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(1000, 'Comment too long').optional(),
  bankId: z.number().int().positive('Bank ID must be positive'),
});

export type VendorIdParam = z.infer<typeof VendorIdParamSchema>;
export type CreateRatingDto = z.infer<typeof CreateRatingSchema>;
