"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SECTION_ORDER, SECTIONS } from "@/lib/sections"
import type { Child, Section } from "@/lib/supabase/database.types"

type ChildItem = Pick<
  Child,
  "id" | "first_name" | "last_name" | "section" | "photo_url"
>
type Filter = Section | "tous"

// Minuscules et sans accents : « Élodie » devient « elodie ».
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

function initials(child: ChildItem) {
  return `${child.first_name.charAt(0)}${child.last_name.charAt(0)}`.toUpperCase()
}

export function ChildrenList({ items }: { items: ChildItem[] }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("tous")

  const visible = useMemo(() => {
    const q = normalize(query)
    return items.filter((child) => {
      if (filter !== "tous" && child.section !== filter) return false
      if (!q) return true
      const fullName = normalize(`${child.first_name} ${child.last_name}`)
      const reversed = normalize(`${child.last_name} ${child.first_name}`)
      return fullName.includes(q) || reversed.includes(q)
    })
  }, [items, query, filter])

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un enfant…"
            aria-label="Rechercher un enfant par son prénom ou son nom"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-11 text-base md:text-base"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="h-12 w-full rounded-xl bg-muted p-1 group-data-horizontal/tabs:h-12 sm:w-fit">
            <TabsTrigger value="tous" className="rounded-lg px-4">
              Tous
            </TabsTrigger>
            {SECTION_ORDER.map((section) => (
              <TabsTrigger key={section} value={section} className="rounded-lg px-4">
                {SECTIONS[section].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          Aucun enfant trouvé
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((child) => (
            <li key={child.id}>
              <Link
                href={`/staff/children/${child.id}`}
                className="block rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4">
                    <Avatar className="size-14">
                      {child.photo_url && (
                        <AvatarImage
                          src={child.photo_url}
                          alt={`${child.first_name} ${child.last_name}`}
                        />
                      )}
                      <AvatarFallback
                        className={`${SECTIONS[child.section].color} font-heading text-lg font-semibold text-foreground`}
                      >
                        {initials(child)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col items-start gap-1.5">
                      <p className="truncate font-heading text-lg font-semibold">
                        {child.first_name} {child.last_name}
                      </p>
                      <Badge
                        className={`${SECTIONS[child.section].color} text-foreground`}
                      >
                        {SECTIONS[child.section].label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
