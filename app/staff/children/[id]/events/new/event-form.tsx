"use client"

import { useId, useState, useTransition, type ReactNode } from "react"
import { CircleAlert, ShieldCheck } from "lucide-react"

import { createEvent } from "./actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  INCIDENT_GRAVITES,
  INCIDENT_TYPES,
  REPAS_MOMENTS,
  REPAS_QUALITES,
  SIESTE_QUALITES,
} from "@/lib/event-details"
import { EVENT_TYPES } from "@/lib/event-types"
import { sameMedication } from "@/lib/medication"
import type {
  EventType,
  MedicationAuthorization,
} from "@/lib/supabase/database.types"

type AuthorizationOption = Pick<
  MedicationAuthorization,
  "id" | "medication_name" | "dose"
>

const TYPE_ORDER: EventType[] = [
  "repas",
  "sieste",
  "activite",
  "medicament",
  "incident",
]

// Valeurs saisies, par type. Les clés sont celles de la colonne `details`.
type FormValues = {
  repas: { moment: string; qualite: string; note: string }
  sieste: { heure_debut: string; heure_fin: string; qualite: string; note: string }
  activite: { nom: string; note: string }
  medicament: {
    nom: string
    dose: string
    heure: string
    autorisation_confirmee: boolean
  }
  incident: { type: string; gravite: string; note: string }
}

function initialValues(now: string): FormValues {
  return {
    repas: { moment: "", qualite: "", note: "" },
    sieste: { heure_debut: "", heure_fin: "", qualite: "", note: "" },
    activite: { nom: "", note: "" },
    medicament: { nom: "", dose: "", heure: now, autorisation_confirmee: false },
    incident: { type: "", gravite: "", note: "" },
  }
}

// Formulaire de saisie d'un événement. L'enregistrement et toutes les
// vérifications sont refaits côté serveur (actions.ts).
export function EventForm({
  childId,
  now,
  authorizations,
}: {
  childId: string
  now: string
  // Autorisations de médicaments valides aujourd'hui pour cet enfant.
  authorizations: AuthorizationOption[]
}) {
  const [type, setType] = useState<EventType | null>(null)
  const [values, setValues] = useState<FormValues>(() => initialValues(now))
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  // Règle médicament, niveau 1 (écran). Le serveur revérifie tout (niveau 2).
  const med = values.medicament
  const hasAuthorization = authorizations.length > 0
  const nameCovered = authorizations.some((auth) =>
    sameMedication(auth.medication_name, med.nom)
  )
  const showNotCovered =
    hasAuthorization && med.nom.trim() !== "" && !nameCovered
  const medicationBlockReason = !hasAuthorization
    ? "Aucune autorisation parentale valide pour cet enfant"
    : !nameCovered
      ? "Saisissez un médicament couvert par une autorisation."
      : !med.autorisation_confirmee
        ? "Cochez « Autorisation parentale confirmée »."
        : null
  const saveDisabled =
    pending ||
    type === null ||
    (type === "medicament" && medicationBlockReason !== null)

  function update<T extends EventType>(t: T, patch: Partial<FormValues[T]>) {
    setValues((prev) => ({ ...prev, [t]: { ...prev[t], ...patch } }))
  }

  function chooseType(t: EventType) {
    setType(t)
    setError(null)
    setFieldErrors({})
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (saveDisabled || type === null) return
    startTransition(async () => {
      // En cas de succès, le serveur renvoie vers la fiche de l'enfant.
      const result = await createEvent(childId, type, values[type])
      if (result) {
        setError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
      }
    })
  }

  const err = (key: string) => fieldErrors[key]

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-heading text-lg font-semibold">
          Type d&apos;événement
        </legend>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={3}
          value={type ?? ""}
          // Un type reste toujours sélectionné une fois choisi.
          onValueChange={(v) => v && chooseType(v as EventType)}
          className="grid w-full grid-cols-2 sm:grid-cols-5"
        >
          {TYPE_ORDER.map((t) => {
            const Icon = EVENT_TYPES[t].icon
            return (
              <ToggleGroupItem
                key={t}
                value={t}
                className="h-20 w-full flex-col gap-1.5 text-base last:col-span-2 sm:last:col-span-1 [&_svg:not([class*='size-'])]:size-6"
              >
                <Icon />
                {EVENT_TYPES[t].label}
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      </fieldset>

      {type === null && (
        <p className="rounded-xl bg-muted/50 py-8 text-center text-muted-foreground">
          Choisissez un type pour afficher les champs.
        </p>
      )}

      {type === "repas" && (
        <div className="flex flex-col gap-6">
          <ChoiceField
            label="Moment"
            required
            error={err("moment")}
            options={REPAS_MOMENTS}
            value={values.repas.moment}
            onChange={(moment) => update("repas", { moment })}
          />
          <ChoiceField
            label="Qualité"
            required
            options={REPAS_QUALITES}
            error={err("qualite")}
            value={values.repas.qualite}
            onChange={(qualite) => update("repas", { qualite })}
          />
          <NoteField
            value={values.repas.note}
            error={err("note")}
            onChange={(note) => update("repas", { note })}
          />
        </div>
      )}

      {type === "sieste" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Heure de début" required error={err("heure_debut")}>
              {(id) => (
                <Input
                  id={id}
                  type="time"
                  required
                  value={values.sieste.heure_debut}
                  onChange={(e) =>
                    update("sieste", { heure_debut: e.target.value })
                  }
                />
              )}
            </Field>
            <Field label="Heure de fin" required error={err("heure_fin")}>
              {(id) => (
                <Input
                  id={id}
                  type="time"
                  required
                  value={values.sieste.heure_fin}
                  onChange={(e) =>
                    update("sieste", { heure_fin: e.target.value })
                  }
                />
              )}
            </Field>
          </div>
          <ChoiceField
            label="Qualité"
            options={SIESTE_QUALITES}
            error={err("qualite")}
            value={values.sieste.qualite}
            onChange={(qualite) => update("sieste", { qualite })}
          />
          <NoteField
            value={values.sieste.note}
            error={err("note")}
            onChange={(note) => update("sieste", { note })}
          />
        </div>
      )}

      {type === "activite" && (
        <div className="flex flex-col gap-6">
          <Field label="Nom de l'activité" required error={err("nom")}>
            {(id) => (
              <Input
                id={id}
                required
                placeholder="Ex. peinture, comptines…"
                value={values.activite.nom}
                onChange={(e) => update("activite", { nom: e.target.value })}
              />
            )}
          </Field>
          <NoteField
            value={values.activite.note}
            error={err("note")}
            onChange={(note) => update("activite", { note })}
          />
        </div>
      )}

      {type === "medicament" && (
        <div className="flex flex-col gap-6">
          {!hasAuthorization ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription className="text-base font-medium">
                Aucune autorisation parentale valide pour cet enfant
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-4" />
                Autorisé aujourd&apos;hui (touchez pour remplir) :
              </p>
              <div className="flex flex-wrap gap-2">
                {authorizations.map((auth) => (
                  <Button
                    key={auth.id}
                    type="button"
                    variant="outline"
                    onClick={() =>
                      update("medicament", {
                        nom: auth.medication_name,
                        dose: auth.dose,
                      })
                    }
                  >
                    {auth.medication_name} · {auth.dose}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Field label="Nom du médicament" required error={err("nom")}>
            {(id) => (
              <Input
                id={id}
                required
                aria-invalid={showNotCovered || undefined}
                value={med.nom}
                onChange={(e) => update("medicament", { nom: e.target.value })}
              />
            )}
          </Field>
          {showNotCovered && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription className="text-base font-medium">
                Ce médicament n&apos;est pas couvert par une autorisation
                parentale valide
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dose" required error={err("dose")}>
              {(id) => (
                <Input
                  id={id}
                  required
                  placeholder="Ex. 5 ml"
                  value={med.dose}
                  onChange={(e) =>
                    update("medicament", { dose: e.target.value })
                  }
                />
              )}
            </Field>
            <Field label="Heure" required error={err("heure")}>
              {(id) => (
                <Input
                  id={id}
                  type="time"
                  required
                  value={med.heure}
                  onChange={(e) =>
                    update("medicament", { heure: e.target.value })
                  }
                />
              )}
            </Field>
          </div>
          <Label className="flex cursor-pointer items-start gap-3 rounded-xl border border-input bg-card p-4 text-base font-normal has-data-checked:border-secondary has-data-checked:bg-secondary/20">
            <Checkbox
              required
              className="mt-0.5"
              checked={med.autorisation_confirmee}
              onCheckedChange={(checked) =>
                update("medicament", {
                  autorisation_confirmee: checked === true,
                })
              }
            />
            <span className="flex flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2 font-medium">
                Autorisation parentale confirmée
                <RequiredMark />
              </span>
              <span className="text-sm text-muted-foreground">
                Je confirme que les parents ont autorisé ce médicament.
              </span>
            </span>
          </Label>
          {err("autorisation_confirmee") && (
            <FieldError message={err("autorisation_confirmee")} />
          )}
        </div>
      )}

      {type === "incident" && (
        <div className="flex flex-col gap-6">
          <ChoiceField
            label="Type d'incident"
            required
            options={INCIDENT_TYPES}
            error={err("type")}
            value={values.incident.type}
            onChange={(t) => update("incident", { type: t })}
          />
          <ChoiceField
            label="Gravité"
            required
            options={INCIDENT_GRAVITES}
            error={err("gravite")}
            value={values.incident.gravite}
            onChange={(gravite) => update("incident", { gravite })}
          />
          <NoteField
            label="Description"
            required
            placeholder="Que s'est-il passé ? Qu'avez-vous fait ?"
            value={values.incident.note}
            error={err("note")}
            onChange={(note) => update("incident", { note })}
          />
        </div>
      )}

      {/* Toujours à portée de pouce sur téléphone. */}
      {error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription className="text-base font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="sticky bottom-4 z-10 flex flex-col gap-2">
        {type === "medicament" && medicationBlockReason && (
          <p
            id="save-blocked-reason"
            className="rounded-lg bg-card/90 px-3 py-1 text-center text-sm text-muted-foreground"
          >
            {medicationBlockReason}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={saveDisabled}
          aria-describedby={
            type === "medicament" && medicationBlockReason
              ? "save-blocked-reason"
              : undefined
          }
          className="h-14 w-full text-base shadow-md"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  )
}

function RequiredMark() {
  return (
    <span className="rounded-full bg-accent/30 px-2 py-0.5 text-xs font-medium text-foreground">
      Obligatoire
    </span>
  )
}

function FieldLabel({
  htmlFor,
  label,
  required,
}: {
  htmlFor?: string
  label: string
  required?: boolean
}) {
  return (
    <Label htmlFor={htmlFor} className="flex flex-wrap items-center gap-2 text-base">
      {label}
      {required && <RequiredMark />}
    </Label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="flex items-center gap-1.5 text-sm font-medium">
      <CircleAlert className="size-4 shrink-0 text-destructive" />
      {message}
    </p>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <div
      className={`flex flex-col gap-2 ${
        error ? "[&_input]:border-destructive [&_textarea]:border-destructive" : ""
      }`}
    >
      <FieldLabel htmlFor={id} label={label} required={required} />
      {children(id)}
      <FieldError message={error} />
    </div>
  )
}

function NoteField({
  label = "Note",
  required,
  placeholder = "Facultatif",
  value,
  error,
  onChange,
}: {
  label?: string
  required?: boolean
  placeholder?: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label} required={required} error={error}>
      {(id) => (
        <Textarea
          id={id}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  )
}

function ChoiceField({
  label,
  required,
  options,
  value,
  error,
  onChange,
}: {
  label: string
  required?: boolean
  options: readonly { value: string; label: string }[]
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  const labelId = useId()
  return (
    <div className="flex flex-col gap-2">
      <span id={labelId}>
        <FieldLabel label={label} required={required} />
      </span>
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={2}
        aria-labelledby={labelId}
        value={value}
        // Un champ obligatoire ne peut pas être « désélectionné ».
        onValueChange={(v) => (v || !required) && onChange(v)}
        className="flex w-full flex-wrap"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            size="lg"
            className="flex-1 basis-[calc(50%-0.25rem)] sm:basis-0"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <FieldError message={error} />
    </div>
  )
}
