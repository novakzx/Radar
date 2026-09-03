"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import {
  addLeadNote,
  addLeadTag,
  createLeadFromBusiness,
  moveLeadStatus,
  removeLeadTag,
  updateLeadDetails,
} from "@/services/LeadService";
import {
  addNoteSchema,
  addTagSchema,
  leadStatusSchema,
  updateLeadDetailsSchema,
} from "@/lib/validation/lead";

export type SaveLeadState =
  | { ok: true; leadId: string; alreadyExisted: boolean }
  | { ok: false; message: string }
  | undefined;

export async function saveLeadAction(businessId: string): Promise<SaveLeadState> {
  const session = await verifySession();
  const result = await createLeadFromBusiness(businessId, session.user.id);

  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  revalidatePath("/radar", "layout");
  revalidatePath("/crm");
  return { ok: true, leadId: result.leadId, alreadyExisted: result.alreadyExisted };
}

export async function moveLeadAction(leadId: string, status: string) {
  const session = await verifySession();
  const parsed = leadStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { ok: false as const, message: "Estágio inválido." };
  }

  const result = await moveLeadStatus(leadId, parsed.data, session.user.id);
  revalidatePath("/crm");
  if (!result.ok) {
    return { ok: false as const, message: result.error };
  }
  return { ok: true as const };
}

export type NoteFormState =
  | { errors?: { content?: string[] }; message?: string }
  | undefined;

export async function addNoteAction(
  leadId: string,
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const session = await verifySession();
  const validated = addNoteSchema.safeParse({ content: formData.get("content") });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    await addLeadNote(leadId, session.user.id, validated.data.content);
  } catch (error) {
    console.error("[addNoteAction] falhou", error);
    return { message: "Não foi possível salvar a nota agora. Tente novamente." };
  }

  revalidatePath(`/crm/${leadId}`);
  return {};
}

export async function addTagAction(leadId: string, formData: FormData) {
  const validated = addTagSchema.safeParse({ tag: formData.get("tag") });
  if (!validated.success) return;
  await verifySession();
  await addLeadTag(leadId, validated.data.tag);
  revalidatePath(`/crm/${leadId}`);
  revalidatePath("/crm");
}

export async function removeTagAction(leadId: string, tag: string) {
  await verifySession();
  await removeLeadTag(leadId, tag);
  revalidatePath(`/crm/${leadId}`);
  revalidatePath("/crm");
}

export async function updateLeadDetailsAction(leadId: string, formData: FormData) {
  const session = await verifySession();
  const validated = updateLeadDetailsSchema.safeParse({
    potentialValue: formData.get("potentialValue") || undefined,
    contactDate: formData.get("contactDate") || undefined,
  });
  if (!validated.success) return;

  await updateLeadDetails(
    leadId,
    { potentialValue: validated.data.potentialValue ?? null, contactDate: validated.data.contactDate },
    session.user.id,
  );
  revalidatePath(`/crm/${leadId}`);
}
