"use client";

import { useQuery } from "@tanstack/react-query";
import type { TeamMessageItem } from "@/types/team";

async function fetchTeamMessages(): Promise<TeamMessageItem[]> {
  const response = await fetch("/api/team/messages", { cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível carregar as mensagens da equipe.");
  const data = (await response.json()) as { messages: TeamMessageItem[] };
  return data.messages;
}

/** Polling leve do mural da equipe — mantém a conversa "ao vivo" entre membros. */
export function useTeamMessages(initialData: TeamMessageItem[]) {
  return useQuery({
    queryKey: ["team-messages"],
    queryFn: fetchTeamMessages,
    initialData,
    refetchInterval: 4000,
    refetchIntervalInBackground: true,
  });
}
