import { DemoRequestStatus } from 'src/entities/demo-request.entity';
import { z } from 'zod';

export const CreateDemoRequestSchema = z.object({
  userId: z.coerce.number().int().positive('Invalid user ID'),
  timeline: z.string(),
  preferredTime: z.string(),
  message: z.string().optional(),
});


export const UpdateDemoRequestStatusSchema = z.object({
  status: z.enum(DemoRequestStatus),
  scheduledAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export const DemoRequestIdParamSchema = z.object({
  vendorId: z.coerce.number().int().positive('Invalid vendor ID'),
});

export type CreateDemoRequestDto = z.infer<typeof CreateDemoRequestSchema>;
export type UpdateDemoRequestStatusDto = z.infer<typeof UpdateDemoRequestStatusSchema>;
export type DemoRequestIdParam = z.infer<typeof DemoRequestIdParamSchema>;