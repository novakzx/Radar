import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getLeadsByIds } from "@/services/LeadService";
import { generateLeadsCsv, generateLeadsXlsx } from "@/services/ExportService";
import { logAuditEvent } from "@/services/AuditLogService";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { allowed } = await checkRateLimit("export", session.user.id);
  if (!allowed) {
    return NextResponse.json(
      { message: "Limite de exportações por hora atingido. Tente novamente mais tarde." },
      { status: 429 },
    );
  }

  const url = new URL(request.url);
  const ids = (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const format = url.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  if (ids.length === 0) {
    return NextResponse.json({ message: "Selecione ao menos um lead para exportar." }, { status: 400 });
  }

  try {
    const leads = await getLeadsByIds(ids);

    await logAuditEvent({
      userId: session.user.id,
      action: "leads.export",
      entity: "lead",
      metadata: { count: leads.length, format },
    });

    const filename = `leads-codevision-radar-${new Date().toISOString().slice(0, 10)}.${format}`;

    if (format === "xlsx") {
      const buffer = await generateLeadsXlsx(leads);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const csv = generateLeadsCsv(leads);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/leads/export] falhou", error);
    return NextResponse.json(
      { message: "Não foi possível exportar os leads agora. Tente novamente em alguns instantes." },
      { status: 500 },
    );
  }
}
