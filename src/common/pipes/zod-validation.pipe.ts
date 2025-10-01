import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) { }

  transform(value: any, metadata: ArgumentMetadata) {
    console.log('Transforming value', value);
    try {
      const parsedValue = this.schema.parse(value);
      console.log('Parsed value', parsedValue);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(err => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        throw new BadRequestException({
          message: 'Validation failed',
          errors: errorMessages,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
