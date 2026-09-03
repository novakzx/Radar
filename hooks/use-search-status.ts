"use client";

import { useQuery } from "@tanstack/react-query";
import type { BusinessListItem } from "@/types/business";
import type { SearchProgress, SearchStepKey } from "@/types/search";

export interface SearchStatusResponse {
  id: string;
  status: "queued" | "running" | "done" | "error";
  step: SearchStepKey;
  progress: SearchProgress;
  location: string;
  radiusKm: number;
  category: string | null;
  keyword: string | null;
  createdAt: string;
  finishedAt: string | null;
  results: BusinessListItem[];
}

async function fetchSearchStatus(searchId: string): Promise<SearchStatusResponse> {
  const response = await fetch(`/api/searches/${searchId}/status`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível consultar o status da busca.");
  }
  return response.json();
}

/**
 * Faz polling real do progresso de uma busca (seção 8) — nunca simula
 * tempo de espera artificial. Para de fazer polling assim que o
 * backend marca a busca como concluída ou com erro.
 */
export function useSearchStatus(searchId: string | undefined) {
  return useQuery({
    queryKey: ["search-status", searchId],
    queryFn: () => fetchSearchStatus(searchId as string),
    enabled: !!searchId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "done" || status === "error") return false;
      return 1500;
    },
    // Mantém o polling mesmo se a aba perder o foco — uma busca pode
    // levar dezenas de segundos e o usuário pode trocar de aba.
    refetchIntervalInBackground: true,
  });
}
