"use client"

import { useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addDays, isValidDay } from "@/lib/dates"

// Sélecteur de date : la date choisie est mise dans l'adresse (?date=...).
// `allowFuture={false}` empêche de choisir un jour après aujourd'hui.
export function DayPicker({
  day,
  today,
  allowFuture = true,
}: {
  day: string
  today: string
  allowFuture?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const canGoForward = allowFuture || day < today

  function goTo(next: string) {
    if (!isValidDay(next)) return
    if (!allowFuture && next > today) next = today
    const url = next === today ? pathname : `${pathname}?date=${next}`
    startTransition(() => router.push(url, { scroll: false }))
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-busy={pending}
      data-pending={pending || undefined}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(addDays(day, -1))}
        aria-label="Jour précédent"
      >
        <ChevronLeft />
      </Button>
      <Input
        type="date"
        value={day}
        max={allowFuture ? undefined : today}
        onChange={(e) => goTo(e.target.value)}
        aria-label="Choisir une date"
        className="h-10 w-auto"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(addDays(day, 1))}
        disabled={!canGoForward}
        aria-label="Jour suivant"
      >
        <ChevronRight />
      </Button>
      {day !== today && (
        <Button variant="ghost" onClick={() => goTo(today)}>
          Aujourd&apos;hui
        </Button>
      )}
    </div>
  )
}
