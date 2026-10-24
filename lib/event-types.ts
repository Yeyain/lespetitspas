import {
  Moon,
  Palette,
  Pill,
  TriangleAlert,
  Utensils,
  type LucideIcon,
} from "lucide-react"

import type { EventType } from "@/lib/supabase/database.types"

// Libellé, icône et couleurs de la charte pour chaque type d'événement :
// `color` pour la pastille de l'icône, `accent` pour le liseré de la carte.
// Chaque type a sa couleur, mais le libellé reste toujours écrit.
export const EVENT_TYPES: Record<
  EventType,
  { label: string; icon: LucideIcon; color: string; accent: string }
> = {
  repas: {
    label: "Repas",
    icon: Utensils,
    color: "bg-secondary",
    accent: "border-l-secondary",
  },
  sieste: {
    label: "Sieste",
    icon: Moon,
    color: "bg-primary",
    accent: "border-l-primary",
  },
  activite: {
    label: "Activité",
    icon: Palette,
    color: "bg-accent",
    accent: "border-l-accent",
  },
  medicament: {
    label: "Médicament",
    icon: Pill,
    color: "bg-muted-foreground/30",
    accent: "border-l-muted-foreground",
  },
  incident: {
    label: "Incident",
    icon: TriangleAlert,
    color: "bg-destructive",
    accent: "border-l-destructive",
  },
}
