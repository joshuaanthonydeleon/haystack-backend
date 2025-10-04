import { z } from 'zod';

export const UploadCsvResponseSchema = z.object({
  message: z.string(),
  success: z.number(),
  errors: z.array(z.string()),
  totalProcessed: z.number(),
});

export type UploadCsvResponse = z.infer<typeof UploadCsvResponseSchema>;
