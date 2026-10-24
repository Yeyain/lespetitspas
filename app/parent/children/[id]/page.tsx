import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Page provisoire : la vraie fiche parent sera construite plus tard.
export default async function ParentChildPage({
  params,
}: PageProps<"/parent/children/[id]">) {
  await requireRole("parent")
  const { id } = await params
  if (!UUID_PATTERN.test(id)) notFound()

  // Client de la personne connectée : si l'enfant n'est pas le sien, les
  // règles RLS ne renvoient rien et on affiche la page 404.
  const supabase = await createClient()
  const { data: child } = await supabase
    .from("children")
    .select("first_name, last_name")
    .eq("id", id)
    .maybeSingle()

  if (!child) notFound()

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <Button asChild variant="ghost" className="-ml-3">
        <Link href="/parent">
          <ArrowLeft data-icon="inline-start" />
          Retour
        </Link>
      </Button>
      <h1 className="mt-4 text-3xl">
        {child.first_name} {child.last_name}
      </h1>
    </main>
  )
}
