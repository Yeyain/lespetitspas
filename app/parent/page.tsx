import { requireRole } from "@/lib/auth"

export default async function ParentPage() {
  await requireRole("parent")

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl">Espace parent</h1>
    </main>
  )
}
