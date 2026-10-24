// La crèche vit à l'heure de Paris, quel que soit le fuseau du serveur.
export const TIME_ZONE = "Europe/Paris"

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// Date du jour à Paris, au format AAAA-MM-JJ.
export function todayInParis(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(
    new Date()
  )
}

// Vérifie qu'une valeur reçue dans l'adresse est bien une date AAAA-MM-JJ.
export function isValidDay(value: unknown): value is string {
  if (typeof value !== "string" || !DAY_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

// Ajoute (ou retire) des jours à une date AAAA-MM-JJ.
export function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + amount)
  return date.toISOString().slice(0, 10)
}

// Décalage horaire de Paris (ex. "+02:00") à un instant donné.
function parisOffset(at: Date): string {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    timeZoneName: "longOffset",
  })
    .formatToParts(at)
    .find((part) => part.type === "timeZoneName")?.value
  const offset = name?.replace("GMT", "")
  return offset || "+00:00"
}

// Début et fin (exclue) d'une journée à Paris, en dates ISO pour la base.
export function parisDayRange(day: string): { start: string; end: string } {
  const toIso = (d: string) => {
    // Les changements d'heure ont lieu la nuit : le décalage à minuit (UTC)
    // est le bon pour le début de la journée parisienne.
    const midnight = new Date(`${d}T00:00:00Z`)
    return new Date(`${d}T00:00:00${parisOffset(midnight)}`).toISOString()
  }
  return { start: toIso(day), end: toIso(addDays(day, 1)) }
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

// "jeudi 24 octobre 2026"
export function formatLongDay(day: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${day}T00:00:00Z`))
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

// Vérifie une heure au format HH:MM.
export function isValidTime(value: unknown): value is string {
  return typeof value === "string" && TIME_PATTERN.test(value)
}

// Date ISO correspondant à un jour (AAAA-MM-JJ) et une heure (HH:MM) à Paris.
export function parisTimeToIso(day: string, time: string): string {
  const guess = new Date(`${day}T${time}:00Z`)
  return new Date(`${day}T${time}:00${parisOffset(guess)}`).toISOString()
}
