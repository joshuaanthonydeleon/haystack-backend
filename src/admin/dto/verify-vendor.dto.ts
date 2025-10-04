import { z } from 'zod';

export const VerifyVendorParamSchema = z.object({
  id: z.coerce.number().int().positive('Invalid vendor ID'),
});

export type VerifyVendorParam = z.infer<typeof VerifyVendorParamSchema>;
