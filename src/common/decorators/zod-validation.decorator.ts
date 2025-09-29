import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { ZodSchema } from 'zod';

export const ZodValidation = (schema: ZodSchema) => {
  return UsePipes(new ZodValidationPipe(schema));
};

export const ZodBody = (schema: ZodSchema) => {
  return UsePipes(new ZodValidationPipe(schema));
};

export const ZodQuery = (schema: ZodSchema) => {
  return UsePipes(new ZodValidationPipe(schema));
};

export const ZodParam = (schema: ZodSchema) => {
  return UsePipes(new ZodValidationPipe(schema));
};
