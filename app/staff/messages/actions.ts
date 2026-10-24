"use server"

import { refresh } from "next/cache"

import { getCurrentProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export type MessageActionResult = { error: string } | undefined

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Message affiché si la base refuse la modification (règle RLS) : on ne la
// contourne jamais, on prévient.
const RLS_BLOCKED =
  "La base de données refuse cette modification (règle de sécurité RLS). Le message n'a pas été changé. Contactez la personne qui gère l'application."

async function staffOnly() {
  const profile = await getCurrentProfile()
  return profile?.role === "staff" ? profile : null
}

// Clic sur un message « nouveau » : il passe en « lu ».
// Un message déjà « lu » ou « traité » ne change pas.
export async function markAsRead(messageId: unknown): Promise<MessageActionResult> {
  const profile = await staffOnly()
  if (!profile) return { error: "Action réservée à l'équipe de la crèche." }
  if (typeof messageId !== "string" || !UUID_PATTERN.test(messageId)) {
    return { error: "Message inconnu." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("messages")
    .update({ status: "lu" })
    .eq("id", messageId)
    .eq("status", "nouveau")
    .select("id")

  if (error) return { error: "La mise à jour a échoué. Réessayez." }
  if (data.length === 0) {
    const blocked = await stillHasStatus(messageId, ["nouveau"])
    if (blocked) return { error: RLS_BLOCKED }
  }

  refresh()
}

// « Marquer comme traité » : depuis « nouveau » ou « lu » uniquement.
// handled_by est la personne connectée, lue ici côté serveur.
export async function markAsHandled(
  messageId: unknown
): Promise<MessageActionResult> {
  const profile = await staffOnly()
  if (!profile) return { error: "Action réservée à l'équipe de la crèche." }
  if (typeof messageId !== "string" || !UUID_PATTERN.test(messageId)) {
    return { error: "Message inconnu." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("messages")
    .update({
      status: "traité",
      handled_by: profile.id,
      handled_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .in("status", ["nouveau", "lu"])
    .select("id")

  if (error) return { error: "La mise à jour a échoué. Réessayez." }
  if (data.length === 0) {
    const blocked = await stillHasStatus(messageId, ["nouveau", "lu"])
    if (blocked) return { error: RLS_BLOCKED }
  }

  refresh()
}

// Si aucune ligne n'a changé alors que le message est toujours dans l'ancien
// statut, c'est que la base a refusé la modification (RLS).
async function stillHasStatus(
  messageId: string,
  statuses: string[]
): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("messages")
    .select("status")
    .eq("id", messageId)
    .maybeSingle()
  return data !== null && statuses.includes(data.status)
}
