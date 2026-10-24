"use client"

import { useEffect } from "react"
import { CloudRain, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Message d'erreur rassurant de l'espace parent, avec un bouton « Réessayer ».
// Utilisé par les fichiers error.tsx de l'espace parent.
export function FriendlyError({
  error,
  retry,
  message = "Nous n'arrivons pas à afficher la journée pour le moment.",
}: {
  error: Error & { digest?: string }
  retry: () => void
  message?: string
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:py-10">
      <Card className="mt-12">
        <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
          <CloudRain className="size-10 text-primary" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl">Oups, un petit souci de chargement</h1>
            <p className="max-w-sm text-muted-foreground">
              {message} Pas d&apos;inquiétude, vos informations sont en
              sécurité.
            </p>
          </div>
          <Button size="lg" onClick={() => retry()}>
            <RotateCw data-icon="inline-start" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
