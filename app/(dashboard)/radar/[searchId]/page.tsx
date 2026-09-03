import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { SearchProgressView } from "@/components/shared/search-progress";

export const metadata: Metadata = {
  title: "Busca",
  robots: { index: false, follow: false },
};

export default async function SearchDetailPage(props: PageProps<"/radar/[searchId]">) {
  await verifySession();
  const { searchId } = await props.params;

  const search = await prisma.search.findUnique({ where: { id: searchId } });
  if (!search) notFound();

  return <SearchProgressView searchId={searchId} />;
}
