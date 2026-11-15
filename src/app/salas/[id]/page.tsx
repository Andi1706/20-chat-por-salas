import type { Metadata } from "next";
import { Chat } from "@/components/Chat";

export const metadata: Metadata = { title: "Sala" };

export default async function PaginaSala({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Chat salaId={id} />;
}
