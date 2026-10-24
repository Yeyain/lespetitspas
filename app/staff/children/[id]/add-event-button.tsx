"use client"

import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

// Provisoire : le formulaire de saisie sera construit à l'étape suivante.
export function AddEventButton() {
  return (
    <Button size="lg" onClick={() => toast("Bientôt disponible")}>
      <Plus data-icon="inline-start" />
      Ajouter un événement
    </Button>
  )
}
