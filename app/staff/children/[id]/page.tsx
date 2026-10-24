import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarX,
  CircleCheck,
  CircleX,
  MessageCircle,
  Plus,
  Users,
} from "lucide-react"

import { ChildAvatar } from "@/components/child-avatar"
import { DayPicker } from "@/components/day-picker"
import { EventTimeline } from "@/components/event-timeline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth"
import {
  formatDateTime,
  formatLongDay,
  isValidDay,
  parisDayRange,
  todayInParis,
} from "@/lib/dates"
import { SECTIONS } from "@/lib/sections"
import { createClient } from "@/lib/supabase/server"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ChildPage({
  params,
  searchParams,
}: PageProps<"/staff/children/[id]">) {
  await requireRole("staff")
  const { id } = await params
  if (!UUID_PATTERN.test(id)) notFound()

  const today = todayInParis()
  const { date } = await searchParams
  const day = isValidDay(date) ? date : today
  const { start, end } = parisDayRange(day)

  const supabase = await createClient()

  const { data: child } = await supabase
    .from("children")
    .select("first_name, last_name, section, photo_url, allergies")
    .eq("id", id)
    .maybeSingle()

  if (!child) notFound()

  const [authorizations, parents, messages, events] = await Promise.all([
    // Autorisation de médicament valide aujourd'hui.
    supabase
      .from("medication_authorizations")
      .select("id", { count: "exact", head: true })
      .eq("child_id", id)
      .lte("start_date", today)
      .gte("end_date", today),
    supabase
      .from("parent_children")
      .select("parent:profiles(first_name)")
      .eq("child_id", id),
    supabase
      .from("messages")
      .select(
        "id, content, created_at, parent:profiles!messages_parent_id_fkey(first_name)"
      )
      .eq("child_id", id)
      .eq("status", "nouveau")
      .order("created_at", { ascending: false }),
    supabase
      .from("events")
      .select(
        "id, type, occurred_at, details, author:profiles!events_created_by_fkey(first_name)"
      )
      .eq("child_id", id)
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .order("occurred_at"),
  ])

  const hasAuthorization = (authorizations.count ?? 0) > 0
  const parentNames = (parents.data ?? [])
    .map((link) => link.parent?.first_name)
    .filter(Boolean)
  const newMessages = messages.data ?? []
  const dayEvents = events.data ?? []
  const allergies = child.allergies?.trim()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:py-12">
      <div>
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/staff">
            <ArrowLeft data-icon="inline-start" />
            Retour à la liste
          </Link>
        </Button>
      </div>

      {/* Identité et informations importantes */}
      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <ChildAvatar child={child} className="size-16" textClassName="text-xl" />
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              <h1 className="text-2xl sm:text-3xl">
                {child.first_name} {child.last_name}
              </h1>
              <Badge className={`${SECTIONS[child.section].color} text-foreground`}>
                {SECTIONS[child.section].label}
              </Badge>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-heading text-lg font-semibold ${
              hasAuthorization ? "bg-secondary/40" : "bg-destructive/25"
            }`}
          >
            {hasAuthorization ? (
              <CircleCheck className="size-6 shrink-0" />
            ) : (
              <CircleX className="size-6 shrink-0" />
            )}
            Autorisation médicament : {hasAuthorization ? "oui" : "non"}
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Allergies</dt>
              <dd className="mt-1 whitespace-pre-line">
                {allergies || (
                  <span className="text-muted-foreground">
                    Aucune allergie renseignée
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-4" />
                Parents
              </dt>
              <dd className="mt-1">
                {parentNames.length > 0 ? (
                  parentNames.join(", ")
                ) : (
                  <span className="text-muted-foreground">
                    Aucun parent rattaché
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Messages des parents non traités */}
      {newMessages.length > 0 ? (
        <Card className="ring-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="size-5" />
              Messages des parents
              <Badge className="bg-accent text-foreground">
                {newMessages.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {newMessages.map((message) => (
                <li key={message.id} className="rounded-xl bg-muted/60 p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {message.parent?.first_name ?? "Parent"}
                    </span>{" "}
                    · {formatDateTime(message.created_at)}
                  </p>
                  <p className="mt-1 whitespace-pre-line">{message.content}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="size-4" />
          Aucun nouveau message des parents.
        </p>
      )}

      {/* Timeline du jour */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Journée</CardTitle>
          <CardDescription className="first-letter:uppercase">
            {formatLongDay(day)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <DayPicker day={day} today={today} />
            <Button asChild size="lg">
              <Link href={`/staff/children/${id}/events/new`}>
                <Plus data-icon="inline-start" />
                Ajouter un événement
              </Link>
            </Button>
          </div>

          <EventTimeline
            events={dayEvents}
            empty={
              <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 py-10 text-center text-muted-foreground">
                <CalendarX className="size-8" />
                Aucun événement pour cette journée
              </div>
            }
          />
        </CardContent>
      </Card>
    </main>
  )
}
