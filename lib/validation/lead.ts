import { z } from "zod";

export const LEAD_STATUSES = [
  "novo",
  "contactar",
  "contactado",
  "reuniao",
  "proposta",
  "cliente",
  "nao_interessado",
] as const;

export const leadStatusSchema = z.enum(LEAD_STATUSES);

export const addNoteSchema = z.object({
  content: z.string().trim().min(1, { error: "A nota não pode ficar vazia." }).max(2000),
});

export const addTagSchema = z.object({
  tag: z
    .string()
    .trim()
    .min(1, { error: "Informe uma tag." })
    .max(40)
    .transform((value) => value.toLowerCase()),
});

export const updateLeadDetailsSchema = z.object({
  potentialValue: z.coerce.number().min(0).optional().nullable(),
  contactDate: z
    .string()
    .optional()
    .nullable()
    .transform((value) => (value ? new Date(value) : null)),
});
