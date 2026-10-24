import { LogOut } from "lucide-react"

import { logout } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

// Bouton de déconnexion affiché en haut de chaque page, seulement si
// quelqu'un est connecté.
export async function LogoutButton() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return (
    <form action={logout} className="fixed top-4 right-4 z-50">
      <Button type="submit" variant="outline">
        <LogOut data-icon="inline-start" />
        Se déconnecter
      </Button>
    </form>
  )
}
