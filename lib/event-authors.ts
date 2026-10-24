import type { createClient } from "@/lib/supabase/server"

type Client = Awaited<ReturnType<typeof createClient>>

// Prénoms des auteurs d'événements, pour l'espace parent. Un parent n'a pas le
// droit de lire la table profiles : on passe par la fonction sécurisée de la
// base `get_event_authors`, en un seul appel, avec le client du parent.
// En cas d'échec, on renvoie une liste vide (affichage « Saisi par l'équipe »)
// et l'erreur est notée dans les logs du serveur.
export async function getEventAuthors(
  supabase: Client,
  eventIds: string[]
): Promise<Map<string, string>> {
  const authors = new Map<string, string>()
  if (eventIds.length === 0) return authors

  const { data, error } = await supabase.rpc("get_event_authors", {
    p_event_ids: eventIds,
  })

  if (error) {
    console.error("[get_event_authors] échec de l'appel :", error)
    return authors
  }

  for (const row of data ?? []) {
    if (row.author_first_name) authors.set(row.event_id, row.author_first_name)
  }
  return authors
}
