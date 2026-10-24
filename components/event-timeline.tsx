import type { ReactNode } from "react"
import { TriangleAlert } from "lucide-react"

import { formatTime } from "@/lib/dates"
import { describeDetails } from "@/lib/event-details"
import { EVENT_TYPES } from "@/lib/event-types"
import type { EventType, Json } from "@/lib/supabase/database.types"

export type TimelineEvent = {
  id: string
  type: EventType
  occurred_at: string
  details: Json
  author: { first_name: string } | null
}

// Timeline d'une journée, partagée entre l'espace staff et l'espace parent.
// Les événements sont affichés dans l'ordre reçu.
export function EventTimeline({
  events,
  empty,
}: {
  events: TimelineEvent[]
  empty: ReactNode
}) {
  if (events.length === 0) return <>{empty}</>

  return (
    <ol className="flex flex-col gap-3">
      {events.map((event) => {
        const type = EVENT_TYPES[event.type]
        const Icon = type.icon
        const lines = describeDetails(event.type, event.details)
        const isIncident = event.type === "incident"
        const isUrgent = lines.some((line) => line.emphasis)

        return (
          <li
            key={event.id}
            className={`flex gap-4 rounded-xl border-l-4 p-4 ${type.accent} ${
              isIncident
                ? `bg-destructive/20 ${isUrgent ? "ring-2 ring-destructive" : ""}`
                : "bg-muted/50"
            }`}
          >
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-full ${type.color}`}
              aria-hidden
            >
              <Icon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-heading text-lg font-semibold">{type.label}</p>
                <time
                  dateTime={event.occurred_at}
                  className="shrink-0 font-medium tabular-nums"
                >
                  {formatTime(event.occurred_at)}
                </time>
              </div>
              {lines.length > 0 && (
                <dl className="flex flex-col gap-0.5">
                  {lines.map((line) =>
                    line.emphasis ? (
                      <div
                        key={line.label}
                        className="my-1 flex w-fit items-center gap-1.5 rounded-lg bg-destructive px-2.5 py-1 font-semibold"
                      >
                        <TriangleAlert className="size-4 shrink-0" />
                        <dt className="inline">{line.label} :</dt>
                        <dd className="inline">{line.value}</dd>
                      </div>
                    ) : (
                      <div key={line.label} className="break-words">
                        <dt className="inline text-muted-foreground">
                          {line.label} :{" "}
                        </dt>
                        <dd className="inline whitespace-pre-line">
                          {line.value}
                        </dd>
                      </div>
                    )
                  )}
                </dl>
              )}
              <p className="text-sm text-muted-foreground">
                Saisi par {event.author?.first_name ?? "l'équipe"}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
