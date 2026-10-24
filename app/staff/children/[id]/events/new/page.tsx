import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { EventForm } from "./event-form"
import { ChildAvatar } from "@/components/child-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { requireRole } from "@/lib/auth"
import { formatTime, todayInParis } from "@/lib/dates"
import { createClient } from "@/lib/supabase/server"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function NewEventPage({
  params,
}: PageProps<"/staff/children/[id]/events/new">) {
  await requireRole("staff")
  const { id } = await params
  if (!UUID_PATTERN.test(id)) notFound()

  const supabase = await createClient()
  const { data: child } = await supabase
    .from("children")
    .select("first_name, last_name, section, photo_url")
    .eq("id", id)
    .maybeSingle()

  if (!child) notFound()

  // Autorisations de médicaments valides aujourd'hui (niveau 1 : affichage).
  // Le serveur revérifiera tout au moment de l'enregistrement (niveau 2).
  const today = todayInParis()
  const { data: authorizations } = await supabase
    .from("medication_authorizations")
    .select("id, medication_name, dose")
    .eq("child_id", id)
    .lte("start_date", today)
    .gte("end_date", today)
    .order("medication_name")

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:py-12">
      <div>
        <Button asChild variant="ghost" className="-ml-3">
          <Link href={`/staff/children/${id}`}>
            <ArrowLeft data-icon="inline-start" />
            Retour à la fiche
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <ChildAvatar child={child} className="size-14" textClassName="text-lg" />
        <div>
          <p className="text-sm text-muted-foreground">Nouvel événement pour</p>
          <h1 className="text-2xl sm:text-3xl">
            {child.first_name} {child.last_name}
          </h1>
        </div>
      </div>

      {/* overflow-visible : garde le bouton « Enregistrer » collé en bas. */}
      <Card className="overflow-visible">
        <CardContent>
          {/* Heure actuelle à Paris, proposée par défaut pour un médicament. */}
          <EventForm
            childId={id}
            now={formatTime(new Date().toISOString())}
            authorizations={authorizations ?? []}
          />
        </CardContent>
      </Card>
    </main>
  )
}
