import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/auth"

// Page provisoire : le formulaire sera construit à l'étape suivante.
export default async function NewMessagePage() {
  await requireRole("parent")

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <Button asChild variant="ghost" className="-ml-3">
        <Link href="/parent">
          <ArrowLeft data-icon="inline-start" />
          Retour
        </Link>
      </Button>
      <h1 className="mt-4 text-3xl">Nouveau message</h1>
    </main>
  )
}
