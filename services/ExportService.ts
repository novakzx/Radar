import "server-only";
import ExcelJS from "exceljs";
import { LEAD_STATUS_LABELS } from "@/types/lead";
import type { LeadDetailItem } from "@/types/lead";

const EXPORT_COLUMNS = [
  { key: "name", label: "Nome" },
  { key: "category", label: "Categoria" },
  { key: "address", label: "Endereço" },
  { key: "phone", label: "Telefone" },
  { key: "website", label: "Website" },
  { key: "rating", label: "Rating" },
  { key: "reviewCount", label: "Avaliações" },
  { key: "leadScore", label: "Lead Score" },
  { key: "status", label: "Status" },
  { key: "notes", label: "Notas" },
  { key: "lastVerifiedAt", label: "Data da verificação" },
] as const;

function toExportRow(lead: LeadDetailItem): Record<(typeof EXPORT_COLUMNS)[number]["key"], string | number> {
  return {
    name: lead.business.name,
    category: lead.business.category ?? "",
    address: [lead.business.address, lead.business.city].filter(Boolean).join(", "),
    phone: lead.business.phone ?? "",
    website: lead.business.websiteVerification.website ?? "",
    rating: lead.business.rating ?? "",
    reviewCount: lead.business.reviewCount ?? "",
    leadScore: lead.business.leadScore.total,
    status: LEAD_STATUS_LABELS[lead.status],
    notes: lead.notes.map((note) => note.content).join(" | "),
    lastVerifiedAt: lead.business.lastVerifiedAt
      ? new Date(lead.business.lastVerifiedAt).toLocaleString("pt-BR")
      : "",
  };
}

function escapeCsvValue(value: string | number): string {
  const text = String(value);
  if (/[",\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Gera um CSV (separador `;`, compatível com Excel PT) dos leads informados. */
export function generateLeadsCsv(leads: LeadDetailItem[]): string {
  const header = EXPORT_COLUMNS.map((column) => column.label).join(";");
  const rows = leads.map((lead) => {
    const row = toExportRow(lead);
    return EXPORT_COLUMNS.map((column) => escapeCsvValue(row[column.key])).join(";");
  });

  // BOM para o Excel reconhecer UTF-8 corretamente com acentos.
  return "﻿" + [header, ...rows].join("\r\n");
}

/** Gera um arquivo .xlsx (buffer) dos leads informados. */
export async function generateLeadsXlsx(leads: LeadDetailItem[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CodeVision Radar";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Leads");
  sheet.columns = EXPORT_COLUMNS.map((column) => ({
    header: column.label,
    key: column.key,
    width: column.key === "notes" || column.key === "address" ? 40 : 20,
  }));
  sheet.getRow(1).font = { bold: true };

  for (const lead of leads) {
    sheet.addRow(toExportRow(lead));
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
