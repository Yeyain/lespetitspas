import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// Fiche enfant provisoire : la vraie fiche sera construite à l'étape suivante.
export default async function ChildPage({
  params,
}: PageProps<"/staff/children/[id]">) {
  await requireRole("staff")
  const { id } = await params

  const supabase = await createClient()
  const { data: child } = await supabase
    .from("children")
    .select("first_name, last_name")
    .eq("id", id)
    .maybeSingle()

  if (!child) notFound()

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-12">
      <Button asChild variant="ghost" className="-ml-3">
        <Link href="/staff">
          <ArrowLeft data-icon="inline-start" />
          Tous les enfants
        </Link>
      </Button>
      <h1 className="mt-4 text-3xl">
        {child.first_name} {child.last_name}
      </h1>
    </main>
  )
}
