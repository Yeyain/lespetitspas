import Link from "next/link"
import { ChevronRight, MessageCircle, Sun } from "lucide-react"

import { ChildAvatar } from "@/components/child-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { requireRole } from "@/lib/auth"
import { formatTime, parisDayRange, todayInParis } from "@/lib/dates"
import { summarizeEvent } from "@/lib/event-details"
import { EVENT_TYPES } from "@/lib/event-types"
import { createClient } from "@/lib/supabase/server"

export default async function ParentPage() {
  const profile = await requireRole("parent")

  // Client Supabase de la personne connectée : ce sont les règles RLS de la
  // base qui garantissent qu'un parent ne lit que ses enfants. Le filtre sur
  // parent_children ci-dessous est une ceinture de sécurité en plus.
  const supabase = await createClient()
  const { data: children, error } = await supabase
    .from("children")
    .select(
      "id, first_name, last_name, section, photo_url, parent_children!inner(parent_id)"
    )
    .eq("parent_children.parent_id", profile.id)
    .order("first_name")

  // L'erreur est affichée par app/parent/(home)/error.tsx (bouton « Réessayer »).
  if (error) throw new Error("Impossible de charger vos enfants.")

  // Dernier événement de la journée pour chaque enfant.
  const { start, end } = parisDayRange(todayInParis())
  const childIds = children.map((c) => c.id)
  const { data: events, error: eventsError } = childIds.length
    ? await supabase
        .from("events")
        .select(
          "id, child_id, type, occurred_at, details, author:profiles!events_created_by_fkey(first_name)"
        )
        .in("child_id", childIds)
        .gte("occurred_at", start)
        .lt("occurred_at", end)
        .order("occurred_at", { ascending: false })
    : { data: [], error: null }

  if (eventsError) throw new Error("Impossible de charger la journée.")

  const lastEventByChild = new Map<string, (typeof events)[number]>()
  for (const event of events) {
    if (!lastEventByChild.has(event.child_id)) {
      lastEventByChild.set(event.child_id, event)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:py-10">
      {/* pr : laisse la place au bouton de déconnexion. */}
      <div className="pr-14 sm:pr-48">
        <h1 className="text-3xl">Bonjour {profile.first_name} !</h1>
        <p className="mt-2 text-muted-foreground">
          Voici la journée de vos enfants à la crèche.
        </p>
      </div>

      <Button asChild size="lg" className="h-14 text-base">
        <Link href="/parent/messages/new">
          <MessageCircle data-icon="inline-start" />
          Envoyer un message à l&apos;équipe
        </Link>
      </Button>

      {children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <Sun className="size-10 text-secondary" />
            <p className="max-w-sm text-muted-foreground">
              Aucun enfant n&apos;est encore rattaché à votre compte. Contactez
              la crèche si vous pensez que c&apos;est une erreur.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {children.map((child) => {
            const event = lastEventByChild.get(child.id)
            return (
              <li key={child.id}>
                <Link
                  href={`/parent/children/${child.id}`}
                  className="block rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <ChildAvatar
                          child={child}
                          className="size-14"
                          textClassName="text-lg"
                        />
                        <p className="min-w-0 flex-1 truncate font-heading text-xl font-semibold">
                          {child.first_name} {child.last_name}
                        </p>
                        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                      </div>
                      {event ? (
                        <LastEvent event={event} />
                      ) : (
                        <p className="rounded-xl bg-muted/50 px-4 py-3 text-muted-foreground">
                          Pas encore d&apos;événement aujourd&apos;hui
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}

function LastEvent({
  event,
}: {
  event: {
    type: keyof typeof EVENT_TYPES
    occurred_at: string
    details: unknown
    author: { first_name: string } | null
  }
}) {
  const type = EVENT_TYPES[event.type]
  const Icon = type.icon
  const summary = summarizeEvent(event.type, event.details)

  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted/50 px-4 py-3">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${type.color}`}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Dernier événement</p>
        <p className="break-words">
          <span className="font-semibold">{type.label}</span>
          {summary && `, ${summary}`}
          <span className="text-muted-foreground">
            {" "}
            · {formatTime(event.occurred_at)}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Saisi par {event.author?.first_name ?? "—"}
        </p>
      </div>
    </div>
  )
}
