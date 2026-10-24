"use server"

import { redirect } from "next/navigation"

import { findValidAuthorization } from "@/lib/actions/medication-authorization"
import { getCurrentProfile } from "@/lib/auth"
import { isValidTime, parisTimeToIso, todayInParis } from "@/lib/dates"
import {
  INCIDENT_GRAVITES,
  INCIDENT_TYPES,
  REPAS_MOMENTS,
  REPAS_QUALITES,
  SIESTE_QUALITES,
  type ActiviteDetails,
  type IncidentDetails,
  type MedicamentDetails,
  type RepasDetails,
  type SiesteDetails,
} from "@/lib/event-details"
import { createClient } from "@/lib/supabase/server"
import type { EventType, Json } from "@/lib/supabase/database.types"

export type SaveEventResult = {
  error: string
  // Erreurs par champ, avec les mêmes clés que `details`.
  fieldErrors?: Record<string, string>
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_NOTE = 1000
const MAX_NAME = 100

type Parsed<T> =
  | { ok: true; details: T; occurredAt: string }
  | { ok: false; fieldErrors: Record<string, string> }

// Petits outils de lecture : tout ce qui vient du navigateur est « unknown ».
function readText(input: Record<string, unknown>, key: string): string {
  const value = input[key]
  return typeof value === "string" ? value.trim() : ""
}

function readChoice<T extends string>(
  input: Record<string, unknown>,
  key: string,
  options: readonly { value: T }[]
): T | null {
  const value = input[key]
  return options.find((o) => o.value === value)?.value ?? null
}

function checkNote(
  note: string,
  errors: Record<string, string>,
  required = false
) {
  if (required && !note) errors.note = "La description est obligatoire."
  else if (note.length > MAX_NOTE)
    errors.note = `La note ne doit pas dépasser ${MAX_NOTE} caractères.`
}

function checkName(name: string, key: string, errors: Record<string, string>, label: string) {
  if (!name) errors[key] = `${label} est obligatoire.`
  else if (name.length > MAX_NAME)
    errors[key] = `${label} ne doit pas dépasser ${MAX_NAME} caractères.`
}

function parseRepas(input: Record<string, unknown>): Parsed<RepasDetails> {
  const errors: Record<string, string> = {}
  const moment = readChoice(input, "moment", REPAS_MOMENTS)
  const qualite = readChoice(input, "qualite", REPAS_QUALITES)
  const note = readText(input, "note")
  if (!moment) errors.moment = "Choisissez le moment du repas."
  if (!qualite) errors.qualite = "Choisissez ce que l'enfant a mangé."
  checkNote(note, errors)
  if (!moment || !qualite || Object.keys(errors).length > 0)
    return { ok: false, fieldErrors: errors }
  return {
    ok: true,
    details: { moment, qualite, ...(note && { note }) },
    occurredAt: new Date().toISOString(),
  }
}

function parseSieste(input: Record<string, unknown>, today: string): Parsed<SiesteDetails> {
  const errors: Record<string, string> = {}
  const heureDebut = readText(input, "heure_debut")
  const heureFin = readText(input, "heure_fin")
  const qualiteRaw = readText(input, "qualite")
  const qualite = readChoice(input, "qualite", SIESTE_QUALITES)
  const note = readText(input, "note")
  if (!isValidTime(heureDebut)) errors.heure_debut = "Indiquez l'heure de début."
  if (!isValidTime(heureFin)) errors.heure_fin = "Indiquez l'heure de fin."
  else if (isValidTime(heureDebut) && heureFin <= heureDebut)
    errors.heure_fin = "L'heure de fin doit être après l'heure de début."
  if (qualiteRaw && !qualite) errors.qualite = "Qualité de sieste inconnue."
  checkNote(note, errors)
  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors }
  return {
    ok: true,
    details: {
      heure_debut: heureDebut,
      heure_fin: heureFin,
      ...(qualite && { qualite }),
      ...(note && { note }),
    },
    occurredAt: parisTimeToIso(today, heureDebut),
  }
}

function parseActivite(input: Record<string, unknown>): Parsed<ActiviteDetails> {
  const errors: Record<string, string> = {}
  const nom = readText(input, "nom")
  const note = readText(input, "note")
  checkName(nom, "nom", errors, "Le nom de l'activité")
  checkNote(note, errors)
  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors }
  return {
    ok: true,
    details: { nom, ...(note && { note }) },
    occurredAt: new Date().toISOString(),
  }
}

function parseMedicament(
  input: Record<string, unknown>,
  today: string
): Parsed<MedicamentDetails> {
  const errors: Record<string, string> = {}
  const nom = readText(input, "nom")
  const dose = readText(input, "dose")
  const heure = readText(input, "heure")
  checkName(nom, "nom", errors, "Le nom du médicament")
  checkName(dose, "dose", errors, "La dose")
  if (!isValidTime(heure)) errors.heure = "Indiquez l'heure d'administration."
  if (input.autorisation_confirmee !== true)
    errors.autorisation_confirmee =
      "Cochez « Autorisation parentale confirmée »."
  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors }
  return {
    ok: true,
    details: { nom, dose, heure, autorisation_confirmee: true },
    occurredAt: parisTimeToIso(today, heure),
  }
}

function parseIncident(input: Record<string, unknown>): Parsed<IncidentDetails> {
  const errors: Record<string, string> = {}
  const type = readChoice(input, "type", INCIDENT_TYPES)
  const gravite = readChoice(input, "gravite", INCIDENT_GRAVITES)
  const note = readText(input, "note")
  if (!type) errors.type = "Choisissez le type d'incident."
  if (!gravite) errors.gravite = "Choisissez la gravité."
  checkNote(note, errors, true)
  if (!type || !gravite || Object.keys(errors).length > 0)
    return { ok: false, fieldErrors: errors }
  return {
    ok: true,
    details: { type, gravite, note },
    occurredAt: new Date().toISOString(),
  }
}

// Enregistre un événement pour un enfant. En cas de succès, renvoie vers la
// fiche de l'enfant ; sinon, renvoie un message d'erreur (rien n'est enregistré).
export async function createEvent(
  childId: unknown,
  eventType: unknown,
  input: unknown
): Promise<SaveEventResult> {
  // 1. Seul le staff connecté peut enregistrer (vérifié ici, côté serveur).
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "staff") {
    return { error: "Action réservée à l'équipe de la crèche." }
  }

  if (typeof childId !== "string" || !UUID_PATTERN.test(childId)) {
    return { error: "Enfant inconnu." }
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Formulaire invalide." }
  }
  const fields = input as Record<string, unknown>

  // 2. Validation des champs du type choisi.
  const today = todayInParis()
  let parsed: Parsed<object>
  switch (eventType as EventType) {
    case "repas":
      parsed = parseRepas(fields)
      break
    case "sieste":
      parsed = parseSieste(fields, today)
      break
    case "activite":
      parsed = parseActivite(fields)
      break
    case "medicament":
      parsed = parseMedicament(fields, today)
      break
    case "incident":
      parsed = parseIncident(fields)
      break
    default:
      return { error: "Choisissez un type d'événement." }
  }
  if (!parsed.ok) {
    return {
      error: "Certains champs sont à corriger.",
      fieldErrors: parsed.fieldErrors,
    }
  }

  const supabase = await createClient()

  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("id", childId)
    .maybeSingle()
  if (!child) return { error: "Enfant inconnu." }

  // 3. Médicament : règle critique, l'autorisation est revérifiée en base.
  let authorizationId: string | null = null
  if (eventType === "medicament") {
    const check = await findValidAuthorization(
      childId,
      (parsed.details as MedicamentDetails).nom,
      today
    )
    if (!check.ok) return { error: check.error }
    authorizationId = check.authorizationId
  }

  // 4. Enregistrement : l'auteur est toujours la personne connectée.
  const { error } = await supabase.from("events").insert({
    child_id: childId,
    type: eventType as EventType,
    occurred_at: parsed.occurredAt,
    details: parsed.details as Json,
    created_by: profile.id,
    authorization_id: authorizationId,
  })

  if (error) {
    return { error: "L'enregistrement a échoué. Réessayez." }
  }

  redirect(`/staff/children/${childId}`)
}
