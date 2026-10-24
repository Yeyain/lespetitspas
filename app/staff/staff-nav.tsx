"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

export function StaffNav({ newMessages }: { newMessages: number }) {
  const pathname = usePathname()
  const onMessages = pathname.startsWith("/staff/messages")

  return (
    // pr : laisse la place au bouton de déconnexion en haut à droite.
    <header className="mx-auto w-full max-w-5xl px-4 pt-4 pr-20 sm:pr-52">
      <nav aria-label="Espace staff" className="flex flex-wrap gap-2">
        <Button asChild variant={onMessages ? "ghost" : "default"}>
          <Link href="/staff" aria-current={onMessages ? undefined : "page"}>
            <Users data-icon="inline-start" />
            Enfants
          </Link>
        </Button>
        <Button asChild variant={onMessages ? "default" : "ghost"}>
          <Link
            href="/staff/messages"
            aria-current={onMessages ? "page" : undefined}
            aria-label={`Messages, ${newMessages} nouveau${newMessages > 1 ? "x" : ""}`}
          >
            <MessageCircle data-icon="inline-start" />
            Messages
            {newMessages > 0 && (
              <span className="ml-0.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-foreground">
                {newMessages}
              </span>
            )}
          </Link>
        </Button>
      </nav>
    </header>
  )
}
