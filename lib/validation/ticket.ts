import { z } from "zod";

export const ticketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, { error: "O assunto precisa ter pelo menos 3 caracteres." })
    .max(120, { error: "Assunto muito longo (máx. 120 caracteres)." }),
  message: z
    .string()
    .trim()
    .min(10, { error: "Descreva melhor o problema (mínimo 10 caracteres)." })
    .max(4000, { error: "Mensagem muito longa (máx. 4000 caracteres)." }),
});

export const ticketReplySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { error: "Escreva uma resposta." })
    .max(4000, { error: "Resposta muito longa (máx. 4000 caracteres)." }),
});
