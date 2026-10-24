import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/lib/supabase/database.types"

// Pages réservées aux personnes connectées.
const PROTECTED_PATHS = ["/staff", "/parent"]

// Le proxy (ex-« middleware ») s'exécute avant chaque page : il rafraîchit
// la session Supabase et réécrit les cookies, pour que la connexion survive
// à un rechargement de page.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          )
        },
      },
    }
  )

  // Ne rien mettre entre createServerClient et getClaims : c'est cet appel
  // qui rafraîchit la session.
  const { data } = await supabase.auth.getClaims()
  const isLoggedIn = Boolean(data?.claims)

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!isLoggedIn && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = ""
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  return response
}

export const config = {
  matcher: [
    // Toutes les pages, sauf les fichiers statiques et les images.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
