import { z } from 'zod';


export const ResearchIdParamSchema = z.object({
  vendorId: z.coerce.number().int().positive('Invalid vendor ID'),
  researchId: z.coerce.number().int().positive('Invalid research ID'),
});

export type ResearchIdParam = z.infer<typeof ResearchIdParamSchema>;
