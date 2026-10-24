import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SECTIONS } from "@/lib/sections"
import type { Child } from "@/lib/supabase/database.types"

type Props = {
  child: Pick<Child, "first_name" | "last_name" | "section" | "photo_url">
  className?: string
  // Taille du texte des initiales, ex. "text-lg".
  textClassName?: string
}

// Photo de l'enfant, ou ses initiales dans un cercle à la couleur de sa section.
export function ChildAvatar({ child, className, textClassName }: Props) {
  const initials =
    `${child.first_name.charAt(0)}${child.last_name.charAt(0)}`.toUpperCase()

  return (
    <Avatar className={className}>
      {child.photo_url && (
        <AvatarImage
          src={child.photo_url}
          alt={`${child.first_name} ${child.last_name}`}
        />
      )}
      <AvatarFallback
        className={`${SECTIONS[child.section].color} font-heading font-semibold text-foreground ${textClassName ?? ""}`}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
