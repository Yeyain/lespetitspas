"use client"

import { useOptimistic, useTransition } from "react"
import Link from "next/link"
import { Check, CircleCheck, MessageCircle } from "lucide-react"
import { toast } from "sonner"

import { markAsHandled, markAsRead } from "./actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateTime } from "@/lib/dates"
import type { MessageStatus } from "@/lib/supabase/database.types"

export type MessageItem = {
  id: string
  content: string
  status: MessageStatus
  createdAt: string
  parentName: string
  childId: string | null
  childName: string
}

// Badge de chaque statut : « Nouveau » ressort, « Lu » est discret,
// « Traité » est apaisé (menthe).
const STATUS_BADGE: Record<MessageStatus, { label: string; className: string }> = {
  nouveau: {
    label: "Nouveau",
    className: "bg-accent font-semibold text-foreground",
  },
  lu: {
    label: "Lu",
    className: "bg-muted text-muted-foreground",
  },
  traité: {
    label: "Traité",
    className: "bg-secondary/50 text-foreground",
  },
}

export function MessageList({ messages }: { messages: MessageItem[] }) {
  // Mise à jour immédiate à l'écran ; le serveur confirme ensuite.
  const [optimistic, setStatus] = useOptimistic(
    messages,
    (current, change: { id: string; status: MessageStatus }) =>
      current.map((m) => (m.id === change.id ? { ...m, status: change.status } : m))
  )
  const [, startTransition] = useTransition()

  function run(
    id: string,
    status: MessageStatus,
    action: (id: string) => Promise<{ error: string } | undefined>
  ) {
    startTransition(async () => {
      setStatus({ id, status })
      const result = await action(id)
      if (result?.error) toast.error(result.error)
    })
  }

  if (optimistic.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl bg-card py-12 text-center text-muted-foreground shadow-sm">
        <MessageCircle className="size-8" />
        Aucun message des parents
      </div>
    )
  }

  return (
    <ul className="mt-8 flex flex-col gap-4">
      {optimistic.map((message) => {
        const isNew = message.status === "nouveau"
        const badge = STATUS_BADGE[message.status]

        const body = (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-heading font-semibold">
                {message.parentName}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · pour {message.childName}
                </span>
              </p>
              <Badge className={badge.className}>{badge.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(message.createdAt)}
            </p>
            <p
              className={`mt-1 whitespace-pre-line break-words ${
                isNew ? "font-medium" : ""
              }`}
            >
              {message.content}
            </p>
          </>
        )

        return (
          <li key={message.id}>
            <Card
              className={
                isNew
                  ? "ring-2 ring-accent"
                  : message.status === "traité"
                    ? "bg-card/70"
                    : undefined
              }
            >
              <CardContent className="flex flex-col gap-4">
                {isNew ? (
                  <button
                    type="button"
                    onClick={() => run(message.id, "lu", markAsRead)}
                    className="-m-2 flex flex-col gap-1 rounded-xl p-2 text-left outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-label={`Marquer comme lu le message de ${message.parentName}`}
                  >
                    {body}
                  </button>
                ) : (
                  <div className="flex flex-col gap-1">{body}</div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {message.childId ? (
                    <Link
                      href={`/staff/children/${message.childId}`}
                      className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                      Voir la fiche de {message.childName}
                    </Link>
                  ) : (
                    <span />
                  )}
                  {message.status === "traité" ? (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CircleCheck className="size-4" />
                      Traité
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => run(message.id, "traité", markAsHandled)}
                    >
                      <Check data-icon="inline-start" />
                      Marquer comme traité
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
