import { z } from "zod";

export const teamMessageSchema = z.object({
  content: z.string().trim().min(1, { error: "A mensagem não pode ficar vazia." }).max(1000),
});

export const teamReminderSchema = z.object({
  content: z.string().trim().min(1, { error: "O lembrete não pode ficar vazio." }).max(300),
});

export const reportPeriodSchema = z.enum(["day", "week"]).catch("day");
