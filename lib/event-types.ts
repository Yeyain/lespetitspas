import {
  Moon,
  Palette,
  Pill,
  TriangleAlert,
  Utensils,
  type LucideIcon,
} from "lucide-react"

import type { EventType, Json } from "@/lib/supabase/database.types"

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

// Résumé lisible du champ `details` (JSON), en attendant le formulaire de
// saisie qui fixera le contenu exact de chaque type.
export function summarizeDetails(details: Json): string | null {
  if (details === null || details === undefined) return null
  if (typeof details !== "object") return String(details)
  const values = Object.values(details).filter(
    (value) =>
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
  )
  return values.length > 0 ? values.join(" · ") : null
}
