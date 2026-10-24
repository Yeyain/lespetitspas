"use client"

import { FriendlyError } from "@/components/friendly-error"

// Affiché si le chargement échoue (bouton « Réessayer »).
export default function MessagesError(props: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <FriendlyError
      {...props}
      message="Nous n'arrivons pas à afficher vos messages pour le moment."
    />
  )
}
