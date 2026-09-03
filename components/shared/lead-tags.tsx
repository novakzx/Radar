"use client";

import { useRef, useTransition } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addTagAction, removeTagAction } from "@/lib/actions/leads";

export function LeadTags({ leadId, tags }: { leadId: string; tags: string[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && <span className="text-sm text-muted-foreground">Sem tags ainda.</span>}
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              aria-label={`Remover tag ${tag}`}
              disabled={isPending}
              onClick={() => startTransition(() => removeTagAction(leadId, tag))}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <form
        ref={formRef}
        action={(formData) =>
          startTransition(async () => {
            await addTagAction(leadId, formData);
            formRef.current?.reset();
          })
        }
        className="flex gap-2"
      >
        <Input name="tag" placeholder="Adicionar tag..." className="h-8 w-40" />
        <Button type="submit" size="sm" variant="outline" disabled={isPending}>
          Adicionar
        </Button>
      </form>
    </div>
  );
}
