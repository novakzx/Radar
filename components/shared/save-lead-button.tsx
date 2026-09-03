"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveLeadAction } from "@/lib/actions/leads";

export function SaveLeadButton({ businessId, leadId }: { businessId: string; leadId?: string | null }) {
  const [savedId, setSavedId] = useState<string | null>(leadId ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (savedId) {
    return (
      <Button size="sm" variant="secondary" onClick={() => router.push(`/crm/${savedId}`)}>
        <BookmarkCheck className="size-3.5" />
        Ver lead
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await saveLeadAction(businessId);
            if (result?.ok) {
              setSavedId(result.leadId);
            } else if (result && !result.ok) {
              setError(result.message);
            }
          })
        }
      >
        <BookmarkPlus className="size-3.5" />
        {isPending ? "Salvando..." : "Salvar lead"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
