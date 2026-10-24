import type { LucideIcon } from "lucide-react"

// État vide doux : une icône dans une pastille aux couleurs de la charte,
// un titre et une courte phrase rassurante.
export function EmptyState({
  icon: Icon,
  iconClassName = "bg-secondary/40",
  title,
  description,
  className = "",
}: {
  icon: LucideIcon
  // Couleur de la pastille, ex. "bg-primary/40".
  iconClassName?: string
  title: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center ${className}`}
    >
      <div
        className={`flex size-14 items-center justify-center rounded-full ${iconClassName}`}
        aria-hidden
      >
        <Icon className="size-7" />
      </div>
      <p className="max-w-sm font-heading text-lg font-semibold text-balance">
        {title}
      </p>
      {description && (
        <p className="max-w-sm text-muted-foreground text-balance">
          {description}
        </p>
      )}
    </div>
  )
}
