import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LoginForm } from "./login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentProfile, HOME_BY_ROLE } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Connexion – Les Petits Pas",
}

export default async function LoginPage() {
  // Déjà connecté : on va directement dans son espace.
  const profile = await getCurrentProfile()
  if (profile) redirect(HOME_BY_ROLE[profile.role])

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Accédez à votre espace Les Petits Pas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
