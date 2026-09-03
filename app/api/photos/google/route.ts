import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Proxy para fotos do Google Places: busca a imagem no servidor usando
 * GOOGLE_PLACES_API_KEY (nunca exposta ao client) e repassa os bytes.
 * Exige sessão autenticada — evita virar um proxy de imagens aberto.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Google Places não está configurado." }, { status: 404 });
  }

  const ref = new URL(request.url).searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ message: "Parâmetro 'ref' obrigatório." }, { status: 400 });
  }

  const photoUrl = new URL("https://maps.googleapis.com/maps/api/place/photo");
  photoUrl.searchParams.set("maxwidth", "480");
  photoUrl.searchParams.set("photo_reference", ref);
  photoUrl.searchParams.set("key", apiKey);

  const response = await fetch(photoUrl, { cache: "no-store" });
  if (!response.ok || !response.body) {
    return NextResponse.json({ message: "Não foi possível carregar a foto." }, { status: 502 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
