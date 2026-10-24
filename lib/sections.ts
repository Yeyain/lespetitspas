import type { Section } from "@/lib/supabase/database.types"

// Libellé affiché et couleur de la charte pour chaque section.
export const SECTIONS: Record<Section, { label: string; color: string }> = {
  bebes: { label: "Bébés", color: "bg-primary" },
  moyens: { label: "Moyens", color: "bg-secondary" },
  grands: { label: "Grands", color: "bg-accent" },
}

export const SECTION_ORDER: Section[] = ["bebes", "moyens", "grands"]
