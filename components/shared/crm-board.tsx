"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, GripVertical } from "lucide-react";
import type { LeadStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { moveLeadAction } from "@/lib/actions/leads";
import { LEAD_STATUS_LABELS, LEAD_STATUS_ORDER } from "@/types/lead";
import type { LeadBoardItem } from "@/types/lead";

interface CrmBoardProps {
  initialBoard: Record<LeadStatus, LeadBoardItem[]>;
}

export function CrmBoard({ initialBoard }: CrmBoardProps) {
  const [board, setBoard] = useState(initialBoard);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function toggleSelected(leadId: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(leadId);
      else next.delete(leadId);
      return next;
    });
  }

  function moveLead(leadId: string, status: LeadStatus) {
    setBoard((current) => {
      let moved: LeadBoardItem | undefined;
      const next: Record<LeadStatus, LeadBoardItem[]> = { ...current };
      for (const key of LEAD_STATUS_ORDER) {
        const found = next[key].find((lead) => lead.id === leadId);
        if (found) {
          moved = found;
          next[key] = next[key].filter((lead) => lead.id !== leadId);
        }
      }
      if (!moved || moved.status === status) return current;
      next[status] = [{ ...moved, status }, ...next[status]];
      return next;
    });

    startTransition(async () => {
      const result = await moveLeadAction(leadId, status);
      if (result && !result.ok) {
        console.error("[CrmBoard] falha ao mover lead:", result.message);
      }
    });
  }

  const exportHref = (format: "csv" | "xlsx") =>
    `/api/leads/export?ids=${selectedIds.join(",")}&format=${format}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
        <span className="text-sm text-muted-foreground">
          {selectedIds.length} lead{selectedIds.length === 1 ? "" : "s"} selecionado
          {selectedIds.length === 1 ? "" : "s"}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={selectedIds.length === 0}
          nativeButton={false}
          render={<a href={exportHref("csv")} download />}
        >
          <Download className="size-3.5" />
          Exportar CSV
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={selectedIds.length === 0}
          nativeButton={false}
          render={<a href={exportHref("xlsx")} download />}
        >
          <FileSpreadsheet className="size-3.5" />
          Exportar Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-[260px]">
        {LEAD_STATUS_ORDER.map((status) => (
          <div
            key={status}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverStatus(status);
            }}
            onDragLeave={() => setDragOverStatus((current) => (current === status ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              setDragOverStatus(null);
              const leadId = draggingId;
              setDraggingId(null);
              if (leadId) moveLead(leadId, status);
            }}
            className={cn(
              "flex min-h-[200px] flex-col gap-2 rounded-lg border border-border bg-card/50 p-3 transition-colors",
              dragOverStatus === status && "border-primary bg-card",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{LEAD_STATUS_LABELS[status]}</h3>
              <Badge variant="outline">{board[status].length}</Badge>
            </div>

            <div className="flex flex-col gap-2">
              {board[status].map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => setDraggingId(lead.id)}
                  onDragEnd={() => setDraggingId(null)}
                  className={cn(
                    "cursor-grab rounded-md border border-border bg-background p-3 text-sm shadow-sm active:cursor-grabbing",
                    draggingId === lead.id && "opacity-40",
                  )}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <Link
                      href={`/crm/${lead.id}`}
                      draggable={false}
                      className="font-medium leading-tight hover:underline"
                    >
                      {lead.business.name}
                    </Link>
                    <div className="flex shrink-0 items-center gap-1">
                      <Checkbox
                        checked={selected.has(lead.id)}
                        onCheckedChange={(checked) => toggleSelected(lead.id, checked === true)}
                      />
                      <GripVertical className="size-3.5 text-muted-foreground" aria-hidden />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lead.business.category ?? "Sem categoria"}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span>Lead Score: {lead.business.leadScore.total}</span>
                    {lead.potentialValue != null && (
                      <span className="text-muted-foreground">
                        {lead.potentialValue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Alternativa ao arrastar (touch/mobile não suportam drag-and-drop nativo) */}
                  <Select value={status} onValueChange={(value) => value && moveLead(lead.id, value as LeadStatus)}>
                    <SelectTrigger className="mt-2 h-7 w-full text-xs" onPointerDown={(e) => e.stopPropagation()}>
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
