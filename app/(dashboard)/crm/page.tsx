import type { Metadata } from "next";
import { verifySession } from "@/lib/dal";
import { listLeadsForBoard } from "@/services/LeadService";
import { CrmBoard } from "@/components/shared/crm-board";

export const metadata: Metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
};

export default async function CrmPage() {
  await verifySession();
  const board = await listLeadsForBoard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
        <p className="text-muted-foreground">
          Arraste os cartões entre os estágios. As mudanças são salvas automaticamente.
        </p>
      </div>
      <CrmBoard initialBoard={board} />
    </div>
  );
}
