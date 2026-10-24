import {
  Moon,
  Palette,
  Pill,
  TriangleAlert,
  Utensils,
  type LucideIcon,
} from "lucide-react"

import type { EventType } from "@/lib/supabase/database.types"

// Libellé, icône et couleur de la charte pour chaque type d'événement.
export const EVENT_TYPES: Record<
  EventType,
  { label: string; icon: LucideIcon; color: string }
> = {
  repas: { label: "Repas", icon: Utensils, color: "bg-secondary" },
  sieste: { label: "Sieste", icon: Moon, color: "bg-primary" },
  activite: { label: "Activité", icon: Palette, color: "bg-accent" },
  medicament: { label: "Médicament", icon: Pill, color: "bg-primary" },
  incident: { label: "Incident", icon: TriangleAlert, color: "bg-destructive" },
}
