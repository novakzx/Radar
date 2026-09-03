"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LeadStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { moveLeadAction } from "@/lib/actions/leads";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from "@/types/lead";

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) => {
        if (!value) return;
        startTransition(async () => {
          await moveLeadAction(leadId, value);
          router.refresh();
        });
      }}
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUS_ORDER.map((option) => (
          <SelectItem key={option} value={option}>
            {LEAD_STATUS_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
