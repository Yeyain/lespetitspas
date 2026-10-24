import Link from "next/link"
import { ArrowLeft, CheckCheck, Eye, MessageCircleHeart, Send } from "lucide-react"

import { MessageForm } from "./message-form"
import { EmptyState } from "@/components/empty-state"
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
import { formatDateTime } from "@/lib/dates"
import { createClient } from "@/lib/supabase/server"
import type { MessageStatus } from "@/lib/supabase/database.types"

// Avancement d'un message, vu par le parent.
const PROGRESS: Record<
  MessageStatus,
  { label: string; icon: typeof Send; className: string }
> = {
  nouveau: { label: "Envoyé", icon: Send, className: "bg-primary/50" },
  lu: { label: "Lu par l'équipe", icon: Eye, className: "bg-accent/40" },
  traité: { label: "Traité", icon: CheckCheck, className: "bg-secondary" },
}

export default async function NewMessagePage() {
  const profile = await requireRole("parent")

  // Client de la personne connectée : les RLS restent la vraie protection.
  const supabase = await createClient()
  const [links, history] = await Promise.all([
    supabase
      .from("parent_children")
      .select("child:children(id, first_name, last_name, section, photo_url)")
      .eq("parent_id", profile.id),
    supabase
      .from("messages")
      .select("id, content, status, created_at, child:children(first_name)")
      .eq("parent_id", profile.id)
      .order("created_at", { ascending: false }),
  ])

  // L'erreur est affichée par error.tsx (bouton « Réessayer »).
  if (links.error || history.error) {
    console.error("[parent/messages]", links.error ?? history.error)
    throw new Error("Impossible de charger la messagerie.")
  }

  const childOptions = links.data
    .map((link) => link.child)
    .filter((child) => child !== null)
    .sort((a, b) => a.first_name.localeCompare(b.first_name, "fr"))
  const messages = history.data

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

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Écrire à l&apos;équipe</CardTitle>
          <CardDescription>
            L&apos;équipe lit vos messages au fil de la journée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {childOptions.length === 0 ? (
            <p className="text-muted-foreground">
              Aucun enfant n&apos;est encore rattaché à votre compte. Contactez
              la crèche si vous pensez que c&apos;est une erreur.
            </p>
          ) : (
            <MessageForm childOptions={childOptions} />
          )}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4" aria-labelledby="history-title">
        <h2 id="history-title" className="text-xl">
          Vos messages
        </h2>

        {messages.length === 0 ? (
          <EmptyState
            icon={MessageCircleHeart}
            iconClassName="bg-accent/40"
            title="Vous n'avez pas encore envoyé de message à l'équipe"
            description="N'hésitez pas, nous sommes là !"
            className="bg-card shadow-sm"
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((message) => {
              const progress = PROGRESS[message.status]
              const Icon = progress.icon
              return (
                <li key={message.id}>
                  <Card size="sm">
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Pour {message.child?.first_name ?? "votre enfant"}
                          </span>{" "}
                          · {formatDateTime(message.created_at)}
                        </p>
                        <Badge className={`${progress.className} text-foreground`}>
                          <Icon data-icon="inline-start" />
                          {progress.label}
                        </Badge>
                      </div>
                      <p className="whitespace-pre-line break-words">
                        {message.content}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
