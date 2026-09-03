import type { LeadStatus } from "@prisma/client";
import type { BusinessListItem } from "@/types/business";

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "novo",
  "contactar",
  "contactado",
  "reuniao",
  "proposta",
  "cliente",
  "nao_interessado",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contactar: "Contactar",
  contactado: "Contactado",
  reuniao: "Reunião",
  proposta: "Proposta",
  cliente: "Cliente",
  nao_interessado: "Não interessado",
};

export interface LeadNoteItem {
  id: string;
  content: string;
  authorEmail: string;
  createdAt: string;
}

export interface LeadBoardItem {
  id: string;
  status: LeadStatus;
  potentialValue: number | null;
  contactDate: string | null;
  createdAt: string;
  business: BusinessListItem;
  tags: string[];
  ownerEmail: string | null;
}

export interface LeadDetailItem extends LeadBoardItem {
  notes: LeadNoteItem[];
}
