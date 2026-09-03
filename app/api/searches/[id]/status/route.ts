import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSearchResultItems } from "@/services/LeadListService";
import type { SearchProgress } from "@/types/search";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { id } = await context.params;

  const search = await prisma.search.findUnique({ where: { id } });
  if (!search) {
    return NextResponse.json({ message: "Busca não encontrada." }, { status: 404 });
  }

  const results = search.status === "done" ? await getSearchResultItems(id) : [];

  return NextResponse.json({
    id: search.id,
    status: search.status,
    step: search.step,
    progress: search.progress as unknown as SearchProgress,
    location: search.location,
    radiusKm: search.radiusKm,
    category: search.category,
    keyword: search.keyword,
    createdAt: search.createdAt,
    finishedAt: search.finishedAt,
    results,
  });
}
