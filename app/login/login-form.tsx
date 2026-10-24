"use client"

import { useActionState } from "react"
import { CircleAlert } from "lucide-react"

import { login, type LoginState } from "./actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: LoginState = { error: null, email: "" }

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="mt-2">
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  )
}
