import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, CalendarHeart, Sunrise } from "lucide-react"

import { ChildAvatar } from "@/components/child-avatar"
import { DayPicker } from "@/components/day-picker"
import { EmptyState } from "@/components/empty-state"
import { EventTimeline } from "@/components/event-timeline"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth"
import { getEventAuthors } from "@/lib/event-authors"
import {
  formatLongDay,
  isValidDay,
  parisDayRange,
  todayInParis,
} from "@/lib/dates"
import { createClient } from "@/lib/supabase/server"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ParentChildPage({
  params,
  searchParams,
}: PageProps<"/parent/children/[id]">) {
  const profile = await requireRole("parent")
  const { id } = await params
  if (!UUID_PATTERN.test(id)) redirect("/parent")

  // Client de la personne connectée : les règles RLS restent la vraie
  // protection. On vérifie en plus le lien parent ↔ enfant.
  const supabase = await createClient()
  const { data: link, error: linkError } = await supabase
    .from("parent_children")
    .select("child_id")
    .eq("parent_id", profile.id)
    .eq("child_id", id)
    .maybeSingle()

  if (linkError) throw new Error("Impossible de vérifier l'accès.")
  if (!link) redirect("/parent")

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("first_name, last_name, section, photo_url")
    .eq("id", id)
    .maybeSingle()

  if (childError) throw new Error("Impossible de charger l'enfant.")
  if (!child) redirect("/parent")

  // Jour consulté : aujourd'hui par défaut, jamais dans le futur.
  const today = todayInParis()
  const { date } = await searchParams
  const day = isValidDay(date) && date <= today ? date : today
  const { start, end } = parisDayRange(day)

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, type, occurred_at, details")
    .eq("child_id", id)
    .gte("occurred_at", start)
    .lt("occurred_at", end)
    .order("occurred_at", { ascending: false })

  // L'erreur est affichée par error.tsx (bouton « Réessayer »).
  if (eventsError) throw new Error("Impossible de charger la journée.")

  // « Saisi par » : prénoms via la fonction sécurisée de la base.
  const authors = await getEventAuthors(
    supabase,
    events.map((e) => e.id)
  )
  const timeline = events.map((e) => {
    const firstName = authors.get(e.id)
    return { ...e, author: firstName ? { first_name: firstName } : null }
  })

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:py-10">
      {/* pr : laisse la place au bouton de déconnexion. */}
      <div className="pr-14 sm:pr-48">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/parent">
            <ArrowLeft data-icon="inline-start" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <ChildAvatar child={child} className="size-16" textClassName="text-xl" />
        <h1 className="min-w-0 text-2xl sm:text-3xl">
          {child.first_name} {child.last_name}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {day === today ? "Sa journée aujourd'hui" : "Sa journée"}
          </CardTitle>
          <CardDescription className="first-letter:uppercase">
            {formatLongDay(day)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <DayPicker day={day} today={today} allowFuture={false} />
          <EventTimeline
            events={timeline}
            empty={
              day === today ? (
                <EmptyState
                  icon={Sunrise}
                  iconClassName="bg-secondary/40"
                  title={`La journée de ${child.first_name} n'a pas encore commencé`}
                  description="Dès que l'équipe aura noté quelque chose, vous le verrez ici."
                  className="bg-muted/50"
                />
              ) : (
                <EmptyState
                  icon={CalendarHeart}
                  iconClassName="bg-primary/40"
                  title={`Aucun événement n'a été noté pour ${child.first_name} ce jour-là`}
                  className="bg-muted/50"
                />
              )
            }
          />
        </CardContent>
      </Card>
    </main>
  )
}
