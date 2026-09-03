"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import {
  createTeamReminder,
  postTeamMessage,
  setTeamReminderDone,
} from "@/services/TeamService";
import { teamMessageSchema, teamReminderSchema } from "@/lib/validation/team";

export async function postTeamMessageAction(formData: FormData) {
  const session = await verifySession();
  const validated = teamMessageSchema.safeParse({ content: formData.get("content") });
  if (!validated.success) return { ok: false as const };

  await postTeamMessage(session.user.id, validated.data.content);
  revalidatePath("/equipe");
  return { ok: true as const };
}

export async function createTeamReminderAction(formData: FormData) {
  const session = await verifySession();
  const validated = teamReminderSchema.safeParse({ content: formData.get("content") });
  if (!validated.success) return { ok: false as const };

  await createTeamReminder(session.user.id, validated.data.content);
  revalidatePath("/equipe");
  return { ok: true as const };
}

export async function toggleTeamReminderAction(id: string, done: boolean) {
  await verifySession();
  await setTeamReminderDone(id, done);
  revalidatePath("/equipe");
}
