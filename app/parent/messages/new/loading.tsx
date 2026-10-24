import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Squelettes affichés pendant le chargement de la messagerie.
export default function Loading() {
  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:py-10"
      aria-busy="true"
      aria-label="Chargement"
    >
      <Skeleton className="h-10 w-28 rounded-xl" />
      <Card>
        <CardHeader className="gap-2">
          <Skeleton className="h-7 w-52 rounded-lg" />
          <Skeleton className="h-4 w-64 max-w-full rounded-lg" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </CardContent>
      </Card>
      <Skeleton className="h-6 w-36 rounded-lg" />
      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </main>
  )
}
