// Contenu de la colonne `details` (JSON) de la table events, pour chaque type.
// Les clés et les valeurs sont sans accents ; les libellés servent à l'affichage.

export const REPAS_MOMENTS = [
  { value: "matin", label: "Matin" },
  { value: "midi", label: "Midi" },
  { value: "gouter", label: "Goûter" },
] as const

export const REPAS_QUALITES = [
  { value: "tout", label: "Tout" },
  { value: "moitie", label: "Moitié" },
  { value: "peu", label: "Peu" },
  { value: "rien", label: "Rien" },
] as const

export const SIESTE_QUALITES = [
  { value: "calme", label: "Calme" },
  { value: "agitee", label: "Agitée" },
  { value: "reveil_precoce", label: "Réveil précoce" },
] as const

export const INCIDENT_TYPES = [
  { value: "chute", label: "Chute" },
  { value: "morsure", label: "Morsure" },
  { value: "fievre", label: "Fièvre" },
  { value: "autre", label: "Autre" },
] as const

export const INCIDENT_GRAVITES = [
  { value: "leger", label: "Léger" },
  { value: "modere", label: "Modéré" },
  { value: "urgent", label: "Urgent" },
] as const

type ValueOf<T extends readonly { value: string }[]> = T[number]["value"]

export type RepasDetails = {
  moment: ValueOf<typeof REPAS_MOMENTS>
  qualite: ValueOf<typeof REPAS_QUALITES>
  note?: string
}

export type SiesteDetails = {
  heure_debut: string // "HH:MM"
  heure_fin: string // "HH:MM"
  qualite?: ValueOf<typeof SIESTE_QUALITES>
  note?: string
}

export type ActiviteDetails = {
  nom: string
  note?: string
}

export type MedicamentDetails = {
  nom: string
  dose: string
  heure: string // "HH:MM"
  autorisation_confirmee: true
}

export type IncidentDetails = {
  type: ValueOf<typeof INCIDENT_TYPES>
  gravite: ValueOf<typeof INCIDENT_GRAVITES>
  note: string
}

type Option = { value: string; label: string }

function labelOf(options: readonly Option[], value: unknown): string | null {
  return options.find((o) => o.value === value)?.label ?? null
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

// Lignes lisibles (« Qualité : Moitié ») pour afficher les détails d'un événement.
export function describeDetails(
  type: string,
  details: unknown
): { label: string; value: string }[] {
  const d =
    details && typeof details === "object" && !Array.isArray(details)
      ? (details as Record<string, unknown>)
      : {}
  const lines: { label: string; value: string | null }[] = []

  switch (type) {
    case "repas":
      lines.push(
        { label: "Moment", value: labelOf(REPAS_MOMENTS, d.moment) },
        { label: "Qualité", value: labelOf(REPAS_QUALITES, d.qualite) }
      )
      break
    case "sieste":
      lines.push(
        {
          label: "Horaires",
          value:
            text(d.heure_debut) && text(d.heure_fin)
              ? `${d.heure_debut} – ${d.heure_fin}`
              : text(d.heure_debut),
        },
        { label: "Qualité", value: labelOf(SIESTE_QUALITES, d.qualite) }
      )
      break
    case "activite":
      lines.push({ label: "Activité", value: text(d.nom) })
      break
    case "medicament":
      lines.push(
        { label: "Médicament", value: text(d.nom) },
        { label: "Dose", value: text(d.dose) }
      )
      break
    case "incident":
      lines.push(
        { label: "Type", value: labelOf(INCIDENT_TYPES, d.type) },
        { label: "Gravité", value: labelOf(INCIDENT_GRAVITES, d.gravite) }
      )
      break
  }
  lines.push({ label: type === "incident" ? "Description" : "Note", value: text(d.note) })

  return lines.filter(
    (line): line is { label: string; value: string } => line.value !== null
  )
}
