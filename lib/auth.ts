import { cache } from "react"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { Profile, Role } from "@/lib/supabase/database.types"

// Page d'accueil de chaque rôle.
export const HOME_BY_ROLE: Record<Role, string> = {
  staff: "/staff",
  parent: "/parent",
}

// Profil de la personne connectée, ou null si personne n'est connecté.
// `cache` : une seule lecture par requête, même si plusieurs composants l'appellent.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return profile
})

// À appeler en haut d'une page réservée à un rôle : renvoie vers /login si
// personne n'est connecté, ou vers son propre espace si le rôle ne correspond pas.
export async function requireRole(role: Role): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/login")
  if (profile.role !== role) redirect(HOME_BY_ROLE[profile.role])
  return profile
}
