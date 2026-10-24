import type { Metadata } from "next"

import { MessageList } from "./message-list"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Messages – Les Petits Pas",
}

export default async function MessagesPage() {
  await requireRole("staff")

  const supabase = await createClient()
  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      "id, content, status, created_at, parent:profiles!messages_parent_id_fkey(first_name), child:children(id, first_name)"
    )
    .order("created_at", { ascending: false })

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <h1 className="text-3xl">Messages des parents</h1>
      <p className="mt-2 text-muted-foreground">
        Touchez un nouveau message pour le marquer comme lu.
      </p>

      {error ? (
        <p className="mt-8 text-muted-foreground">
          Impossible de charger les messages. Rechargez la page.
        </p>
      ) : (
        <MessageList
          messages={messages.map((m) => ({
            id: m.id,
            content: m.content,
            status: m.status,
            createdAt: m.created_at,
            parentName: m.parent?.first_name ?? "Parent",
            childId: m.child?.id ?? null,
            childName: m.child?.first_name ?? "—",
          }))}
        />
      )}
    </main>
  )
}
