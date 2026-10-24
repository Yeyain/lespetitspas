import { StaffNav } from "./staff-nav"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// Menu commun à toutes les pages de l'espace staff.
export default async function StaffLayout({ children }: LayoutProps<"/staff">) {
  await requireRole("staff")

  const supabase = await createClient()
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "nouveau")

  return (
    <>
      <StaffNav newMessages={count ?? 0} />
      {children}
    </>
  )
}
