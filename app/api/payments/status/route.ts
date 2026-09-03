import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { userHasPaidAccess } from "@/services/PaymentService";

/**
 * Usado só para a tela "processando pagamento" (`/pagamento/sucesso`)
 * saber quando pode redirecionar ao dashboard. Não concede nada — só lê
 * o estado que o webhook já gravou.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const hasPaid = session.user.role === "admin" || (await userHasPaidAccess(session.user.id));

  return NextResponse.json({ hasPaid });
}
