"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateLeadDetailsAction } from "@/lib/actions/leads";

interface LeadDetailsFormProps {
  leadId: string;
  potentialValue: number | null;
  contactDate: string | null;
}

export function LeadDetailsForm({ leadId, potentialValue, contactDate }: LeadDetailsFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await updateLeadDetailsAction(leadId, formData);
          router.refresh();
        })
      }
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="space-y-1.5">
        <Label htmlFor="potentialValue">Valor potencial (€)</Label>
        <Input
          id="potentialValue"
          name="potentialValue"
          type="number"
          min="0"
          step="1"
          defaultValue={potentialValue ?? ""}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contactDate">Data de contato</Label>
        <Input
          id="contactDate"
          name="contactDate"
          type="date"
          defaultValue={contactDate ? contactDate.slice(0, 10) : ""}
        />
      </div>
      <Button type="submit" size="sm" disabled={isPending} className="sm:col-span-2 sm:w-fit">
        {isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
