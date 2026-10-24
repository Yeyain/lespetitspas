import { requireRole } from "@/lib/auth"

export default async function StaffPage() {
  await requireRole("staff")

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl">Espace staff</h1>
    </main>
  )
}
