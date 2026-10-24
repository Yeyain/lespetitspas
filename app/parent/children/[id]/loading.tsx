import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Squelettes affichés pendant le chargement de la journée de l'enfant.
export default function Loading() {
  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:py-10"
      aria-busy="true"
      aria-label="Chargement"
    >
      <Skeleton className="h-10 w-28 rounded-xl" />
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>
      <Card>
        <CardHeader className="gap-2">
          <Skeleton className="h-6 w-44 rounded-lg" />
          <Skeleton className="h-4 w-56 rounded-lg" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="mb-3 h-10 w-64 max-w-full rounded-xl" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
