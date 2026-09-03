"use server";

import { after } from "next/server";
import { verifySession } from "@/lib/dal";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSearchSchema } from "@/lib/validation/search";
import { createSearch, runSearchPipeline } from "@/services/SearchService";

export type CreateSearchState =
  | {
      errors?: Partial<Record<"location" | "radiusKm" | "category", string[]>>;
      message?: string;
      searchId?: string;
    }
  | undefined;

export async function createSearchAction(
  _prevState: CreateSearchState,
  formData: FormData,
): Promise<CreateSearchState> {
  const session = await verifySession();

  const validated = createSearchSchema.safeParse({
    location: formData.get("location"),
    radiusKm: formData.get("radiusKm"),
    category: formData.get("category") || undefined,
    keyword: formData.get("keyword") || undefined,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { allowed } = await checkRateLimit("search", session.user.id);
  if (!allowed) {
    return {
      message: "Você atingiu o limite de buscas por hora. Tente novamente mais tarde.",
    };
  }

  let searchId: string;
  try {
    const search = await createSearch({ userId: session.user.id, ...validated.data });
    searchId = search.id;
  } catch (error) {
    console.error("[createSearchAction] falha ao criar busca", error);
    return {
      message: "Não foi possível iniciar a busca agora. Tente novamente em alguns instantes.",
    };
  }

  // Responde imediatamente ao client; o pipeline roda em background
  // (seção 8) e o client acompanha via polling em /api/searches/:id/status.
  after(() => runSearchPipeline(searchId));

  return { searchId };
}
