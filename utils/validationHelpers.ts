import { z } from 'zod';

export const nullableString = z.union([z.string(), z.null()]);
export const nullableStringArray = z.union([z.array(z.string().min(1).max(200)), z.null()]);