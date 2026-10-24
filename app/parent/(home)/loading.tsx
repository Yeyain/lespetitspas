import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Squelettes affichés pendant le chargement de l'espace parent.
export default function Loading() {
  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:py-10"
      aria-busy="true"
      aria-label="Chargement"
    >
      <div className="flex flex-col gap-3 pr-14 sm:pr-48">
        <Skeleton className="h-9 w-56 rounded-xl" />
        <Skeleton className="h-5 w-72 max-w-full rounded-lg" />
      </div>
      <Skeleton className="h-14 w-full rounded-xl" />
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-6 w-40 rounded-lg" />
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </main>
  )
}
