"use server"

import { refresh } from "next/cache"

import { getCurrentProfile } from "@/lib/auth"
import { MESSAGE_MAX_LENGTH } from "@/lib/messages"
import { createClient } from "@/lib/supabase/server"

export type SendMessageResult = { ok: true } | { ok: false; error: string }

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Envoi d'un message d'un parent à l'équipe. Tout est revérifié ici : le
// navigateur n'envoie que l'enfant choisi et le texte.
export async function sendMessage(
  childId: unknown,
  content: unknown
): Promise<SendMessageResult> {
  // 1. Seul un parent connecté peut écrire.
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "parent") {
    return { ok: false, error: "Action réservée aux parents." }
  }

  // 2. Texte : non vide et 500 caractères maximum.
  if (typeof content !== "string" || content.trim() === "") {
    return { ok: false, error: "Votre message est vide." }
  }
  const text = content.trim()
  if (text.length > MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      error: `Votre message dépasse ${MESSAGE_MAX_LENGTH} caractères.`,
    }
  }

  // 3. L'enfant doit être rattaché à ce parent.
  if (typeof childId !== "string" || !UUID_PATTERN.test(childId)) {
    return { ok: false, error: "Choisissez l'enfant concerné." }
  }
  const supabase = await createClient()
  const { data: link, error: linkError } = await supabase
    .from("parent_children")
    .select("child_id")
    .eq("parent_id", profile.id)
    .eq("child_id", childId)
    .maybeSingle()

  if (linkError) {
    console.error("[sendMessage] vérification du lien parent-enfant :", linkError)
    return { ok: false, error: "Un petit souci est survenu. Réessayez." }
  }
  if (!link) {
    return { ok: false, error: "Cet enfant n'est pas rattaché à votre compte." }
  }

  // 4. Enregistrement : parent_id et statut fixés ici, côté serveur.
  const { error } = await supabase.from("messages").insert({
    child_id: childId,
    parent_id: profile.id,
    content: text,
    status: "nouveau",
  })

  if (error) {
    // 42501 : refus par une règle de sécurité (RLS). On ne contourne pas.
    console.error("[sendMessage] enregistrement refusé :", error)
    return {
      ok: false,
      error:
        error.code === "42501"
          ? "La base de données a refusé l'envoi (règle de sécurité). Prévenez la crèche."
          : "Votre message n'a pas pu être envoyé. Réessayez.",
    }
  }

  // TODO Phase 7 : envoyer un email Resend au staff ici

  // Met à jour l'historique affiché sous le formulaire.
  refresh()
  return { ok: true }
}
