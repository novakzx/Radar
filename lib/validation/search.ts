import { z } from "zod";

export const createSearchSchema = z
  .object({
    location: z
      .string()
      .trim()
      .min(2, { error: "Informe uma localização (ex.: Almada, Portugal)." })
      .max(200),
    radiusKm: z.coerce
      .number()
      .min(0.5, { error: "O raio mínimo é 0.5 km." })
      .max(100, { error: "O raio máximo é 100 km." }),
    category: z.string().trim().max(100).optional(),
    keyword: z.string().trim().max(100).optional(),
  })
  .refine((data) => !!(data.category?.trim() || data.keyword?.trim()), {
    error: "Informe uma categoria ou uma palavra-chave para buscar.",
    path: ["category"],
  });

export type CreateSearchFormInput = z.infer<typeof createSearchSchema>;
