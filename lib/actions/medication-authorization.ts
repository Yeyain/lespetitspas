"use server"

import { getCurrentProfile } from "@/lib/auth"
import { isValidDay } from "@/lib/dates"
import { sameMedication } from "@/lib/medication"
import { createClient } from "@/lib/supabase/server"

export type AuthorizationCheck =
  | { ok: true; authorizationId: string }
  | { ok: false; error: string }

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const NO_AUTHORIZATION = "Aucune autorisation parentale valide pour cet enfant"
const NOT_COVERED =
  "Ce médicament n'est pas couvert par une autorisation parentale valide"

// Règle métier critique : cherche dans la base une autorisation parentale
// valide pour cet enfant, ce médicament et cette date (AAAA-MM-JJ).
// Renvoie l'identifiant de l'autorisation (à mettre dans events.authorization_id)
// ou une erreur. Rien de ce qu'envoie le navigateur n'est pris pour acquis :
// les paramètres sont revérifiés et seule la base fait foi.
export async function findValidAuthorization(
  childId: unknown,
  medicationName: unknown,
  date: unknown
): Promise<AuthorizationCheck> {
  // Une Server Action peut être appelée directement : on revérifie le rôle.
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "staff") {
    return { ok: false, error: "Action réservée à l'équipe de la crèche." }
  }

  if (typeof childId !== "string" || !UUID_PATTERN.test(childId)) {
    return { ok: false, error: "Enfant inconnu." }
  }
  if (typeof medicationName !== "string" || medicationName.trim() === "") {
    return { ok: false, error: "Le nom du médicament est obligatoire." }
  }
  if (!isValidDay(date)) {
    return { ok: false, error: "Date invalide." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("medication_authorizations")
    .select("id, medication_name")
    .eq("child_id", childId)
    .lte("start_date", date)
    .gte("end_date", date)
    .order("created_at", { ascending: false })

  if (error) {
    return {
      ok: false,
      error: "Impossible de vérifier les autorisations. Réessayez.",
    }
  }
  if (data.length === 0) {
    return { ok: false, error: NO_AUTHORIZATION }
  }

  const match = data.find((auth) =>
    sameMedication(auth.medication_name, medicationName)
  )
  if (!match) {
    return { ok: false, error: NOT_COVERED }
  }

  return { ok: true, authorizationId: match.id }
}
