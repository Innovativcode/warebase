import { z } from "zod";

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export const settingsPatchSchema = z.object({
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(CURRENCY_PATTERN, "Currency must be a valid 3-letter ISO code")
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
});
