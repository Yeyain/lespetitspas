import { Button } from "@/components/ui/button"

const sections = [
  { name: "Bébés", color: "bg-primary" },
  { name: "Moyens", color: "bg-secondary" },
  { name: "Grands", color: "bg-accent" },
]

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Bienvenue sur Les Petits Pas
        </h1>
        <p className="mt-3 text-muted-foreground">
          Le quotidien de votre enfant à la crèche, en un coup d&apos;œil.
        </p>

        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {sections.map((section) => (
            <li
              key={section.name}
              className={`${section.color} rounded-full px-4 py-1 text-sm font-medium text-foreground`}
            >
              {section.name}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg">Espace parents</Button>
          <Button size="lg" variant="secondary">
            Espace équipe
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Application développée par Sylvain G.
        </p>
      </div>
    </main>
  )
}
