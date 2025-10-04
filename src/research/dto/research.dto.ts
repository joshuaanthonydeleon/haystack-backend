import { z } from 'zod';

export const VendorIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid vendor ID'),
});

export const ResearchIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid vendor ID'),
  researchId: z.coerce.number().int().positive('Invalid research ID'),
});

export type VendorIdParam = z.infer<typeof VendorIdParamSchema>;
export type ResearchIdParam = z.infer<typeof ResearchIdParamSchema>;
