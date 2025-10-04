import { z } from 'zod';

export const DecideClaimParamSchema = z.object({
  claimId: z.coerce.number().int().positive('Invalid claim ID'),
});

export const DecideClaimBodySchema = z.object({
  approve: z.boolean(),
  rejectionReason: z.string().max(500, 'Rejection reason too long').optional(),
});

export type DecideClaimParam = z.infer<typeof DecideClaimParamSchema>;
export type DecideClaimBody = z.infer<typeof DecideClaimBodySchema>;
