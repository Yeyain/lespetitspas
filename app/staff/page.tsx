import { ChildrenList } from "./children-list"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export default async function StaffPage() {
  await requireRole("staff")

  const supabase = await createClient()
  const { data: children, error } = await supabase
    .from("children")
    .select("id, first_name, last_name, section, photo_url")
    .order("first_name")
    .order("last_name")

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-12">
      <h1 className="text-3xl">Les enfants</h1>
      <p className="mt-2 text-muted-foreground">
        Retrouvez un enfant par son nom ou sa section.
      </p>

      {error ? (
        <p className="mt-8 text-muted-foreground">
          Impossible de charger la liste des enfants. Rechargez la page.
        </p>
      ) : (
        <ChildrenList items={children} />
      )}
    </main>
  )
}
