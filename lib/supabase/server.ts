import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "./database.types"

// Client Supabase pour le serveur (Server Components, Server Actions, Route Handlers).
// La session de l'utilisateur est lue et mise à jour via les cookies.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Appelé depuis un Server Component : écrire des cookies y est
            // impossible. Sans gravité si un middleware rafraîchit la session.
          }
        },
      },
    }
  )
}
