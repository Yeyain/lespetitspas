"use server"

import { redirect } from "next/navigation"

import { HOME_BY_ROLE } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export type LoginState = { error: string | null; email: string }

const INVALID_CREDENTIALS = "Email ou mot de passe incorrect"

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: INVALID_CREDENTIALS, email }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: INVALID_CREDENTIALS, email }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  // Compte sans profil : on ne le laisse pas entrer.
  if (!profile) {
    await supabase.auth.signOut()
    return {
      error: "Votre compte n'est pas encore activé. Contactez la crèche.",
      email,
    }
  }

  redirect(HOME_BY_ROLE[profile.role])
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
