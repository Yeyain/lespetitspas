"use client"

import { useState, useTransition } from "react"
import { CircleAlert, Heart, Send } from "lucide-react"

import { sendMessage } from "./actions"
import { ChildAvatar } from "@/components/child-avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { MESSAGE_MAX_LENGTH } from "@/lib/messages"
import type { Child } from "@/lib/supabase/database.types"

type ChildOption = Pick<
  Child,
  "id" | "first_name" | "last_name" | "section" | "photo_url"
>

export function MessageForm({ childOptions }: { childOptions: ChildOption[] }) {
  // Un seul enfant : il est présélectionné.
  const [childId, setChildId] = useState(
    childOptions.length === 1 ? childOptions[0].id : ""
  )
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()

  const isEmpty = content.trim() === ""
  const canSend = !pending && childId !== "" && !isEmpty

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSend) return
    setError(null)
    setSent(false)
    startTransition(async () => {
      const result = await sendMessage(childId, content)
      if (result.ok) {
        setContent("")
        if (childOptions.length > 1) setChildId("")
        setSent(true)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {sent && (
        <Alert className="border-secondary bg-secondary/25">
          <Heart />
          <AlertDescription className="text-base font-medium text-foreground">
            Votre message a bien été transmis à l&apos;équipe
          </AlertDescription>
        </Alert>
      )}

      {childOptions.length > 1 && (
        <div className="flex flex-col gap-2">
          <span id="child-label">
            <Label className="text-base">Pour quel enfant ?</Label>
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={2}
            aria-labelledby="child-label"
            value={childId}
            onValueChange={(v) => v && setChildId(v)}
            className="flex w-full flex-wrap"
          >
            {childOptions.map((child) => (
              <ToggleGroupItem
                key={child.id}
                value={child.id}
                size="lg"
                className="flex-1 justify-start gap-3 px-3"
              >
                <ChildAvatar child={child} className="size-9" />
                {child.first_name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {childOptions.length === 1 && (
        <div className="flex items-center gap-3 text-muted-foreground">
          <ChildAvatar child={childOptions[0]} className="size-9" />
          <span>
            Message au sujet de{" "}
            <span className="font-medium text-foreground">
              {childOptions[0].first_name}
            </span>
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="message" className="text-base">
          Votre message
        </Label>
        <Textarea
          id="message"
          value={content}
          maxLength={MESSAGE_MAX_LENGTH}
          onChange={(e) => {
            setContent(e.target.value.slice(0, MESSAGE_MAX_LENGTH))
            setSent(false)
          }}
          placeholder="Une question, un changement d'horaire, une information sur la nuit…"
          className="min-h-32 text-base md:text-base"
          aria-describedby="message-counter"
        />
        <p
          id="message-counter"
          aria-live="polite"
          className={`self-end text-sm tabular-nums ${
            content.length >= MESSAGE_MAX_LENGTH
              ? "font-semibold text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {content.length} / {MESSAGE_MAX_LENGTH}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription className="text-base font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={!canSend}
        className="h-14 w-full text-base"
      >
        <Send data-icon="inline-start" />
        {pending ? "Envoi…" : "Envoyer"}
      </Button>
    </form>
  )
}
