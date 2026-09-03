import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listTeamMessages } from "@/services/TeamService";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const messages = await listTeamMessages();
  return NextResponse.json({ messages });
}
